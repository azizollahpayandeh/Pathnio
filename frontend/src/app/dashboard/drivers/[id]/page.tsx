'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import api from '../../../api';
import DriverPerformanceChart from './../../../../components/DriverPerformanceChart';
import { ArrowLeft } from 'lucide-react'; // Import the Lucide icon for the back button

const DriverCard = () => {
  const { id } = useParams();
  const router = useRouter(); // Initialize useRouter
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample performance data for the chart
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

  // useEffect hook to fetch driver data when the ID changes
  useEffect(() => {
    if (!id) return; // Exit if ID is not available
    setLoading(true); // Set loading state to true
    api
      .get(`accounts/drivers/${id}/`) // Make API call to fetch driver data
      .then((res) => {
        setDriver(res.data); // Set driver data
        setError(null); // Clear any previous errors
      })
      .catch(() => {
        setError('Failed to load driver data.'); // Set error message on failure
        setDriver(null); // Clear driver data
      })
      .finally(() => setLoading(false)); // Set loading state to false regardless of success or failure
  }, [id]); // Dependency array: re-run effect if 'id' changes

  // Display loading message while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-500 text-xl">
        در حال بارگذاری اطلاعات راننده...
      </div>
    );
  }

  // Display error message if data loading failed or driver not found
  if (error || !driver) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">
        {error || 'راننده پیدا نشد.'}
      </div>
    );
  }

  // Render the driver details card
  return (
    // Main container for the page, with background gradient, minimum height, and responsive padding.
    // 'flex flex-col' ensures content stacks vertically.
    // 'pt-16' pushes content down from the top for better visual placement.
    // 'pb-8' adds padding at the bottom.
    <div className="bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen flex flex-col pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Central content wrapper to align the button and the main card */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        {/* Back Button Section */}
        <div>
          <button
            // Navigates back to the drivers dashboard when clicked.
            onClick={() => router.push('/dashboard/drivers')} // Adjusted path to /dashboard/drivers
            // Tailwind CSS classes for styling the button:
            // flex items-center gap-2: Uses Flexbox to align icon and text horizontally with spacing.
            // px-6 py-3: Horizontal and vertical padding for the button.
            // rounded-lg: Applies rounded corners to the button.
            // font-bold: Makes the text inside the button bold.
            // bg-white: Sets the background color of the button to white.
            // text-blue-600: Sets the text color to a shade of blue.
            // shadow-md: Adds a medium-sized shadow to the button.
            // border border-gray-200: Adds a light gray border around the button.
            // transition-all duration-300 ease-in-out: Defines a smooth transition for all CSS properties
            //                                         over 300 milliseconds with an ease-in-out timing function.
            // hover:text-blue-800: Changes text color to a darker blue on hover.
            // hover:shadow-lg: Increases the shadow size on hover, creating a stronger depth effect.
            // hover:-translate-y-1: Moves the button slightly upwards on the Y-axis when hovered, enhancing the "pop-out" effect.
            // hover:scale-105: Slightly scales up the button on hover, contributing to the interactive feel.
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold bg-white text-blue-600 shadow-md border border-gray-200 transition-all duration-300 ease-in-out hover:text-blue-800 hover:shadow-lg hover:-translate-y-1 hover:scale-105"
          >
            {/* Lucide ArrowLeft icon, sized with h-5 (height) and w-5 (width) */}
            <ArrowLeft className="h-5 w-5" />
            Back to Drivers
          </button>
        </div>

        {/* Driver Details Card Section */}
        {/* This card displays the main information about the selected driver. */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-200 w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[80rem] grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 md:p-10 lg:p-12 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          {/* Left side: Driver Information */}
          <div className="flex flex-col justify-center space-y-6 text-gray-800">
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800">
                {driver.full_name || driver.name}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
                Driver ID:{' '}
                <span className="font-bold text-blue-600">{driver.id}</span>
              </p>
            </div>

            {/* Grid for additional driver details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 md:gap-y-6 gap-x-6 text-xs sm:text-sm md:text-base">
              {/* Company */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Company
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.company?.company_name || driver.company || '-'}
                </div>
              </div>
              {/* Status with conditional coloring */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Status
                </div>
                <div
                  className={`font-extrabold ${
                    driver.status === 'Active'
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {driver.status || 'Active'}
                </div>
              </div>
              {/* Vehicle & Plate */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Vehicle & Plate
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.license || '-'}
                </div>
              </div>
              {/* Phone */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Phone
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.mobile || driver.phone || '-'}
                </div>
              </div>
              {/* Experience */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Experience
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.experience || '-'}
                </div>
              </div>
              {/* Trips Completed */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Trips Completed
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.tripsCompleted || '-'}
                </div>
              </div>
              {/* Contract Type */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Contract Type
                </div>
                <div className="font-extrabold text-gray-900">
                  {driver.contractType || '-'}
                </div>
              </div>
              {/* Rating */}
              <div>
                <div className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  Rating
                </div>
                <div className="font-extrabold text-yellow-500">
                  {driver.rating ? `${driver.rating} / 5` : '-'}{' '}
                  <span className="text-gray-400">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Performance Chart */}
          <div className="flex flex-col items-center justify-center flex-grow space-y-6">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 text-center">
              Performance Chart
            </h3>
            <div className="w-full md:w-[90%] lg:w-[80%] max-w-[22rem] sm:max-w-sm md:max-w-md lg:max-w-lg">
              <DriverPerformanceChart performanceData={performanceData} />
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 text-center px-4">
              This chart shows a detailed performance view of the driver across
              key indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
