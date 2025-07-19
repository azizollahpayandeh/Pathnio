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
      .catch(() => {
        setError('Failed to load driver data.');
        setDriver(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-500 text-xl">
        در حال بارگذاری اطلاعات راننده...
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">
        {error || 'راننده پیدا نشد.'}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-200 w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[80rem] grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 md:p-10 lg:p-12 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
        
        {/* Driver Info */}
        <div className="flex flex-col justify-center space-y-6 text-gray-800">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800">
              {driver.full_name || driver.name}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
              Driver ID: <span className="font-bold text-blue-600">{driver.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 md:gap-y-6 gap-x-6 text-xs sm:text-sm md:text-base">
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Company</div>
              <div className="font-extrabold text-gray-900">{driver.company?.company_name || driver.company || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Status</div>
              <div className={`font-extrabold ${driver.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                {driver.status || 'Active'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Vehicle & Plate</div>
              <div className="font-extrabold text-gray-900">{driver.license || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Phone</div>
              <div className="font-extrabold text-gray-900">{driver.mobile || driver.phone || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Experience</div>
              <div className="font-extrabold text-gray-900">{driver.experience || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Trips Completed</div>
              <div className="font-extrabold text-gray-900">{driver.tripsCompleted || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Contract Type</div>
              <div className="font-extrabold text-gray-900">{driver.contractType || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">Rating</div>
              <div className="font-extrabold text-yellow-500">
                {driver.rating ? `${driver.rating} / 5` : '-'} <span className="text-gray-400">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col items-center justify-center flex-grow space-y-6">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 text-center">
            Performance Chart
          </h3>
          <div className="w-full md:w-[90%] lg:w-[80%] max-w-[22rem] sm:max-w-sm md:max-w-md lg:max-w-lg">
            <DriverPerformanceChart performanceData={performanceData} />
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 text-center px-4">
            This chart shows a detailed performance view of the driver across key indicators.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DriverCard;
