'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="text-gray-800">
      {/* Header */}
      <Header />

      {/* Hero with Image Background */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        <Image
          src="/images/Pathnio2.png"
          alt="Logistics cinematic background"
          layout="fill"
          objectFit="cover"
          className={`z-0 transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABeElEQVR4Xu3WQQ6DMAwF0It58AfKiR3AuRXKn0xN4U0AfRbUQyZuNmd3a+6G4jyHoEcAAMAAHgO/oE8uRcAzjP8yX+qa9z/4nUq1cLYNnd3p/Ra1XxeC6vrNkyVmcuWQd0+FEqX66ps6g7E5u5c9Ve0q7Go+r9dP1YLflWmP18YcwN1ZdOWmWe7z2n31ZfShWhXVxDHzkg37ahk6lKPR+B0pFqHUfpOCUYgC4dKXGoe9GCXmoBOUnQ7nR4HLt8h20cKn9H4vFUSnUeV6MB0eFSYpFmfxB3dywfwdf0hElSo1GgkElkK9Fq9dqxQunMTHi0Wp3GlzgxN3TyN6+DTikI1Fq9Xa5QiqbVoqBq8SyqlUq6uJTE5LSJkO2OSvIV1eCcAPAD8BrigYcAAGAAHwAA4AIAbCDqGYL48Q/p1Lzlt4e6f4MnyNfpOr/TvcAAAAASUVORK5CYII="
          onLoadingComplete={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 text-center px-6 sm:px-10 md:px-16 max-w-4xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 drop-shadow-xl animate-text-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Fleet Management, Redefined
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-xl mx-auto animate-text-fade-in"
            style={{ animationDelay: '0.7s' }}
          >
            Track, manage, and optimize your transit company’s trucks in
            real-time — with Pathnio.
          </p>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-16 sm:py-20 px-6 sm:px-10 md:px-20 bg-white"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-6 sm:mb-8 animate-text-fade-in">
            Why Choose Pathnio?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed animate-text-fade-in">
            Pathnio is a smart solution for transit and logistics companies. We
            provide powerful tools to monitor, control, and analyze your truck
            fleet in real-time — making transportation more efficient,
            transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-blue-50 py-16 sm:py-20 px-6 sm:px-10 md:px-20"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 pointer">
          {['gps', 'analytics', 'driver'].map((type, i) => {
            const content = {
              gps: {
                title: 'Real-Time GPS',
                icon: '📍',
                desc: 'Live tracking with accuracy across all routes.',
              },
              analytics: {
                title: 'Fleet Analytics',
                icon: '📊',
                desc: 'Detailed performance metrics and reports.',
              },
              driver: {
                title: 'Driver Behavior',
                icon: '🧑‍✈️',
                desc: 'Monitor and evaluate driver patterns easily.',
              },
            }[type as 'gps' | 'analytics' | 'driver'];

            if (!content) return null;

            return (
              <div
                key={i}
                className="group bg-white rounded-3xl shadow-lg p-6 sm:p-8 transform transition hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 transition group-hover:scale-110">
                  {content.icon}
                </div>
                <h4 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-1 sm:mb-2">
                  {content.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  {content.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="bg-white py-16 sm:py-20 px-6 sm:px-10 md:px-20 text-center">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-800 mb-8 sm:mb-10">
          Trusted by Leading Companies
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          {[
            { src: '/logos/DHL.png', alt: 'DHL' },
            { src: '/logos/FEDEX.png', alt: 'FedEx' },
            { src: '/logos/MAERSK.png', alt: 'Maersk' },
            { src: '/logos/UPS.png', alt: 'UPS' },
          ].map((logo, i) => (
            <div
              key={i}
              className="w-24 sm:w-32 h-12 sm:h-16 relative grayscale hover:grayscale-0 transition"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                layout="fill"
                objectFit="contain"
                priority={i === 0} // prioritize first image loading
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-100 py-16 sm:py-20 px-6 sm:px-10 text-center">
        <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-4">
          Ready to transform your fleet?
        </h4>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto">
          Join hundreds of companies already optimizing their logistics with
          Pathnio.
        </p>
        <Link
          href="/signup"
          className="inline-block px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition shadow-lg"
        >
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <Footer />

      {/* Animations */}
      <style jsx>{`
        @keyframes textFadeIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-text-fade-in {
          animation: textFadeIn 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
