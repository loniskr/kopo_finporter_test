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
import { PigCharacter } from "./components/PigCharacter";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const monthlyDeposit = 1000000;
const colors = ["#8FBC8F", "#E6739F", "#6aabdd", "#d62728", "#a82b83", "#e8a838"];

const styles = {
  page: {
    backgroundColor: "var(--background, #FFF9F0)",
    padding: "24px 16px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  outer: {
    position: "relative",
    width: "100%",
    maxWidth: "860px",
  },
  pigWrap: {
    position: "absolute",
    top: "-118px",
    right: "24px",
    zIndex: 10,
    pointerEvents: "none",
  },
  card: {
    backgroundColor: "var(--card, #FFFBF5)",
    border: "2px solid var(--border, #E8D4C0)",
    borderRadius: "20px",
    padding: "28px",
    position: "relative",
    zIndex: 1,
    overflow: "visible",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "var(--font-weight-medium, 500)",
    color: "var(--foreground, #3D3D3D)",
    marginBottom: "20px",
  },
  chartWrap: {
    width: "100%",
    height: "440px",
  },
};

function ChartOutput({ chartProducts }) {
  if (!chartProducts.length) return null;

  const visibleProducts = [...chartProducts].sort((a, b) => a.period - b.period);
  const maxPeriod = Math.max(...visibleProducts.map((p) => p.period));

  const labels = [];
  for (let i = 0; i <= maxPeriod; i += 2) {
    labels.push(`${i}개월`);
  }

  const calculateInterest = (period, rate) =>
    Math.round(monthlyDeposit * period * ((period + 1) / 2) * (rate / 100 / 12));

  const calculateMonthlyInterest = (month, rate) =>
    Math.round(monthlyDeposit * ((month * (month + 1)) / 2) * (rate / 100 / 12));

  const datasets = visibleProducts.map((p, index) => {
    const data = [];
    const pointRadius = [];
    for (let i = 0; i <= maxPeriod; i += 2) {
      if (i === 0) {
        data.push(0);
        pointRadius.push(0);
      } else if (i <= p.period) {
        data.push(calculateInterest(i, p.rate));
        pointRadius.push(i === p.period ? 6 : 0);
      } else {
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

  const chartData = { labels, datasets };

  const options = {
    layout: { padding: { right: 150 } },
    plugins: {
      tooltip: {
        callbacks: {
          title: (context) => context[0].dataset.label,
          afterBody: (context) => {
            const prod = visibleProducts[context[0].datasetIndex];
            const interest = calculateMonthlyInterest(prod.period, prod.rate);
            return `이자: ${interest.toLocaleString()}원`;
          },
        },
      },
      legend: { position: "top" },
    },
    scales: {
      x: { title: { display: true, text: "기간(개월)" } },
      y: { title: { display: true, text: "누적 이자(원)" }, beginAtZero: true },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      onComplete: function () {
        const chart = this;
        const ctx = chart.ctx;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 12px Arial";

        const points = chart.data.datasets.map((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          const lastPoint = meta.data[meta.data.length - 1];
          return { datasetIndex, x: lastPoint.x, y: lastPoint.y };
        });

        points.sort((a, b) => a.y - b.y);
        const minGap = 40;
        for (let i = 1; i < points.length; i++) {
          if (points[i].y - points[i - 1].y < minGap) {
            points[i].y = points[i - 1].y + minGap;
          }
        }

        points.forEach((pt) => {
          const prod = visibleProducts[pt.datasetIndex];
          const total =
            monthlyDeposit * prod.period + calculateInterest(prod.period, prod.rate);
          const interest = total - monthlyDeposit * prod.period;
          ctx.fillStyle = colors[pt.datasetIndex % colors.length];
          ctx.fillText(`${total.toLocaleString()}원`, pt.x + 10, pt.y - 10);
          ctx.fillText(`(${interest.toLocaleString()}+)`, pt.x + 10, pt.y + 8);
        });
      },
    },
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.outer, marginTop: "118px" }}>
        <div style={styles.card}>
          {/* 돼지 빼꼼 - card 기준 absolute, card overflow:visible */}
          <div style={styles.pigWrap}>
            <PigCharacter isWatching={true} />
          </div>
          <h2 style={styles.heading}>추천 상품 그래프</h2>
          <div style={styles.chartWrap}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartOutput;