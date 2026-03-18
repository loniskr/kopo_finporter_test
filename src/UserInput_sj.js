import React, { useState } from "react";
import { PigCharacter } from "./components/PigCharacter";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    backgroundColor: "var(--background, #FFF9F0)",
  },
  wrap: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    marginTop: "130px", 

  },
  pigWrap: {
    position: "absolute",
    top: "-118px",
    right: "32px",
    zIndex: 10,
  },
  card: {
    backgroundColor: "var(--card, #FFFBF5)",
    border: "2px solid var(--border, #E8D4C0)",
    borderRadius: "20px",
    padding: "28px",
    position: "relative",
    zIndex: 1,
  },
  heading: {
    fontSize: "18px",
    fontWeight: "var(--font-weight-medium, 500)",
    color: "var(--foreground, #3D3D3D)",
    marginBottom: "20px",
  },
  field: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "var(--font-weight-medium, 500)",
    color: "var(--foreground, #3D3D3D)",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid var(--border, #E8D4C0)",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "var(--input-background, #FFFBF5)",
    color: "var(--foreground, #3D3D3D)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  hint: {
    marginTop: "5px",
    fontSize: "12px",
    color: "var(--primary, #8FBC8F)",
    minHeight: "18px",
  },
  button: {
    width: "100%",
    backgroundColor: "var(--primary, #8FBC8F)",
    color: "var(--primary-foreground, #FFFFFF)",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "var(--font-weight-medium, 500)",
    cursor: "pointer",
    marginTop: "8px",
    transition: "opacity 0.15s",
  },
};

function UserInput({ onSubmit }) {
  const [isIncomeFocused, setIsIncomeFocused] = useState(false);
  const [form, setForm] = useState({
    age: "",
    saving: "",
    income: "",
    job: "",
    contract: "",
    minMaturity: "",
    maxMaturity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.age || !form.saving || !form.income || !form.job || !form.contract) {
      alert("필수 입력 필요");
      return;
    }
    if (form.minMaturity && (form.minMaturity < 1 || form.minMaturity > 36)) {
      alert("최소 만기는 1~36개월 사이로 입력해주세요");
      return;
    }
    if (form.maxMaturity && (form.maxMaturity < 1 || form.maxMaturity > 36)) {
      alert("최대 만기는 1~36개월 사이로 입력해주세요");
      return;
    }
    if (form.minMaturity && form.maxMaturity && Number(form.minMaturity) > Number(form.maxMaturity)) {
      alert("최소 만기가 최대 만기보다 클 수 없어요");
      return;
    }
    onSubmit(form);
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--primary, #8FBC8F)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--border, #E8D4C0)";
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* 돼지 - 반달 손의 평평면이 카드 border에 맞닿음 */}
        <div style={styles.pigWrap}>
          <PigCharacter isWatching={!isIncomeFocused} />
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>사용자 입력</h2>

          <form onSubmit={handleSubmit}>

            <div style={styles.field}>
              <label style={styles.label}>나이 *</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.input}
                placeholder="예: 28"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>월 저축 (만원) *</label>
              <input
                type="number"
                name="saving"
                value={form.saving}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.input}
                placeholder="예: 50"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>연 소득 (만원)*</label>
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                onFocus={(e) => { handleFocus(e); setIsIncomeFocused(true); }}
                onBlur={(e) => { handleBlur(e); setIsIncomeFocused(false); }}
                style={styles.input}
                placeholder="예: 3500"
              />
              {isIncomeFocused && (
                <p style={styles.hint}>돼지는 지금 안 보고 있어요 💕</p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>직종 *</label>
              <input
                type="text"
                name="job"
                value={form.job}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.input}
                placeholder="예: 소프트웨어 엔지니어"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>계약형태 *</label>
              <select
                name="contract"
                value={form.contract}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{ ...styles.input, cursor: "pointer" }}
              >
                <option value="">선택해주세요</option>
                <option value="정규직">정규직</option>
                <option value="비정규직">비정규직</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>희망 만기 기간 (개월)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  name="minMaturity"
                  value={form.minMaturity}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.input}
                  placeholder="최소 (1)"
                  min="1"
                  max="36"
                />
                <span style={{ color: "var(--muted-foreground, #7A7A7A)", fontSize: "14px", whiteSpace: "nowrap" }}>~</span>
                <input
                  type="number"
                  name="maxMaturity"
                  value={form.maxMaturity}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.input}
                  placeholder="최대 (36)"
                  min="1"
                  max="36"
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              onMouseEnter={(e) => e.target.style.opacity = "0.85"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              추천
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserInput;