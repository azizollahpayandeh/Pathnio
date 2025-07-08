'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setShowContent(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="text-gray-800 font-sans">
      {/* Header */}
      <Header />

      {/* Hero with Video Background */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/images/video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 text-center px-4">
          <h2
            className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-xl animate-text-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Fleet Management, Redefined
          </h2>
          <p
            className="text-xl max-w-xl mx-auto text-gray-200 animate-text-fade-in"
            style={{ animationDelay: '0.7s' }}
          >
            Track, manage, and optimize your transit company’s trucks in real-time — with Pathnio.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-blue-700 mb-8 animate-text-fade-in">
            Why Choose Pathnio?
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed animate-text-fade-in">
            Pathnio is a smart solution for transit and logistics companies. We provide powerful tools to monitor, control, and analyze your truck fleet in real-time — making transportation more efficient, transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-blue-50 py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 pointer">
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
                className="group bg-white rounded-3xl shadow-lg p-8 transform transition hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="text-5xl mb-6 transition group-hover:scale-110">
                  {content.icon}
                </div>
                <h4 className="text-2xl font-semibold text-blue-600 mb-2">
                  {content.title}
                </h4>
                <p className="text-gray-600 text-base">{content.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="bg-white py-20 px-6 md:px-20 text-center">
        <h3 className="text-3xl font-semibold text-blue-800 mb-10">
          Trusted by Leading Companies
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-10">
          {[
            { src: '/logos/DHL.png', alt: 'DHL' },
            { src: '/logos/FEDEX.png', alt: 'FedEx' },
            { src: '/logos/MAERSK.png', alt: 'Maersk' },
            { src: '/logos/UPS.png', alt: 'UPS' },
          ].map((logo, i) => (
            <div
              key={i}
              className="w-32 h-16 relative grayscale hover:grayscale-0 transition"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                layout="fill"
                objectFit="contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-100 py-20 px-6 text-center">
        <h4 className="text-3xl font-bold text-blue-800 mb-4">
          Ready to transform your fleet?
        </h4>
        <p className="text-gray-700 mb-8">
          Join hundreds of companies already optimizing their logistics with Pathnio.
        </p>
        <Link
          href="/signup"
          className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition shadow-lg"
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
