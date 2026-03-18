import React from "react";

function UserOutput({ recommendedCodes, products, options }) {
  if (!recommendedCodes.length) return null;

  const filteredProducts = products.filter(p =>
    recommendedCodes.includes(p.fin_prdt_cd)
  );

  const optionMap = {};

  options.forEach(opt => {
    if (!optionMap[opt.fin_prdt_cd]) {
      optionMap[opt.fin_prdt_cd] = [];
    }
    optionMap[opt.fin_prdt_cd].push(opt);
  });

  return (
    <ul>
      {filteredProducts.map((item) => {

        const option = optionMap[item.fin_prdt_cd] || [];

        const maxRate = Math.max(
          ...option.map(o => o.intr_rate2 || 0)
        );

        return (
          <li key={item.fin_prdt_cd}>
            {item.fin_prdt_nm} - {item.kor_co_nm}<br/>

            우대조건 : {item.spcl_cnd}<br/>
            가입대상 : {item.join_member}<br/>
            기타설명 : {item.etc_note}<br/>
            가입한도 : 월 {item.max_limit ? item.max_limit : "-"}원<br/>

            금리옵션 :
            {option.map((o, i) => (
              <div key={i}>
                기간 {o.save_trm}개월 /
                금리 {o.intr_rate}% /
                최고금리 {o.intr_rate2}% /
                {o.rsrv_type_nm}
              </div>
            ))}

            최대금리 : {maxRate}%
            <hr />
          </li>
        );

      })}
    </ul>
  );
}

export default UserOutput;