import React, { useState, useEffect } from "react";
import UserInput from "./UserInput_sj";
import UserOutput from "./UserOutput_sj";
import ChartOutput from "./ChartOutput_sj";
import "./globals.css";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState({});
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState("input"); // "input" | "loading" | "result"

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const APIurl =
    "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";

  // 금감원 API 로컬 캐시 적용
  useEffect(() => {
    const cached = localStorage.getItem("finProducts");
    if (cached) {
      const parsed = JSON.parse(cached);
      setProducts(parsed.products);
      setOptions(parsed.options);
      console.log("✅ 금감원 API 로컬 캐시 사용");
      return;
    }

    fetch(APIurl)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setProducts(data.result.baseList);
          setOptions(data.result.optionList);
          localStorage.setItem("finProducts", JSON.stringify({ products: data.result.baseList, options: data.result.optionList }));
          console.log("📡 금감원 API 새로 호출 및 저장");
        }
      });
  }, []);

  // 추천 결과 나오면 전체 선택 + 각 상품 기본 만기(최고금리 기준)로 초기화
  useEffect(() => {
    if (recommended.length) {
      setSelected(recommended);
      const initTerms = {};
      recommended.forEach((code) => {
        const productOptions = options.filter((o) => o.fin_prdt_cd === code);
        const maxOpt = productOptions.reduce(
          (prev, curr) => (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev, {}
        );
        if (maxOpt.save_trm) initTerms[code] = parseInt(maxOpt.save_trm);
      });
      setSelectedTerms(initTerms);
    }
  }, [recommended, options]);

  //  체크박스 및 만기 버튼 토글
  const handleToggle = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  const handleTermChange = (code, trm) => setSelectedTerms((prev) => ({ ...prev, [code]: trm }));

  // 추천 실행
  const handleUserSubmit = async (formData) => {
    setStep("loading"); // 로딩 애니메이션 켜기
    setUserData(formData);

    // AI 추천 로컬 캐시 (토큰 절약의 핵심!)
    const CACHE_TTL = 1000 * 60 * 60; // 1시간
    const cacheKey = "recommend_" + btoa(encodeURIComponent(JSON.stringify(formData)));
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        console.log("✅ AI 추천 로컬 캐시 사용 (토큰 소모 0!)");
        setRecommended(parsed.data);
        setStep("result");
        return;
      }
    }

    try {
      const minTrm = formData.minMaturity ? Number(formData.minMaturity) : null;
      const maxTrm = formData.maxMaturity ? Number(formData.maxMaturity) : null;

      // 사전 필터링 및 토큰 다이어트
      const filteredProducts = products.filter((p) => {
        const productOptions = options.filter((o) => o.fin_prdt_cd === p.fin_prdt_cd);
        
        // 만기 기간 필터링
        const hasValidTrm = productOptions.some((o) => {
          const trm = parseInt(o.save_trm);
          const aboveMin = minTrm ? trm >= minTrm : true;
          const belowMax = maxTrm ? trm <= maxTrm : true;
          return aboveMin && belowMax;
        });

        // 가입 한도 필터링 
        const isWithinLimit = !p.max_limit || ((Number(formData.saving || 0)*10000) <= Number(p.max_limit));

        return hasValidTrm && isWithinLimit;
      });

      if (filteredProducts.length === 0) {
        alert(`입력하신 조건(월 저축액 또는 희망 만기)에 맞는 상품이 없습니다 😢\n조건을 조정해보세요!`);
        setStep("input");
        return;
      }

      // 토큰 다이어트 
      const simplifiedProducts = filteredProducts.slice(0, 20).map(p => ({
        cd: p.fin_prdt_cd,
        nm: p.fin_prdt_nm,
        bank: p.kor_co_nm,
        cond: p.spcl_cnd ? p.spcl_cnd.substring(0, 100) : "없음",
        target: p.join_member
      }));

      const prompt = `
        사용자 정보: ${JSON.stringify(formData)}
        상품 목록: ${JSON.stringify(simplifiedProducts)}
        조건: 위 목록의 'cd' 필드 값(상품 코드)만 추출하여 반드시 ["코드1", "코드2"] 형식의 JSON 배열로만 6개 응답.
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
      if (!data.choices) throw new Error("API 오류");

      if (data.usage) {
        console.log("--- 💡 실시간 토큰 사용량 ---");
        console.log(`입력(Prompt): ${data.usage.prompt_tokens}`);
        console.log(`출력(Completion): ${data.usage.completion_tokens}`);
        console.log(`총합(Total): ${data.usage.total_tokens}`);
      }

      //  답변 정제 및 파싱 에러 방지 (강제 6개 자르기)
      let text = data.choices[0].message.content;
      const cleanedText = text.replace(/```json|```/g, "").trim();
      
      const result = JSON.parse(cleanedText).slice(0, 6);
      
      setRecommended(result);
      localStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() }));
      setStep("result"); // 결과 화면으로 전환

    } catch (err) {
      console.error("추천 로직 에러:", err);
      alert("데이터 처리 중 오류가 발생했습니다.");
      setStep("input");
    }
  };

  //체크된 상품 + 선택된 만기 기준으로 그래프 데이터 생성
  const chartProducts = products
    .filter((p) => selected.includes(p.fin_prdt_cd))
    .map((p) => {
      const productOptions = options.filter((o) => o.fin_prdt_cd === p.fin_prdt_cd);
      const selectedTrm = selectedTerms[p.fin_prdt_cd];
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

  // 렌더링 영역 
  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background, #FFF9F0)", gap: "16px" }}>
        {/* 돼지 잠자는 SVG */}
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
        <p style={{ fontSize: "15px", color: "var(--muted-foreground, #7A7A7A)", fontWeight: "500" }}>돼지가 상품을 고르는 중...</p>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div style={{ backgroundColor: "var(--background, #FFF9F0)", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px 0" }}>
          <button
            onClick={() => { setRecommended([]); setSelected([]); setSelectedTerms({}); setUserData(null); setStep("input"); }}
            style={{ backgroundColor: "transparent", border: "2px solid var(--border, #E8D4C0)", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", color: "var(--foreground, #3D3D3D)", cursor: "pointer" }}
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

  return (
    <div style={{ backgroundColor: "var(--background, #FFF9F0)", minHeight: "100vh" }}>
      <UserInput onSubmit={handleUserSubmit} />
    </div>
  );
}

export default App;