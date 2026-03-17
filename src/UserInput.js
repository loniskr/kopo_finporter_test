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

    if (!form.age || !form.saving || !form.income || !form.job || !form.contract) {
      alert("필수 입력 필요");
      return;
    }

    onSubmit(form);
  };

  return (
    <div>
      <h2>사용자 입력</h2>

      <form onSubmit={handleSubmit}>
        <input name="age" placeholder="나이" onChange={handleChange} /><br />
        <input name="saving" placeholder="월 저축" onChange={handleChange} /><br />
        <input name="income" placeholder="소득" onChange={handleChange} /><br />
        <input name="job" placeholder="직종" onChange={handleChange} /><br />

        <select name="contract" onChange={handleChange}>
          <option value="">계약형태</option>
          <option value="정규직">정규직</option>
          <option value="비정규직">비정규직</option>
        </select>

        <br /><br />
        <button type="submit">추천</button>
      </form>
    </div>
  );
}

export default UserInput;