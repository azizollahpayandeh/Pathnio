'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
  const logoText = 'Pathnio';
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLetters((prev) =>
        prev < logoText.length ? prev + 1 : prev
      );
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-gray-800 bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/60 to-blue-600/60 shadow-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Pathnio
          </h1>
          <nav className="space-x-6 text-white font-medium flex items-center">
            <Link href="/" className="hover:text-blue-300 transition">
              Home
            </Link>
            <Link href="/features" className="text-blue-300 font-semibold">
              Features
            </Link>
            <Link href="/about" className="hover:text-blue-300 transition">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-blue-300 transition">
              Contact Us
            </Link>
            <Link
              href="/login"
              className="ml-6 px-4 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

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

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
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

      {/* Logo just above Footer */}
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

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h5 className="text-2xl font-semibold mb-4">Get in Touch</h5>
          <p className="mb-4 text-gray-300">
            For business inquiries, partnership proposals, or general questions,
            feel free to contact our team.
          </p>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
