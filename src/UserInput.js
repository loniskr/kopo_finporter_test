import React, { useState } from "react";

function UserInput({ onSubmit }) {
  const [form, setForm] = useState({
    age: "",
    saving: "",
    income: "",
    job: "",
    contract: "",
    house: "",
    car: "",
    disability: "",
    gender: "",
    military: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.age ||
      !form.saving ||
      !form.income ||
      !form.job ||
      !form.contract
    ) {
      alert("필수 항목 입력");
      return;
    }

    onSubmit(form);
  };

  return (
    <div>
      <h1>사용자 정보 입력</h1>

      <form onSubmit={handleSubmit}>
        <h3>필수 입력</h3>

        <input type="number" name="age" placeholder="나이" onChange={handleChange} />
        <br />

        <input type="number" name="saving" placeholder="월 저축금액" onChange={handleChange} />
        <br />

        <input type="number" name="income" placeholder="월 평균 소득" onChange={handleChange} />
        <br />

        <input type="text" name="job" placeholder="직종" onChange={handleChange} />
        <br />

        <select name="contract" onChange={handleChange}>
          <option value="">계약 형태</option>
          <option value="정규직">정규직</option>
          <option value="비정규직">비정규직</option>
          <option value="프리랜서">프리랜서</option>
        </select>

        <h3>선택 입력</h3>

        <select name="house" onChange={handleChange}>
          <option value="">주택</option>
          <option value="자가">자가</option>
          <option value="없음">없음</option>
        </select>

        <select name="car" onChange={handleChange}>
          <option value="">차량</option>
          <option value="있음">있음</option>
          <option value="없음">없음</option>
        </select>

        <select name="disability" onChange={handleChange}>
          <option value="">장애</option>
          <option value="있음">있음</option>
          <option value="없음">없음</option>
        </select>

        <select name="gender" onChange={handleChange}>
          <option value="">성별</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>

        <select name="military" onChange={handleChange}>
          <option value="">병역</option>
          <option value="군필">군필</option>
          <option value="미필">미필</option>
          <option value="해당없음">해당없음</option>
        </select>

        <br /><br />
        <button type="submit">추천 받기</button>
      </form>
    </div>
  );
}

export default UserInput;