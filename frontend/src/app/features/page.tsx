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
    <div className="text-gray-800 font-sans bg-white min-h-screen flex flex-col">
      {/* استفاده از کامپوننت Header */}
      <Header />

      {/* Features Section */}
      <main className="pt-20 pb-24 px-6 md:px-20 max-w-6xl mx-auto flex-grow">
        <section className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
            Our Features
          </h2>
          <p className="text-lg text-gray-600">
            Explore the powerful tools and features that make Pathnio your go-to
            solution for modern logistics.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 pointer">
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
              className="p-6 rounded-3xl shadow-lg bg-gray-50 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h4 className="text-xl font-semibold text-blue-800 mb-2">
                {title}
              </h4>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Logo Animation Section */}
      <div className="py-16 bg-white text-center">
        <h1 className="text-6xl md:text-8xl font-extrabold text-blue-800 tracking-widest select-none">
          {logoText.split('').map((char, index) => (
            <span
              key={index}
              className={`inline-block transition-opacity duration-500 ${
                index < visibleLetters ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>

      {/* استفاده از کامپوننت Footer */}
      <Footer />
    </div>
  );
}
