'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../api';
import DriverPerformanceChart from './../../../../components/DriverPerformanceChart';

const DriverCard = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fake performance data for now
  const performanceData = {
    labels: ['Punctuality', 'Safety', 'Customer', 'Efficiency', 'Maintenance'],
    datasets: [
      {
        label: 'Performance',
        data: [90, 85, 80, 88, 92],
        backgroundColor: '#3B82F6',
        borderRadius: 5,
      },
    ],
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`accounts/drivers/${id}/`)
      .then(res => {
        setDriver(res.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load driver data.');
        setDriver(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-blue-500 text-xl">در حال بارگذاری اطلاعات راننده...</div>;
  }
  if (error || !driver) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">{error || 'راننده پیدا نشد.'}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      {' '}
      {/* Even more flexible overall padding */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-200 w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[80rem] flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 p-6 sm:p-8 md:p-10 lg:p-12 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        {/* Driver Details Section */}
        <div className="flex-1 flex flex-col justify-center space-y-5 sm:space-y-6 md:space-y-8 text-gray-800 border-b-2 md:border-b-0 md:border-r-2 border-blue-100 pb-6 md:pb-0 md:pr-8 lg:pr-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-blue-800 tracking-tight leading-tight">
              {driver.full_name || driver.name}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 mt-1 sm:mt-2">
              Driver ID: <span className="font-bold text-blue-600">{driver.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 md:gap-y-6 gap-x-6 sm:gap-x-8 md:gap-x-10 text-sm sm:text-base lg:text-lg">
            {' '}
            {/* Finer control over grid gaps and text size */}
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Company
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.company?.company_name || driver.company || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Status
              </div>
              <div className={`font-extrabold mt-0.5 ${driver.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                {driver.status || 'Active'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                License
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.license || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Phone
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.mobile || driver.phone || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Experience
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.experience || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Trips Completed
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.tripsCompleted || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Contract Type
              </div>
              <div className="font-extrabold text-gray-900 mt-0.5">
                {driver.contractType || '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-xs sm:text-sm">
                Rating
              </div>
              <div className="font-extrabold text-yellow-500 mt-0.5">
                {driver.rating ? `${driver.rating} / 5` : '-'} <span className="text-gray-400">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 pt-6 md:pt-0">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            {' '}
            {/* More responsive chart title */}
            Performance Chart
          </h3>
          <div className="w-full max-w-[15rem] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            {' '}
            {/* Optimized chart max-width for smaller screens */}
            <DriverPerformanceChart performanceData={performanceData} />
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 text-center px-2 sm:px-4">
            {' '}
            {/* Responsive text for description */}
            This chart provides a comprehensive overview of the driver's performance across various dimensions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
