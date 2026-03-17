import React, { useState, useEffect } from "react";
import UserInput from "./UserInput";
import ChartOutput from "./ChartOutput";

function App() {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const APIurl = "/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";

  useEffect(() => {
    fetch(APIurl)
      .then(res => res.json())
      .then(data => {
        setProducts(data.result.baseList);
        setOptions(data.result.optionList);
      });
  }, []);

  //추천
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
- 설명 금지

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
        alert("API 오류");
        return;
      }

      const result = JSON.parse(data.choices[0].message.content);
      setRecommended(result);

    } catch (err) {
      console.error(err);
    }
  };

  //구조 변경
  const chartProducts = products
    .filter(p => recommended.includes(p.fin_prdt_cd))
    .map(p => {
      const productOptions = options.filter(
        o => o.fin_prdt_cd === p.fin_prdt_cd
      );

      const maxOption = productOptions.reduce(
        (prev, curr) =>
          (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev,
        {}
      );

      return {
        id: p.fin_prdt_cd,
        name: p.fin_prdt_nm,
        period: parseInt(maxOption.save_trm || 12),
        rate: parseFloat(maxOption.intr_rate2 || 0)
      };
    });

  return (
    <div>
      <UserInput onSubmit={handleUserSubmit} />

      <ChartOutput chartProducts={chartProducts} />
    </div>
  );
}

export default App;