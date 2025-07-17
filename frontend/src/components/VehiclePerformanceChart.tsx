"use client";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PERFORMANCE_DATA = {
  labels: ['Engine', 'Fuel', 'Tires', 'Brakes', 'Battery'],
  datasets: [
    {
      label: 'Health (%)',
      data: [92, 76, 88, 95, 90],
      backgroundColor: '#2563eb',
      borderRadius: 8,
    },
  ],
};

export default function VehiclePerformanceChart() {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow p-6 flex flex-col items-center">
      <h2 className="font-bold text-blue-700 mb-4 text-center text-lg">Vehicle Health Overview</h2>
      <div style={{ width: '100%', height: 220 }}>
        <Bar
          data={PERFORMANCE_DATA}
          options={{
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: true,
            scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
          }}
        />
      </div>
    </div>
  );
} 