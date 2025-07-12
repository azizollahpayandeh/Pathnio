'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  const logoText = 'Pathnio';
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLetters((prev) => (prev < logoText.length ? prev + 1 : prev));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-gray-800 bg-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Features Section */}
      <main className="pt-16 md:pt-20 pb-24 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex-grow">
        <section className="text-center mb-16 md:mb-20 px-2 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 sm:mb-6 leading-tight">
            Our Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
            Explore the powerful tools and features that make Pathnio your go-to
            solution for modern logistics.
          </p>
        </section>

        <section
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-6 
            sm:gap-8 
            lg:gap-12
            px-2
            sm:px-0
          "
        >
          {[
            {
              title: 'Real-Time Tracking',
              desc: 'Monitor your fleet and shipments live with GPS precision.',
              icon: '🛰️',
            },
            {
              title: 'Smart Analytics',
              desc: 'Make informed decisions using AI-driven data insights.',
              icon: '📊',
            },
            {
              title: 'Driver App',
              desc: 'Equip your drivers with a user-friendly app to manage deliveries efficiently.',
              icon: '📱',
            },
            {
              title: 'Custom Alerts',
              desc: 'Receive instant notifications on key events and anomalies.',
              icon: '🔔',
            },
            {
              title: 'Route Optimization',
              desc: 'Automatically find the fastest and most efficient delivery paths.',
              icon: '🗺️',
            },
            {
              title: 'Secure Access',
              desc: 'Enterprise-grade security and role-based permissions.',
              icon: '🔐',
            },
          ].map(({ title, desc, icon }) => (
            <div
              key={title}
              tabIndex={0}
              className="
                p-6
                rounded-3xl
                shadow-lg
                bg-gray-50
                hover:bg-blue-50
                focus:bg-blue-100
                focus:outline-none
                focus:ring-4
                focus:ring-blue-300
                transition
                cursor-pointer
                flex
                flex-col
                items-start
                sm:items-center
                text-left
                sm:text-center
              "
            >
              <div
                className="text-5xl mb-4 sm:mb-6"
                title={desc}
                aria-label={title + ' icon'}
                role="img"
              >
                {icon}
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-blue-800 mb-1 sm:mb-2">
                {title}
              </h4>
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </section>

        {/* Logo Animation Section */}
        <div className="py-12 sm:py-16 bg-white text-center px-4 sm:px-0">
          <h1
            className="
              text-5xl
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
              font-extrabold
              text-blue-800
              tracking-widest
              select-none
              font-sans
              flex
              justify-center
            "
            aria-label="Pathnio logo animation"
          >
            {logoText.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block transition-opacity duration-500 ${
                  index < visibleLetters ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                aria-hidden={index >= visibleLetters}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Call to Action Button */}
        <div className="text-center mt-12 px-4 sm:px-0">
          <button
            className="
              px-6
              sm:px-8
              py-3
              sm:py-4
              bg-blue-700
              hover:bg-blue-800
              text-white
              text-base
              sm:text-lg
              font-semibold
              rounded-full
              shadow-lg
              transition
              focus:outline-none
              focus:ring-4
              focus:ring-blue-400
              focus:ring-offset-2
            "
            aria-label="Get started with Pathnio now"
          >
            Get Started Now
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
