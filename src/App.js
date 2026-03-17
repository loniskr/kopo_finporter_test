import React, { useState, useEffect } from "react";
import FinancialInput from "./components/FinancialInput";
import UserOutput from "./UserOutput";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);


  // 1. 금감원 API 호출 
  useEffect(() => {
    const APIurl = "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";
    
    fetch(APIurl)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setProducts(data.result.baseList);
          setOptions(data.result.optionList);
        }
      })
      .catch(err => console.error("API 데이터 로드 실패:", err));
  }, []);

// 2. FinancialInput에서 전달된 데이터를 받아 OpenAI 추천 실행
  const handleUserSubmit = async (userData) => {
    try {
      const OPENAI_API_KEY=process.env.REACT_APP_OPENAI_API_KEY;
// 1. 사전 필터링 (기간 및 가입 한도 체크)
      const filteredByTerm = products.filter(p => {
        const productOptions = options.filter(o => o.fin_prdt_cd === p.fin_prdt_cd);
        const hasTerm = productOptions.some(o => Number(o.save_trm) === Number(userData.term));
        const isWithinLimit = !p.max_limit || (Number(userData.monthlySavings) * 10000 <= Number(p.max_limit));
        return hasTerm && isWithinLimit;
      });

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
        1. 위 목록의 'cd' 필드 값(상품 코드)만 추출하여 배열로 만드세요.
        2. 상품명(nm)이나 은행명은 절대 포함하지 마세요.
        3. 반드시 ["코드1", "코드2"] 형식의 JSON 배열로만 응답하세요.
        
        잘못된 예: ["iM함께적금", "코드1"]
        올바른 예: ["WR0001F", "00266451"]
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
      
      // 📊 토큰 사용량 콘솔 출력
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

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h1>💰 금융 포터 (FinPorter)</h1>
        <p>당신의 정보를 바탕으로 최적의 적금 상품을 AI가 분석합니다.</p>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* 질문자님이 만드신 단일 만기 폼 연결 */}
        <FinancialInput onFormSubmit={handleUserSubmit} />

        {/* 분석 결과 출력 영역 */}
        <div style={{ marginTop: '30px' }}>
          {recommended.length > 0 && <h2 style={{ textAlign: 'center' }}>🎯 AI 추천 상품 결과</h2>}
          <UserOutput
            recommendedCodes={recommended}
            products={products}
            options={options}
          />
        </div>
      </main>
    </div>
  );
}

export default App;