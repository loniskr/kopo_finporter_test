import React, { useState } from 'react';
//최소텀 최대텀 있는 경우
function FinancialInputRange() {
  const [formData, setFormData] = useState({
    // 1. 노출 항목
    age: '',
    monthlySavings: '',
    income: '',
    job: '',
    contractType: '정규직',
    minTerm: 3,
    maxTerm: 12,
    
    // 2. 숨겨진 항목 (추후 확장용)
    houseOwned: 'N',
    carOwned: 'N',
    disabled: 'N',
    gender: 'M',
    military: 'N'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', maxWidth: '600px', margin: '20px auto', textAlign: 'left' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>💰 금융 정보 입력</h2>
      
      {/* --- 노출 섹션 --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>나이: </label>
          <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="예: 28" />
        </div>

        <div>
          <label>월 저축액 (만원): </label>
          <input name="monthlySavings" type="number" value={formData.monthlySavings} onChange={handleChange} placeholder="예: 100" />
        </div>

        <div>
          <label>소득 (연봉/만원): </label>
          <input name="income" type="number" value={formData.income} onChange={handleChange} placeholder="예: 4000" />
        </div>

        <div>
          <label>직종: </label>
          <input name="job" type="text" value={formData.job} onChange={handleChange} placeholder="예: IT 개발자" />
        </div>

        <div>
          <label>계약형태: </label>
          <select name="contractType" value={formData.contractType} onChange={handleChange}>
            <option value="정규직">정규직</option>
            <option value="비정규직">비정규직</option>
            <option value="프리랜서">프리랜서</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 만기일자 범위 설정 */}
        <div style={{ padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>📅 원하는 만기 기간 ({formData.minTerm} ~ {formData.maxTerm}개월)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span>최소 1</span>
            <input 
              name="minTerm" type="range" min="1" max="36" 
              value={formData.minTerm} onChange={handleChange} 
            />
            <span>{formData.minTerm}개월</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span>최대 36</span>
            <input 
              name="maxTerm" type="range" min="1" max="36" 
              value={formData.maxTerm} onChange={handleChange} 
            />
            <span>{formData.maxTerm}개월</span>
          </div>
        </div>
      </div>

      {/* --- 숨겨진 섹션 (Hidden 영역) --- */}
      {/* 나중에 쓸 수 있도록 데이터 바인딩은 되어있지만 화면에는 나타나지 않습니다. */}
      <div style={{ display: 'none' }}>
        <input name="houseOwned" value={formData.houseOwned} readOnly />
        <input name="carOwned" value={formData.carOwned} readOnly />
        <input name="disabled" value={formData.disabled} readOnly />
        <input name="gender" value={formData.gender} readOnly />
        <input name="military" value={formData.military} readOnly />
      </div>

      <button 
        style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        onClick={() => {
          console.log("AI에게 전달될 데이터 객체:", formData);
          alert("데이터가 콘솔에 저장되었습니다. AI API 호출을 준비합니다.");
        }}
      >
        추천 상품 분석 시작하기
      </button>
    </div>
  );
}

export default FinancialInputRange;