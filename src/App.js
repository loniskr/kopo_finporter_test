import React, { useState, useEffect } from "react";
import FinancialInput from "./components/FinancialInput";
import ChartOutput from "./ChartOutput";
// import UserOutput from "./UserOutput";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const APIurl = "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";



  
  useEffect(() => {
    // 1. 금감원 API 로컬 캐시
    const cached = localStorage.getItem("finProducts");
    if (cached) {
      const parsed = JSON.parse(cached);
      setProducts(parsed.products);
      setOptions(parsed.options);
      console.log("✅ 금감원 API 로컬 캐시 사용");
      return;
    }

    fetch(APIurl)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          const fetchedProducts = data.result.baseList;
          const fetchedOptions = data.result.optionList;
          setProducts(data.result.baseList);
          setOptions(data.result.optionList);
          localStorage.setItem("finProducts", JSON.stringify({ products: fetchedProducts, options: fetchedOptions }));
          console.log("📡 금감원 API 새로 호출 및 저장");
        }
      })
      .catch(err => console.error("금감원 API 데이터 로드 실패:", err));
  }, []);

// 2. FinancialInput에서 전달된 데이터를 받아 OpenAI 추천 실행
  const handleUserSubmit = async (userData) => {
    const CACHE_TTL = 1000 * 60 * 60; // 1시간
    const cacheKey = "recommend_" + btoa(encodeURIComponent(JSON.stringify(userData)));
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        console.log("AI 추천 로컬 캐시 사용");
        setRecommended(parsed.data);
        return;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const OPENAI_API_KEY=process.env.REACT_APP_OPENAI_API_KEY;
    // 1. 사전 필터링 (기간 및 가입 한도 체크)
      const filteredByTerm = products.filter(p => {
        const productOptions = options.filter(o => o.fin_prdt_cd === p.fin_prdt_cd);
        const hasTerm = productOptions.some(o => {
          const termDiff = Math.abs(Number(o.save_trm) - Number(userData.term));
          return termDiff <= 6; 
        });
        const isWithinLimit = !p.max_limit || (Number(userData.monthlySavings) * 10000 <= Number(p.max_limit));
        return hasTerm && isWithinLimit;
      });

      if (filteredByTerm.length === 0) {
        alert("조건에 맞는 상품이 없습니다. 조건을 변경해주세요.");
        return;
      }

      // 2. 데이터 요약 (토큰 다이어트)
      const simplifiedProducts = filteredByTerm.slice(0, 20).map(p => ({
        cd: p.fin_prdt_cd,
        nm: p.fin_prdt_nm,
        bank: p.kor_co_nm,
        cond: p.spcl_cnd ? p.spcl_cnd.substring(0, 100) : "없음", // 우대조건 100자 제한
        target: p.join_member
      }));

      const prompt = `
        사용자 정보: ${JSON.stringify(userData)}
        상품 목록: ${JSON.stringify(simplifiedProducts)}
        
        조건:
        조건: 위 목록의 'cd' 필드 값(상품 코드)만 추출하여 반드시 ["코드1", "코드2"] 형식의 JSON 배열로만 6개 응답.
      `;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      
      // 토큰 사용량 콘솔 출력
      if (data.usage) {
        console.log("--- 💡 실시간 토큰 사용량 ---");
        console.log(`입력(Prompt): ${data.usage.prompt_tokens}`);
        console.log(`출력(Completion): ${data.usage.completion_tokens}`);
        console.log(`총합(Total): ${data.usage.total_tokens}`);
      }

      if (!data.choices || data.choices.length === 0) {
        console.error("API 오류:", data);
        return;
      }

      let text = data.choices[0].message.content;
      console.log("AI 답변:", text);

      // 3. 답변 정제 및 파싱
      const cleanedText = text.replace(/```json|```/g, "").trim();
      
      try {
        const result = JSON.parse(cleanedText);
        console.log("✅ 파싱 결과:", result);
        setRecommended(result);
      } catch (parseErr) {
        console.error("파싱 실패:", cleanedText);
        alert("AI 응답 데이터 처리에 실패했습니다.");
      }

    } catch (err) {
      console.error("추천 로직 에러:", err);
    }
  };

  const chartProducts = products
    .filter(p => recommended.includes(p.fin_prdt_cd))
    .map(p => {
      const productOptions = options.filter(o => o.fin_prdt_cd === p.fin_prdt_cd);
      const maxOption = productOptions.reduce((prev, curr) => 
        (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev, {});
      
      return {
        id: p.fin_prdt_cd,
        name: p.fin_prdt_nm,
        period: parseInt(maxOption.save_trm || 12),
        rate: parseFloat(maxOption.intr_rate2 || 0)
      };
    });

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h1>💰 금융 포터 (FinPorter)</h1>
        <p>당신의 정보를 바탕으로 최적의 적금 상품을 AI가 분석합니다.</p>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* 입력 폼 */}
        <FinancialInput onFormSubmit={handleUserSubmit} />
        {/* 그래프 */}
        {recommended.length > 0 && (
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <ChartOutput chartProducts={chartProducts} />
          </div>
        )}


      </main>
    </div>
  );
}

export default App;