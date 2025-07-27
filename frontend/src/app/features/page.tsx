'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  }, [logoText.length]);

  const features = [
    {
      title: 'Real-Time Tracking',
      desc: 'Monitor your fleet and shipments live with pinpoint GPS precision.',
      icon: '🛰️',
    },
    {
      title: 'Smart Analytics',
      desc: 'Make informed decisions using powerful AI-driven data insights.',
      icon: '📊',
    },
    {
      title: 'Driver App',
      desc: 'Equip your drivers with a user-friendly app for efficient delivery management.',
      icon: '📱',
    },
    {
      title: 'Custom Alerts',
      desc: 'Receive instant notifications on key events and anomalies to stay ahead.',
      icon: '🔔',
    },
    {
      title: 'Route Optimization',
      desc: 'Automatically find the fastest and most fuel-efficient delivery paths.',
      icon: '🗺️',
    },
    {
      title: 'Secure Access',
      desc: 'Protect your data with enterprise-grade security and role-based permissions.',
      icon: '🔐',
    },
  ];

  return (
    <div className="text-gray-900 bg-gray-50 min-h-screen flex flex-col font-sans antialiased">
      <Header />

      <main className="pt-20 sm:pt-24 md:pt-28 pb-16 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex-grow">
        <section className="text-center mb-12 md:mb-16 px-2 sm:px-6 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 mb-3 sm:mb-4 leading-tight tracking-tight">
            Unleash the Power of Pathnio
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Discover a suite of powerful features meticulously crafted to streamline your logistics, from real-time tracking to intelligent analytics.
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
          {features.map(({ title, desc, icon }, index) => (
            <div
              key={title}
              tabIndex={0}
              className="
                p-6
                rounded-3xl
                shadow-2xl
                bg-white
                hover:bg-blue-50
                hover:scale-105
                focus:scale-105
                focus:outline-none
                focus:ring-4
                focus:ring-blue-300
                transform
                transition-all
                duration-300
                ease-in-out
                flex
                flex-col
                items-center
                text-center
                group
                animate-fade-in
              "
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
                title={desc}
                aria-label={title + ' icon'}
                role="img"
              >
                {icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-snug">
                {desc}
              </p>
            </div>
          ))}
        </section>

        <div className="py-12 sm:py-16 text-center px-4 sm:px-0">
          <h2
            className="
              text-5xl
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
              font-black
              text-blue-800
              tracking-widest
              select-none
              flex
              justify-center
              animate-fade-in
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
          </h2>
        </div>

        <div className="text-center mt-12 px-4 sm:px-0 animate-fadeInUp">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-full text-base shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            Get Started Now
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}