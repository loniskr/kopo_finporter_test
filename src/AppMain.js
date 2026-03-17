import { useEffect, useState } from "react";

const APIurl =
"/finlifeapi/savingProductsSearch.json?auth=83ef207ea27c50a956ade0cd398e4a15&topFinGrpNo=020000&pageNo=1";

function App() {

  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(()=>{
    fetch(APIurl)
      .then(response => response.json())
      .then(data =>{
        setProducts(data.result.baseList);
        setOptions(data.result.optionList);
      });
  }, []);

  const optionMap = {};

  options.forEach(opt=>{
    if(!optionMap[opt.fin_prdt_cd]){
      optionMap[opt.fin_prdt_cd] = [];
    }
    optionMap[opt.fin_prdt_cd].push(opt);
  });

  return (
    <ul>
      {products.map((item,index)=>{

        const option = optionMap[item.fin_prdt_cd] || [];

        const maxRate = Math.max(
          ...option.map(o => o.intr_rate2 || 0)
        );

        return (
          <li key={index}>
            {item.fin_prdt_nm} - {item.kor_co_nm}<br/>

            우대조건 : {item.spcl_cnd}<br/>{/*AI 데이터 분석*/}
            가입대상 : {item.join_member}<br/>{/*AI 데이터 분석*/}
            기타설명 : {item.etc_note}<br/>{/*AI 데이터 분석*/}
            가입한도 : 월 {item.max_limit ? item.max_limit:"-"}원<br/>

            금리옵션 :
            {option.map((o,i)=>(
              <div key={i}>
                기간 {o.save_trm}개월 /
                금리 {o.intr_rate}% /
                최고금리 {o.intr_rate2}% / 
                {o.rsrv_type_nm}
              </div>
            ))}

            최대금리 : {maxRate}%
          </li>
        );

      })}
    </ul>
  );
}

export default App;