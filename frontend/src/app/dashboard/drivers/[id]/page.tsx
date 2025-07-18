'use client'
import React from "react";
import DriverPerformanceChart from "./../../../../components/DriverPerformanceChart";

const DriverCard = () => {
  const driver = {
    id: 12,
    name: "Amir Rezaei",
    company: "Demo Logistics",
    status: "Active",
    license: "B-Class",
    phone: "+98 912 345 6789",
    experience: "5 years",
    tripsCompleted: 320,
    rating: 4.6,
    contractType: "Full-Time", 
  };

  const performanceData = {
    labels: ["Punctuality", "Safety", "Customer", "Efficiency", "Maintenance"],
    datasets: [
      {
        label: "Performance",
        data: [90, 85, 80, 88, 92],
        backgroundColor: "#3B82F6",
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="bg-gray-100 flex items-start justify-center pt-16 min-h-screen p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-5xl w-full flex flex-col md:flex-row gap-10 p-8">
        
        <div className="flex-1 flex flex-col justify-center space-y-6 text-gray-800">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-blue-700">{driver.name}</h2>
            <p className="text-sm text-gray-500">
              Driver ID: <span className="font-semibold text-gray-700">{driver.id}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm md:text-base">
            <div>
              <div className="text-gray-400">Company</div>
              <div className="font-medium">{driver.company}</div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div className={`font-semibold ${driver.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                {driver.status}
              </div>
            </div>
            <div>
              <div className="text-gray-400">License</div>
              <div className="font-medium">{driver.license}</div>
            </div>
            <div>
              <div className="text-gray-400">Phone</div>
              <div className="font-medium">{driver.phone}</div>
            </div>
            <div>
              <div className="text-gray-400">Experience</div>
              <div className="font-medium">{driver.experience}</div>
            </div>
            <div>
              <div className="text-gray-400">Trips Completed</div>
              <div className="font-medium">{driver.tripsCompleted}</div>
            </div>

            <div>
              <div className="text-gray-400">Contract Type</div>
              <div className="font-medium">{driver.contractType}</div>
            </div>

            <div className="">
              <div className="text-gray-400">Rating</div>
              <div className="font-medium">{driver.rating} / 5</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="w-full">
            <DriverPerformanceChart performanceData={performanceData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
