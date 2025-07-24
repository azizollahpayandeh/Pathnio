'use client';
import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react'; // Import the Lucide icon for the back button

// FAKE DATA - Replace with API in real app
// This array simulates a database of vehicle information. In a real application,
// this data would typically be fetched from a backend API.
const FAKE_VEHICLES = [
  {
    plate_number: '12A345-IR',
    vehicle_type: 'Truck',
    driver: 'Amir',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '10t',
    color: 'White',
  },
  {
    plate_number: '22B456-IR',
    vehicle_type: 'Van',
    driver: 'Sara',
    company: 'Demo Co.',
    status: 'Inactive',
    capacity: '2t',
    color: 'Blue',
  },
  {
    plate_number: '33C567-IR',
    vehicle_type: 'Sedan',
    driver: 'Mohammad',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '5t',
    color: 'Black',
  },
  {
    plate_number: '44D678-IR',
    vehicle_type: 'Truck',
    driver: 'Reza',
    company: 'Demo Co.',
    status: 'Maintenance',
    capacity: '12t',
    color: 'Red',
  },
  {
    plate_number: '55E789-IR',
    vehicle_type: 'Van',
    driver: 'Fatemeh',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '3t',
    color: 'Green',
  },
  {
    plate_number: '66F890-IR',
    vehicle_type: 'Sedan',
    driver: 'Hossein',
    company: 'Demo Co.',
    status: 'Inactive',
    capacity: '4t',
    color: 'Gray',
  },
  {
    plate_number: '77G901-IR',
    vehicle_type: 'Truck',
    driver: 'Maryam',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '15t',
    color: 'Yellow',
  },
  {
    plate_number: '88H012-IR',
    vehicle_type: 'Van',
    driver: 'Ali',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '2.5t',
    color: 'White',
  },
  {
    plate_number: '99I123-IR',
    vehicle_type: 'Sedan',
    driver: 'Zahra',
    company: 'Demo Co.',
    status: 'Maintenance',
    capacity: '5t',
    color: 'Blue',
  },
  {
    plate_number: '10J234-IR',
    vehicle_type: 'Truck',
    driver: 'Alireza',
    company: 'Demo Co.',
    status: 'Active',
    capacity: '20t',
    color: 'Black',
  },
];

// Dynamically import VehiclePerformanceChart to prevent Server-Side Rendering (SSR) issues.
// This ensures the component is only loaded on the client side.
const VehiclePerformanceChart = dynamic(
  () => import('../../../../components/VehiclePerformanceChart'),
  { ssr: false }
);

// Main component for displaying Vehicle Details
export default function VehicleDetails() {
  // Get URL parameters using Next.js useRouter hook
  const params = useParams();
  const router = useRouter();

  // Decode the plate number from the URL parameter.
  // The 'id' parameter in the URL is expected to be the vehicle's plate number.
  const plate_number = decodeURIComponent(params.id as string);

  // Use useMemo to find the vehicle details from the FAKE_VEHICLES data.
  // This memoizes the result, preventing unnecessary re-calculations on re-renders,
  // unless the 'plate_number' dependency changes.
  const vehicle = useMemo(
    () => FAKE_VEHICLES.find((v) => v.plate_number === plate_number),
    [plate_number] // Dependency array: re-run the memoized function only if plate_number changes
  );

  // If no vehicle is found with the given plate number, display an error message.
  if (!vehicle) {
    return (
      <div className="text-center text-red-500 font-bold text-2xl mt-20">
        Vehicle not found
      </div>
    );
  }

  // Render the vehicle details page layout
  return (
    // Main container for the page, with background gradient, minimum height, and responsive padding.
    // The 'flex flex-col' ensures content stacks vertically.
    // 'pt-16' pushes content down from the top for better visual placement.
    // 'pb-8' adds padding at the bottom.
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col pt-16 pb-8 px-4 sm:px-6 lg:px-8 font-[Inter,sans-serif] text-gray-800">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        {/* Back Button Section */}
        <div>
          <button
            // Navigates back to the vehicles dashboard when clicked.
            onClick={() => router.push('/dashboard/vehicles')}
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
            Back to Vehicles
          </button>
        </div>

        {/* Vehicle Details Card Section */}
        {/* This card displays the main information about the selected vehicle. */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row gap-8 border border-blue-100 min-h-[420px]">
          {/* Left side: Vehicle main details (plate number, type, driver, etc.) */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-4 mb-2">
              {/* Circular display for the first two characters of the plate number */}
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700 shadow-lg">
                {vehicle.plate_number.slice(0, 2)}{' '}
                {/* Displays first two characters */}
              </div>
              {/* Full plate number and vehicle type */}
              <div>
                <div className="text-3xl font-extrabold text-blue-700">
                  {vehicle.plate_number}
                </div>
                <div className="text-lg text-gray-500">
                  {vehicle.vehicle_type}
                </div>
              </div>
            </div>
            {/* Grid layout for additional vehicle details like Driver, Company, Status, Capacity, Color */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Driver Information */}
              <div>
                <div className="text-xs text-gray-400">Driver</div>
                <div className="font-bold text-xl text-blue-900">
                  {vehicle.driver}
                </div>
              </div>
              {/* Company Information */}
              <div>
                <div className="text-xs text-gray-400">Company</div>
                <div className="font-bold text-xl text-blue-900">
                  {vehicle.company}
                </div>
              </div>
              {/* Vehicle Status with conditional text coloring based on status value */}
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div
                  className={`font-bold text-xl ${
                    vehicle.status === 'Active'
                      ? 'text-green-600' // Green for active status
                      : vehicle.status === 'Inactive'
                      ? 'text-gray-400' // Gray for inactive status
                      : 'text-yellow-500' // Yellow for maintenance or other statuses
                  }`}
                >
                  {vehicle.status}
                </div>
              </div>
              {/* Vehicle Capacity */}
              <div>
                <div className="text-xs text-gray-400">Capacity</div>
                <div className="font-bold text-xl text-blue-900">
                  {vehicle.capacity}
                </div>
              </div>
              {/* Vehicle Color */}
              <div>
                <div className="text-xs text-gray-400">Color</div>
                <div className="font-bold text-xl text-blue-900">
                  {vehicle.color}
                </div>
              </div>
            </div>
          </div>
          {/* Right side: Placeholder for Vehicle Performance Chart */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* This component would display a chart related to vehicle performance. */}
            <VehiclePerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
}
