'use client'
// DriverPerformanceChart.tsx
import React from "react";
import {
  Bar
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DriverPerformanceChartProps {
  performanceData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderRadius?: number;
    }[];
  };
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
    title: {
      display: true,
      text: "Driver Performance",
      font: {
        size: 18,
      },
      color: "#2563EB", // آبی Tailwind
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

export default function DriverPerformanceChart({ performanceData }: DriverPerformanceChartProps) {
  return (
    <div className="w-full h-64">
      <Bar options={options} data={performanceData} />
    </div>
  );
}
