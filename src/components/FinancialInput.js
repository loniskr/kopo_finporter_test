import React, { useState } from 'react';

function FinancialInput({ onFormSubmit }) {
  const [formData, setFormData] = useState({
    age: '',
    monthlySavings: '',
    income: '',
    job: '',
    contractType: '정규직',
    term: 12, // 기본값 12개월
    // 숨겨진 항목들
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // 부모 컴포넌트(App.js)로 데이터 전달
    onFormSubmit(formData);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', maxWidth: '500px', margin: '20px auto', textAlign: 'left' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>💰 맞춤 금융 정보 입력</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>나이: </label>
          <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="예: 28" required />
        </div>

        <div>
          <label>월 저축 가능 금액 (만원): </label>
          <input name="monthlySavings" type="number" value={formData.monthlySavings} onChange={handleChange} placeholder="예: 100" required />
        </div>

        <div>
          <label>연 소득 (만원): </label>
          <input name="income" type="number" value={formData.income} onChange={handleChange} placeholder="예: 4000" required />
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

        {/* 단일 만기 설정 (슬라이더 + 숫자 표시) */}
        <div style={{ padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>📅 희망 만기 기간: {formData.term}개월</label>
          <input 
            name="term" 
            type="range" 
            min="1" 
            max="36" 
            value={formData.term} 
            onChange={handleChange} 
            style={{ width: '100%', marginTop: '10px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
            <span>1개월</span>
            <span>36개월</span>
          </div>
        </div>

        <button 
          type="submit"
          style={{ 
            marginTop: '10px', 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          추천 상품 분석 시작하기
        </button>
      </form>
    </div>
  );
}

export default FinancialInput;