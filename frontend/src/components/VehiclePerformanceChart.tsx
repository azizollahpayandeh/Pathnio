"use client";
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const HEALTH_DATA = {
  labels: ['Engine', 'Fuel System', 'Tires', 'Brakes', 'Battery', 'Transmission'],
  datasets: [
    {
      label: 'Health Score (%)',
      data: [92, 76, 88, 95, 90, 87],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
    },
  ],
};

const PERFORMANCE_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Fuel Efficiency (km/L)',
      data: [12.5, 13.2, 11.8, 14.1, 12.9, 13.5, 12.7],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
    {
      label: 'Distance (km)',
      data: [180, 220, 150, 280, 200, 240, 190],
      borderColor: 'rgba(168, 85, 247, 1)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
};

export default function VehiclePerformanceChart() {
  return (
    <div className="w-full space-y-8">
      {/* Health Overview Chart */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Health Overview</h3>
            <p className="text-gray-600">Component health status and performance metrics</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">Good Condition</span>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <Bar
            data={HEALTH_DATA}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  borderWidth: 1,
                  cornerRadius: 12,
                  displayColors: false,
                  callbacks: {
                    label: function(context) {
                      return `Health: ${context.parsed.y}%`;
                    }
                  }
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                  },
                  ticks: {
                    stepSize: 20,
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '500',
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '500',
                    },
                  },
                },
              },
            }}
          />
        </div>
        
        {/* Health Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {HEALTH_DATA.labels.map((label, index) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
                <div className="text-2xl font-bold text-gray-900">{HEALTH_DATA.datasets[0].data[index]}%</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${HEALTH_DATA.datasets[0].data[index]}%`,
                        backgroundColor: HEALTH_DATA.datasets[0].backgroundColor[index],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends Chart */}
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 shadow-xl border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Performance Trends</h3>
            <p className="text-gray-600">Fuel efficiency and distance covered over the past week</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-700">Trending Up</span>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <Line
            data={PERFORMANCE_DATA}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                      size: 12,
                      weight: '600',
                    },
                  },
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: '#ffffff',
                  bodyColor: '#ffffff',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  borderWidth: 1,
                  cornerRadius: 12,
                  displayColors: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                  },
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '500',
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#6b7280',
                    font: {
                      size: 12,
                      weight: '500',
                    },
                  },
                },
              },
              elements: {
                point: {
                  hoverRadius: 8,
                },
              },
            }}
          />
        </div>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Average Fuel Efficiency</div>
                <div className="text-3xl font-bold text-blue-600">12.9 km/L</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Distance</div>
                <div className="text-3xl font-bold text-purple-600">1,460 km</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 