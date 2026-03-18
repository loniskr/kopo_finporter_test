import React, { useState, useEffect } from "react";
import UserInput from "./UserInput";
import UserOutput from "./UserOutput";
import ChartOutput from "./ChartOutput";
import "./globals.css";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState({}); // { fin_prdt_cd: save_trm }
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState("input"); // "input" | "loading" | "result"

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const APIurl =
    "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";

  useEffect(() => {
    fetch(APIurl)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.result.baseList);
        setOptions(data.result.optionList);
      });
  }, []);

  // 추천 결과 나오면 전체 선택 + 각 상품 기본 만기(최고금리 기준)로 초기화
  useEffect(() => {
    if (recommended.length) {
      setSelected(recommended);

      // 각 상품의 기본 선택 만기: 최고금리 옵션의 save_trm
      const initTerms = {};
      recommended.forEach((code) => {
        const productOptions = options.filter((o) => o.fin_prdt_cd === code);
        const maxOpt = productOptions.reduce(
          (prev, curr) => (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev,
          {}
        );
        if (maxOpt.save_trm) {
          initTerms[code] = parseInt(maxOpt.save_trm);
        }
      });
      setSelectedTerms(initTerms);
    }
  }, [recommended, options]);

  // 체크박스 토글
  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // 만기 버튼 선택
  const handleTermChange = (code, trm) => {
    setSelectedTerms((prev) => ({ ...prev, [code]: trm }));
  };

  // 추천
  const handleUserSubmit = async (formData) => {
    setStep("loading");
    setUserData(formData);
    try {
      const minTrm = formData.minMaturity ? Number(formData.minMaturity) : null;
      const maxTrm = formData.maxMaturity ? Number(formData.maxMaturity) : null;

      // 만기 범위 내 옵션만 필터링해서 GPT에 전달
      const filteredProducts = products.slice(0, 20).map((p) => {
        const productOptions = options
          .filter((o) => o.fin_prdt_cd === p.fin_prdt_cd)
          .filter((o) => {
            const trm = parseInt(o.save_trm);
            const aboveMin = minTrm ? trm >= minTrm : true;
            const belowMax = maxTrm ? trm <= maxTrm : true;
            return aboveMin && belowMax;
          });
        return { ...p, options: productOptions };
      }).filter((p) => p.options.length > 0);

      const prompt = `
사용자 정보:
${JSON.stringify(formData)}

금융상품 목록 (희망 만기 범위 내 옵션만 포함된 상품):
${JSON.stringify(filteredProducts)}

조건:
- 위 목록에서 사용자에게 가장 적합한 상품 최대 6개 선택
- fin_prdt_cd만 배열로 반환
- 설명 금지

예:
["코드1","코드2"]
`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();

      if (!data.choices) {
        alert("API 오류");
        setStep("input");
        return;
      }

      const result = JSON.parse(data.choices[0].message.content);
      console.log("GPT 추천 결과:", result);

      // GPT 결과에서 만기 범위 벗어나는 상품 JS에서 한번 더 필터링
      const validResult = result.filter((code) => {
        if (!minTrm && !maxTrm) return true;

        const productOptions = options.filter((o) => o.fin_prdt_cd === code);
        console.log(`상품 ${code} 옵션 만기:`, productOptions.map((o) => o.save_trm));

        const hasValidTrm = productOptions.some((o) => {
          const trm = parseInt(o.save_trm);
          const aboveMin = minTrm ? trm >= minTrm : true;
          const belowMax = maxTrm ? trm <= maxTrm : true;
          return aboveMin && belowMax;
        });

        console.log(`상품 ${code} 만기 범위(${minTrm}~${maxTrm}) 통과:`, hasValidTrm);
        return hasValidTrm;
      });

      console.log("최종 필터링 결과:", validResult);

      if (validResult.length === 0) {
        alert(`희망 만기 기간(${minTrm ?? ""}~${maxTrm ?? ""}개월) 내에 해당하는 상품이 없어요 😢\n만기 범위를 조정해보세요!`);
        setStep("input");
        return;
      }

      setRecommended(validResult);
      setStep("result");
    } catch (err) {
      console.error(err);
      setStep("input");
    }
  };

  // 체크된 상품 + 선택된 만기 기준으로 그래프 데이터 생성
  const chartProducts = products
    .filter((p) => selected.includes(p.fin_prdt_cd))
    .map((p) => {
      const productOptions = options.filter((o) => o.fin_prdt_cd === p.fin_prdt_cd);
      const selectedTrm = selectedTerms[p.fin_prdt_cd];

      // 선택된 만기 옵션 사용, 없으면 최고금리 옵션
      const targetOpt = selectedTrm
        ? productOptions.find((o) => parseInt(o.save_trm) === selectedTrm) ||
          productOptions.reduce((prev, curr) => (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev, {})
        : productOptions.reduce((prev, curr) => (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev, {});

      return {
        id: p.fin_prdt_cd,
        name: p.fin_prdt_nm,
        period: parseInt(targetOpt.save_trm || 12),
        rate: parseFloat(targetOpt.intr_rate2 || 0),
      };
    });

  // 로딩 화면
  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background, #FFF9F0)",
        gap: "16px",
      }}>
        <svg width="80" height="60" viewBox="0 0 200 118" fill="none">
          <ellipse cx="100" cy="66" rx="62" ry="52" fill="#FFAEC9"/>
          <ellipse cx="50" cy="32" rx="15" ry="22" fill="#FFAEC9" transform="rotate(-20 50 32)"/>
          <ellipse cx="150" cy="32" rx="15" ry="22" fill="#FFAEC9" transform="rotate(20 150 32)"/>
          <path d="M 65 62 Q 72 67 79 62" stroke="#222" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M 121 62 Q 128 67 135 62" stroke="#222" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <ellipse cx="108" cy="92" rx="7" ry="9" fill="#87CEEB" opacity="0.85"/>
          <text x="140" y="32" fill="#ccc" fontSize="13" fontWeight="bold">z</text>
          <text x="150" y="21" fill="#ccc" fontSize="15" fontWeight="bold">z</text>
          <text x="162" y="10" fill="#ccc" fontSize="17" fontWeight="bold">z</text>
          <ellipse cx="100" cy="80" rx="17" ry="13" fill="#E6739F"/>
          <ellipse cx="93" cy="80" rx="4" ry="5" fill="#111"/>
          <ellipse cx="107" cy="80" rx="4" ry="5" fill="#111"/>
          <path d="M 21,118 A 20,20 0 0,1 61,118 Z" fill="#FFAEC9"/>
          <path d="M 139,118 A 20,20 0 0,1 179,118 Z" fill="#FFAEC9"/>
        </svg>
        <p style={{
          fontSize: "15px",
          color: "var(--muted-foreground, #7A7A7A)",
          fontWeight: "500",
        }}>
          돼지가 상품을 고르는 중...
        </p>
      </div>
    );
  }

  // 결과 화면
  if (step === "result") {
    return (
      <div style={{ backgroundColor: "var(--background, #FFF9F0)", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px 0" }}>
          <button
            onClick={() => { setRecommended([]); setSelected([]); setSelectedTerms({}); setUserData(null); setStep("input"); }}
            style={{
              backgroundColor: "transparent",
              border: "2px solid var(--border, #E8D4C0)",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              color: "var(--foreground, #3D3D3D)",
              cursor: "pointer",
            }}
          >
            ← 다시 입력하기
          </button>
        </div>

        <UserOutput
          recommendedCodes={recommended}
          products={products}
          options={options}
          selected={selected}
          onToggle={handleToggle}
          selectedTerms={selectedTerms}
          onTermChange={handleTermChange}
        />

        <ChartOutput chartProducts={chartProducts} />
      </div>
    );
  }

  // 입력 화면
  return (
    <div style={{ backgroundColor: "var(--background, #FFF9F0)", minHeight: "100vh" }}>
      <UserInput onSubmit={handleUserSubmit} />
    </div>
  );
}

export default App;