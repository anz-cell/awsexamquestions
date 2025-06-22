import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register the required chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressGraph = ({ history = [] }) => {
  const { data, options } = useMemo(() => {
    const labels = history.map((entry) =>
      new Date(entry.date).toLocaleDateString()
    );

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Score (%)",
            data: history.map((entry) => entry.score),
            borderColor: "#ff6b35",
            backgroundColor: "rgba(255,107,53,0.2)",
            tension: 0.3,
            fill: true,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
            },
          },
        },
      },
    };
  }, [history]);

  if (!history || history.length === 0) return null;

  return <Line data={data} options={options} />;
};

export default ProgressGraph;
