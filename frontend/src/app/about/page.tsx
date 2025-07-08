'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = Math.min(scrollTop / docHeight, 1);
      setScrollPercent(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="text-gray-800 font-sans bg-white min-h-screen flex flex-col">
      <Header />

      <main className="pt-32 pb-24 px-6 md:px-20 flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          {/* عکس */}
          <div className="flex-shrink-0 w-full md:w-[55%] h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/images/pathnio.png"
              alt="Our Team"
              className="w-full h-full object-cover"
            />
          </div>

          {/* متن */}
          <div className="w-full md:w-[45%]">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-6 animate-text-fade-in">
              About Pathnio
            </h2>
            <p
              className="text-lg text-gray-600 leading-relaxed mb-4 animate-text-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Pathnio is built by a team of engineers and designers passionate
              about innovation in logistics. We saw a gap in real-time fleet
              management — and we decided to build the future.
            </p>
            <p
              className="text-lg text-gray-600 leading-relaxed animate-text-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              From intuitive dashboards to AI-based insights, everything at
              Pathnio is built to make your transport operations smarter,
              faster, and more profitable.
            </p>
          </div>
        </div>
      </main>

      {/* فوتر همیشه هست ولی انیمیشن داره */}
      <div
        className="transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(${100 - scrollPercent * 100}%)`,
          opacity: scrollPercent,
        }}
      >
        <Footer />
      </div>

      <style jsx>{`
        @keyframes text-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-text-fade-in {
          animation: text-fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
