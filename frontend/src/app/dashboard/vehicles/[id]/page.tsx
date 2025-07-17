import React from 'react';

// Custom SVG Icons for a more unique look, adapted for light mode
const GaugeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
      fill="currentColor"
      opacity="0.1"
    />
    <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
    <path
      d="M16.236 7.764a6 6 0 00-8.472 8.472"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const FuelIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M8 6C8 5.44772 8.44772 5 9 5H15C15.5523 5 16 5.44772 16 6V9H8V6Z"
      fill="currentColor"
      opacity="0.5"
    />
    <path
      d="M6 9C5.44772 9 5 9.44772 5 10V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V10C19 9.44772 18.5523 9 18 9H6Z"
      fill="currentColor"
    />
    <path d="M10 13H14V15H10V13Z" fill="#FFFFFF" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M13 3C8.036 3 4 7.036 4 12H1L4.854 15.854L8.707 12H6C6 8.134 9.134 5 13 5C16.866 5 20 8.134 20 12C20 15.866 16.866 19 13 19H12V21H13C19.075 21 24 16.075 24 10C24 3.925 19.075 -1 13 -1V3Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path d="M13 8V13H18V11H14V8H13Z" fill="currentColor" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
      fill="currentColor"
    />
  </svg>
);

const SpeedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
      fill="currentColor"
      opacity="0.1"
    />
    <path
      d="M15.5 8.5L12 12L8.5 8.5L7 10L10.5 13.5L7 17L8.5 18.5L12 15L15.5 18.5L17 17L13.5 13.5L17 10L15.5 8.5Z"
      fill="currentColor"
    />
  </svg>
);

// New SVG Icon for Weather
const WeatherIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
      fill="#FACC15"
    />{' '}
    {/* Sun body */}
    <path
      d="M12 2V5M12 19V22M20.9239 9.07612L18.7925 11.2075M3.07612 14.9239L5.20753 12.7925M22 12H19M5 12H2M20.9239 14.9239L18.7925 12.7925M3.07612 9.07612L5.20753 11.2075"
      stroke="#FACC15"
      strokeWidth="2"
      strokeLinecap="round"
    />{' '}
    {/* Sun rays */}
  </svg>
);

export default function VehicleDetails() {
  const performanceScore = 92;
  const fuelLevel = 76;
  const currentSpeed = 85;
  const speedLimit = 110;

  return (
    <div className="bg-slate-50 min-h-screen px-4 py-8 sm:px-6 lg:px-8 font-[Inter,sans-serif] text-gray-800 flex justify-center">
      {/* Main grid container for columns. auto-rows-fr makes sure rows are equal height. */}
      {/* gap-8 creates space between the columns themselves. */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 grid-flow-row auto-rows-fr">
        {/* Left Column */}
        {/* Added space-y-6 and changed justify-start back to justify-between */}
        <div className="lg:col-span-1 flex flex-col h-full justify-between space-y-6">
          {/* Driver & Vehicle Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-blue-200/50">
            <h2 className="text-2xl font-black text-blue-700 mb-4">
              Driver & Vehicle
            </h2>
            <div className="space-y-4">
              {' '}
              {/* Internal padding/spacing inside card is kept */}
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="text-xl font-semibold text-gray-900">Amir</p>
                <p className="text-blue-600 text-sm font-semibold">
                  ⭐ 4.8 / 5.0
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="text-xl font-semibold text-gray-900">12A345-IR</p>
                <p className="text-green-600 text-sm font-semibold">
                  ● Excellent Condition
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-xl font-semibold text-gray-900">Demo Co.</p>
                <p className="text-sm text-gray-500">📱 +98 912 000 1234</p>
              </div>
            </div>
          </div>

          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-2xl p-6 shadow-lg shadow-yellow-200/50">
            <h2 className="text-xl font-extrabold text-yellow-700 mb-3">
              <WeatherIcon /> Current Weather
            </h2>
            <div className="flex justify-around items-center my-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-yellow-600">28°C</p>
                <p className="text-sm text-gray-500 mt-1">Temperature</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-500">
                  45<span className="text-2xl">%</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Humidity</p>
              </div>
            </div>
            <div className="text-center text-gray-700 mt-4">
              <p className="text-lg font-semibold">
                Wind: <span className="text-blue-600">15 km/h</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Mashhad, Iran</p>
            </div>
          </div>

          {/* Trip History Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-200/50">
            <h2 className="text-xl font-extrabold text-gray-700 mb-4">
              <HistoryIcon /> Trip History
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex justify-between items-center text-sm">
                <span>Mashhad to Tehran</span>
                <span className="font-medium text-gray-600">
                  2024-07-10 | 12h 30m
                </span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Shiraz to Isfahan</span>
                <span className="font-medium text-gray-600">
                  2024-07-01 | 7h 15m
                </span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Tabriz to Rasht</span>
                <span className="font-medium text-gray-600">
                  2024-06-25 | 8h 45m
                </span>
              </li>
            </ul>
            <button className="mt-4 w-full text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors">
              View All History
            </button>
          </div>
          {/* Removed flex-grow here */}
        </div>

        {/* Center Column */}
        {/* Added space-y-6 and changed justify-start back to justify-between */}
        <div className="lg:col-span-1 flex flex-col h-full justify-between space-y-6">
          {/* Performance Card */}
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-6 shadow-lg shadow-green-200/50">
            <div>
              <h2 className="text-xl font-extrabold text-green-700 mb-3">
                <GaugeIcon /> Performance Score
              </h2>
              <div className="text-center my-4">
                <p className="text-6xl font-bold text-green-600">
                  {performanceScore}
                  <span className="text-3xl text-gray-400">/100</span>
                </p>
              </div>
              {/* Progress Bar for Performance */}
              <div className="w-full bg-green-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${performanceScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2 font-medium">
                <span>Idle: 8min</span>
                <span>Efficiency: 92%</span>
              </div>
            </div>
          </div>

          {/* Current Speed & Route Status Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-indigo-200/50">
            <h2 className="text-xl font-extrabold text-indigo-700 mb-3">
              <SpeedIcon /> Speed & Route
            </h2>
            <div className="flex justify-around items-center my-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-indigo-600">
                  {currentSpeed}
                  <span className="text-2xl text-gray-400">km/h</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Current Speed</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-500">
                  {speedLimit}
                  <span className="text-2xl text-gray-400">km/h</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Speed Limit</p>
              </div>
            </div>
            <div className="text-center text-gray-700 mt-4">
              <p className="text-lg font-semibold">
                Route: <span className="text-blue-600">Mashhad to Tehran</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Status: On Schedule</p>
            </div>
          </div>

          {/* Cargo Details Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-purple-200/50">
            <h2 className="text-xl font-extrabold text-purple-700 mb-4">
              📦 Cargo Details
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Type</p>
                <p className="text-lg font-semibold text-purple-900">
                  Electronics
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Weight</p>
                <p className="text-lg font-semibold text-purple-900">
                  2.5 tons
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Stops</p>
                <p className="text-lg font-semibold text-purple-900">2</p>
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-2xl p-6 shadow-lg shadow-orange-200/50">
            <h2 className="text-xl font-extrabold text-orange-600 mb-3">
              🛠️ Maintenance
            </h2>
            <p className="text-lg text-gray-700">
              Next Due:{' '}
              <span className="font-semibold text-orange-500">2024-08-15</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last: 2024-06-03 (Brake Pads)
            </p>
          </div>

          {/* Removed flex-grow here */}
        </div>

        {/* Right Column */}
        {/* Added space-y-6 and changed justify-start back to justify-between */}
        <div className="lg:col-span-1 flex flex-col h-full justify-between space-y-6">
          {/* Fuel & ETA Card */}
          <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl p-6 shadow-lg shadow-teal-200/50">
            <h2 className="text-xl font-extrabold text-teal-700 mb-3">
              <FuelIcon /> Fuel & ETA
            </h2>
            {/* Fuel Level */}
            <div className="w-full bg-teal-100 rounded-full h-3 mb-3">
              <div
                className="bg-teal-500 h-3 rounded-full"
                style={{ width: `${fuelLevel}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Fuel: {fuelLevel}%</span>
              <span>ETA: 2h 35m</span>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 rounded-2xl p-6 shadow-lg shadow-cyan-200/50">
            <h2 className="text-xl font-extrabold text-cyan-700 mb-3">
              📍 Location
            </h2>
            <p className="text-lg text-gray-800">
              Karaj Toll, Tehran-Qazvin Hwy
            </p>
            <p className="text-sm text-gray-500 mt-1">Last Stop: 1h 20m ago</p>
          </div>

          {/* Warnings/Alerts Card */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg shadow-red-200/50">
            <h2 className="text-xl font-extrabold text-red-700 mb-3">
              <AlertIcon /> Warnings/Alerts
            </h2>
            <ul className="space-y-2 text-red-800">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 text-xl font-bold">•</span>
                <p className="text-base">
                  Tire pressure low on front-right wheel.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 text-xl font-bold">•</span>
                <p className="text-base">
                  Engine oil level below recommended (minor).
                </p>
              </li>
            </ul>
          </div>

          {/* Trip Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg shadow-blue-200/50">
            <h2 className="text-xl font-extrabold text-blue-800 mb-2">
              📝 Trip Notes
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Smooth journey with no issues. Driver maintained excellent speed
              and fuel efficiency.
            </p>
          </div>

          {/* Kilometeres Reached */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg shadow-blue-200/50">
            <h2 className="text-xl font-extrabold text-blue-800 mb-4 flex items-center">
              <span className="mr-2">🛣️</span> Total Distance Driven
            </h2>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-blue-700 leading-none">
                125,487
              </p>
              <p className="ml-1 text-lg text-gray-600">km</p>
            </div>
            <p className="text-sm text-gray-500 mt-2 italic">
              Roughly equivalent to 3 trips around the Earth's equator!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
