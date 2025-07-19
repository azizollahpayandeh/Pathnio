'use client';
import React from 'react';
import DriverPerformanceChart from './../../../../components/DriverPerformanceChart';

const DriverCard = () => {
  const driver = {
    id: 12,
    name: 'Amir Rezaei',
    company: 'Demo Logistics',
    status: 'Active',
    license: 'B-Class',
    phone: '+98 912 345 6789',
    experience: '5 years',
    tripsCompleted: 320,
    rating: 4.6,
    contractType: 'Full-Time',
  };

  const performanceData = {
    labels: ['Punctuality', 'Safety', 'Customer', 'Efficiency', 'Maintenance'],
    datasets: [
      {
        label: 'Performance',
        data: [90, 85, 80, 88, 92],
        backgroundColor: '#3B82F6', // Consistent blue
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-200 max-w-6xl w-full flex flex-col md:flex-row gap-12 p-10 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        {/* Driver Details Section */}
        <div className="flex-1 flex flex-col justify-center space-y-8 text-gray-800 border-b-2 md:border-b-0 md:border-r-2 border-blue-100 pb-8 md:pb-0 md:pr-12">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-extrabold text-blue-800 tracking-tight leading-tight">
              {driver.name}
            </h2>
            <p className="text-lg text-gray-500 mt-2">
              Driver ID:{' '}
              <span className="font-bold text-blue-600">{driver.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 text-lg">
            <div>
              <div className="text-gray-500 font-semibold">Company</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.company}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Status</div>
              <div
                className={`font-extrabold mt-1 ${
                  driver.status === 'Active' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {driver.status}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">License</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.license}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Phone</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.phone}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Experience</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.experience}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Trips Completed</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.tripsCompleted}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Contract Type</div>
              <div className="font-extrabold text-gray-900 mt-1">
                {driver.contractType}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold">Rating</div>
              <div className="font-extrabold text-yellow-500 mt-1">
                {driver.rating} / 5 <span className="text-gray-400">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-10 pt-8 md:pt-0">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Performance Chart
          </h3>
          <div className="w-full max-w-md">
            {' '}
            {/* Added max-w for better chart scaling */}
            <DriverPerformanceChart performanceData={performanceData} />
          </div>
          <p className="text-sm text-gray-500 text-center px-4">
            This chart provides a comprehensive overview of the driver's
            performance across various dimensions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
