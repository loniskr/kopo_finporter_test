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
const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];

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

  const datasets = visibleProducts.map((p, index) => {
    const data = [];

    for (let i = 0; i <= maxPeriod; i += 2) {
      if (i < p.period) {
        data.push(monthlyDeposit * i);
      } else {
        data.push(monthlyDeposit * p.period + calculateInterest(p.period, p.rate));
      }
    }

    return {
      label: p.name,
      data,
      borderColor: colors[index % colors.length],
      tension: 0.3,
    };
  });

  return (
    <div style={{ width: "900px", height: "400px" }}>
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

      <Line data={{ labels, datasets }} />
    </div>
  );
}

export default ChartOutput;