import { useState, useEffect } from "react";
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

const monthlyDeposit = 1000000;
const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#a82b83", '#7bfb0a']; // 고정 색상

function ChartOutput({ chartProducts }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(chartProducts.map(p => p.id));
  }, [chartProducts]);

  if (!chartProducts.length) return null;

  const toggleProduct = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(v => v !== id)
        : [...prev, id]
    );
  };

  const visibleProducts = chartProducts
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

  const calculateMonthlyInterest = (month, rate) => {
  // 매달 납입된 금액에 대해 각각 이자 발생
  // 1개월차: 1개월 이자, 2개월차: 2개월 이자 ...
  return Math.round(
    monthlyDeposit * (month * (month + 1) / 2) * (rate / 100 / 12)
  );
  };

  const datasets = visibleProducts.map((p, index) => {
    const data = [];
    const pointRadius = [];
    for (let i = 0; i <= maxPeriod; i += 2) {
      if (i === 0) {
        data.push(0);
        pointRadius.push(0);
      } else if (i <= p.period) {
        // 👉 해당 시점까지 누적 이자만 표시
        data.push(calculateInterest(i, p.rate));
        pointRadius.push(i === p.period ? 6 : 0);
      } else {
        // 👉 만기 이후는 고정
        data.push(calculateInterest(p.period, p.rate));
        pointRadius.push(0);
      }
    }

    return {
      label: p.name,
      data,
      borderColor: colors[index % colors.length],
      backgroundColor: "transparent",
      tension: 0.3,
      pointRadius,
      pointHoverRadius: 10,
      pointHitRadius: 12,
      pointBorderWidth: 2,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: "#fff",
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
          afterBody: function(context) {
            // 세 번째 줄: 이자
            const datasetIndex = context[0].datasetIndex;
            const prod = visibleProducts[datasetIndex];
            //const total = monthlyDeposit * prod.period + calculateInterest(prod.period, prod.rate);
            const interest = calculateMonthlyInterest(prod.period, prod.rate);
            return `이자: ${interest.toLocaleString()}원`;
          }
        }
      },
      legend: { position: "top" }
    },
    scales: {
      x: { title: { display: true, text: "기간(개월)" } },
      y: { title: { display: true, text: "누적 이자(원)" }, beginAtZero: true }
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

        const points = chart.data.datasets.map((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          const lastPoint = meta.data[meta.data.length - 1];

          return {
            datasetIndex,
            x: lastPoint.x,
            y: lastPoint.y,
          };
        });

        // 2️⃣ y 기준 정렬
        points.sort((a, b) => a.y - b.y);

        // 3️⃣ 겹침 감지 후 최소 간격 유지
        const minGap = 40;

        for (let i = 1; i < points.length; i++) {
          if (points[i].y - points[i - 1].y < minGap) {
            points[i].y = points[i - 1].y + minGap;
          }
        }
        points.forEach((pt) => {
          const prod = visibleProducts[pt.datasetIndex];

          const total = monthlyDeposit * prod.period + calculateInterest(prod.period, prod.rate);

          const interest = total - monthlyDeposit * prod.period;

          ctx.fillStyle = colors[pt.datasetIndex % colors.length];

          const x = pt.x + 10;
          const y = pt.y - 10;

          // 총액
          ctx.fillText(`${total.toLocaleString()}원`, x, y);

          // 이자
          ctx.fillText(`(${interest.toLocaleString()}+)`, x, y + 18);
              });
            }
          }
        };
  return (
    <div style={{ width: "1300px", height: "500px" }}>
      <h2>추천 상품 그래프</h2>

      {chartProducts.map(p => (
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