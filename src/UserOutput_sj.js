import React from "react";

const styles = {
  page: {
    backgroundColor: "var(--background, #FFF9F0)",
    padding: "32px 16px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px",
    width: "100%",
    maxWidth: "860px",
  },
  card: (checked) => ({
    backgroundColor: "var(--card, #FFFBF5)",
    border: `2px solid ${checked ? "var(--primary, #8FBC8F)" : "var(--border, #E8D4C0)"}`,
    borderRadius: "16px",
    padding: "18px",
    transition: "border-color 0.2s",
  }),
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  bank: {
    fontSize: "11px",
    color: "var(--muted-foreground, #7A7A7A)",
  },
  name: {
    fontSize: "13px",
    fontWeight: "var(--font-weight-medium, 500)",
    color: "var(--foreground, #3D3D3D)",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "5px",
  },
  infoLabel: {
    color: "var(--muted-foreground, #7A7A7A)",
  },
  infoVal: {
    color: "var(--foreground, #3D3D3D)",
    fontWeight: "var(--font-weight-medium, 500)",
  },
  rateBadge: {
    backgroundColor: "var(--primary, #8FBC8F)",
    color: "var(--primary-foreground, #FFFFFF)",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "var(--font-weight-medium, 500)",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "var(--primary, #8FBC8F)",
    cursor: "pointer",
    flexShrink: 0,
  },
  termWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "12px",
  },
  termBtn: (active) => ({
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "var(--font-weight-medium, 500)",
    borderRadius: "6px",
    border: `1.5px solid ${active ? "var(--primary, #8FBC8F)" : "var(--border, #E8D4C0)"}`,
    backgroundColor: active ? "var(--primary, #8FBC8F)" : "transparent",
    color: active ? "var(--primary-foreground, #FFFFFF)" : "var(--muted-foreground, #7A7A7A)",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
};

function UserOutput({ recommendedCodes, products, options, selected, onToggle, selectedTerms, onTermChange }) {
  if (!recommendedCodes || !recommendedCodes.length) return null;

  const filteredProducts = products.filter((p) =>
    recommendedCodes.includes(p.fin_prdt_cd)
  );

  const optionMap = {};
  options.forEach((opt) => {
    if (!optionMap[opt.fin_prdt_cd]) optionMap[opt.fin_prdt_cd] = [];
    optionMap[opt.fin_prdt_cd].push(opt);
  });

  return (
    <div style={styles.page}>
      <div style={styles.grid}>
        {filteredProducts.map((item) => {
          const opts = optionMap[item.fin_prdt_cd] || [];

          // 이 상품의 선택된 만기
          const selectedTrm = selectedTerms[item.fin_prdt_cd];

          // 선택된 만기에 맞는 옵션, 없으면 최고금리 옵션
          const activeOpt = selectedTrm
            ? opts.find((o) => parseInt(o.save_trm) === selectedTrm) || {}
            : opts.reduce((prev, curr) => (curr.intr_rate2 || 0) > (prev.intr_rate2 || 0) ? curr : prev, {});

          // 중복 제거한 만기 목록 (오름차순)
          const terms = [...new Set(opts.map((o) => parseInt(o.save_trm)))].sort((a, b) => a - b);

          const checked = selected.includes(item.fin_prdt_cd);

          return (
            <div key={item.fin_prdt_cd} style={styles.card(checked)}>
              <div style={styles.cardTop}>
                <div style={styles.bank}>{item.kor_co_nm}</div>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={checked}
                  onChange={() => onToggle(item.fin_prdt_cd)}
                />
              </div>
              <div style={styles.name}>{item.fin_prdt_nm}</div>
              <div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>가입대상</span>
                  <span style={styles.infoVal}>{item.join_member || "-"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>가입한도</span>
                  <span style={styles.infoVal}>
                    {item.max_limit ? `월 ${item.max_limit.toLocaleString()}원` : "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>선택 만기</span>
                  <span style={styles.infoVal}>{activeOpt.save_trm || "-"}개월</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>최고금리</span>
                  <span style={styles.rateBadge}>{activeOpt.intr_rate2 || "-"}%</span>
                </div>
              </div>

              {/* 만기 선택 버튼 */}
              <div style={styles.termWrap}>
                {terms.map((trm) => (
                  <button
                    key={trm}
                    style={styles.termBtn(selectedTrm === trm || (!selectedTrm && trm === parseInt(activeOpt.save_trm)))}
                    onClick={() => onTermChange(item.fin_prdt_cd, trm)}
                  >
                    {trm}개월
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserOutput;