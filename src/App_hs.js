import React, { useState, useEffect } from "react";
import UserInput from "./UserInput";
import UserOutput from "./UserOutput";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const OPENAI_API_KEY = "OPEN_AI_API_KEY";

  const APIurl = "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";

  // 금융상품 데이터 가져오기
  useEffect(() => {
    fetch(APIurl)
      .then(res => res.json())
      .then(data => {
        setProducts(data.result.baseList);
        setOptions(data.result.optionList);
      });
  }, []);

  // 🔥 OpenAI 추천
  const handleUserSubmit = async (userData) => {
    try {
      const prompt = `
사용자 정보:
${JSON.stringify(userData)}

금융상품 목록:
${JSON.stringify(products.slice(0, 20))}

조건:
- 가장 적합한 상품 6개 선택
- fin_prdt_cd만 배열로 반환
- 설명 절대 금지

예:
["코드1","코드2"]
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

      if (!data.choices) {
        console.error("API 오류:", data);
        alert("API 키 확인 필요");
        return;
      }

      const text = data.choices[0].message.content;

      const result = JSON.parse(text);
      setRecommended(result);

    } catch (err) {
      console.error("추천 실패:", err);
    }
  };

  return (
    <div>
      <UserInput onSubmit={handleUserSubmit} />

      <UserOutput
        recommendedCodes={recommended}
        products={products}
        options={options}
      />
    </div>
  );
}

export default App;