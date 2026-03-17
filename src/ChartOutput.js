import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// 더미 데이터
const dummyProducts = [
  { id: "p1", name: "6개월 적금", period: 6, rate: 2.3 },
  { id: "p2", name: "12개월 적금", period: 12, rate: 2.55 },
  { id: "p3", name: "24개월 적금", period: 24, rate: 2.6 },
  { id: "p4", name: "36개월 적금", period: 36, rate: 2.65 }
];

const monthlyDeposit = 1000000; // 월 납입액
const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#a82b83", '#7bfb0a']; // 고정 색상

function ChartOutput() {
  const [selected, setSelected] = useState(dummyProducts.map(p => p.id));

  const toggleProduct = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(v => v !== id)
        : [...prev, id]
    );
  };

  const visibleProducts = dummyProducts
    .filter(p => selected.includes(p.id))
    .sort((a, b) => a.period - b.period);

  const maxPeriod = Math.max(...visibleProducts.map(p => p.period));

  const labels = [];
  for (let i = 0; i <= maxPeriod; i += 2) {
    labels.push(`${i}개월`);
  }

  const calculateInterest = (period, rate) => {
    return Math.round(monthlyDeposit * period * (period + 1) / 2 * (rate / 100 / 12));
  };

  // dataset 생성, 만기 지점에만 큰 point 표시
  const datasets = visibleProducts.map((p, index) => {
    const data = [];
    const pointRadius = [];
    for (let i = 0; i <= maxPeriod; i += 2) {
      if (i === 0) {
        data.push(0);
        pointRadius.push(0);
      } else if (i < p.period) {
        data.push(monthlyDeposit * i);
        pointRadius.push(0);
      } else {
        data.push(monthlyDeposit * p.period + calculateInterest(p.period, p.rate));
        // 만기 지점과 끝점에 포인트 표시
        pointRadius.push(i === p.period ? 6 : 0);
      }
    }

    return {
      label: p.name,
      data,
      borderColor: colors[index % colors.length],
      backgroundColor: "transparent",
      tension: 0.3,
      pointRadius,
    };
  });

  const chartData = {
    labels,
    datasets
  };

  const options = {
    layout: { padding: { right: 150 } },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(context) {
            // 첫 줄: 상품 이름
            return context[0].dataset.label;
          },
          label: function(context) {
            // 두 번째 줄: 금액
            const value = context.raw;
            return `총액: ${value.toLocaleString()}원`;
          },
          afterBody: function(context) {
            // 세 번째 줄: 이자
            const datasetIndex = context[0].datasetIndex;
            const prod = visibleProducts[datasetIndex];
            const total = monthlyDeposit * prod.period + calculateInterest(prod.period, prod.rate);
            const interest = total - monthlyDeposit * prod.period;
            return `이자: ${interest.toLocaleString()}원`;
          }
        }
      },
      legend: { position: "top" }
    },
    scales: {
      x: { title: { display: true, text: "기간(개월)" } },
      y: { title: { display: true, text: "누적 금액(원)" }, beginAtZero: true }
    },
    responsive: true,
    maintainAspectRatio: false,
    // draw hook으로 끝점 총액 표시
    animation: {
      legend: { position: "top" },
      tooltip: { enabled: true },
      onComplete: function () {
        const chart = this;
        const ctx = chart.ctx;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 12px Arial";

        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          const lastPoint = meta.data[meta.data.length - 1];
          const prod = visibleProducts[datasetIndex];

          const total = monthlyDeposit * prod.period + calculateInterest(prod.period, prod.rate);
          const interest = total - monthlyDeposit * prod.period;

          ctx.fillStyle = colors[datasetIndex % colors.length];
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.font = "bold 14px Arial";

          const x = lastPoint.x + 10; // 오른쪽 약간 offset
          const y = lastPoint.y;

          // 첫 번째 줄: 총액
          ctx.fillText(`${total.toLocaleString()}원`, x, y);

          // 두 번째 줄: 괄호 안 이자
          ctx.fillText(`(${interest.toLocaleString()}+)`, x, y + 18); // 18px 아래로
        });
      }
    }
  };

  return (
    <div style={{ width: "1000px", height: "500px" }}>
      <h2>추천상품 비교</h2>

      {dummyProducts.map((p) => (
        <div key={p.id}>
          <label>
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggleProduct(p.id)}
            />
            {p.name} ({p.rate}%)
          </label>
        </div>
      ))}

      <Line data={chartData} options={options} />
    </div>
  );
}

export default ChartOutput;