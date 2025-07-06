"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setShowContent(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/60 to-blue-600/60 shadow-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Pathnio</h1>
          <nav className="space-x-6 text-white font-medium flex items-center">
            <a href="#" className="hover:text-blue-300 transition">Home</a>
            <a href="#about" className="hover:text-blue-300 transition">About</a>
            <a href="#features" className="hover:text-blue-300 transition">Features</a>
            <a href="#contact" className="hover:text-blue-300 transition">Contact</a>
            <Link
              href="/login"
              className="ml-6 px-4 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-blue-500">
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
        <div className="relative z-10 text-center">
          <h2
            className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-xl animate-text-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Fleet Management, Redefined
          </h2>
          <p
            className="text-xl max-w-xl mx-auto text-gray-200 animate-text-fade-in"
            style={{ animationDelay: "0.7s" }}
          >
            Track, manage, and optimize your transit company’s trucks in real-time — with Pathnio.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-blue-700 mb-8 animate-text-fade-in" style={{ animationDelay: "1.5s" }}>
            Why Choose Pathnio?
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed animate-text-fade-in" style={{ animationDelay: "2s" }}>
            Pathnio is a smart solution for transit and logistics companies. We provide powerful tools to monitor, control, and analyze your truck fleet in real-time — making transportation more efficient, transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-blue-50 py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {["gps", "analytics", "driver"].map((type, i) => {
            const content = {
              gps: {
                title: "Real-Time GPS",
                icon: "📍",
                desc: "Live tracking with accuracy across all routes."
              },
              analytics: {
                title: "Fleet Analytics",
                icon: "📊",
                desc: "Detailed performance metrics and reports."
              },
              driver: {
                title: "Driver Behavior",
                icon: "🧑‍✈️",
                desc: "Monitor and evaluate driver patterns easily."
              }
            }[type];

            return (
              <div
                key={i}
                className="group bg-white rounded-3xl shadow-lg p-8 transform transition hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="text-5xl mb-6 transition group-hover:scale-110">{content.icon}</div>
                <h4 className="text-2xl font-semibold text-blue-600 mb-2">{content.title}</h4>
                <p className="text-gray-600 text-base">{content.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="bg-white py-20 px-6 md:px-20 text-center">
        <h3 className="text-3xl font-semibold text-blue-800 mb-10">Trusted by Leading Companies</h3>
        <div className="flex flex-wrap justify-center items-center gap-10">
          {[
            { src: "/logos/DHL.png", alt: "DHL" },
            { src: "/logos/FEDEX.png", alt: "FedEx" },
            { src: "/logos/MAERSK.png", alt: "Maersk" },
            { src: "/logos/UPS.png", alt: "UPS" },
          ].map((logo, i) => (
            <div key={i} className="w-32 h-16 relative grayscale hover:grayscale-0 transition">
              <Image src={logo.src} alt={logo.alt} layout="fill" objectFit="contain" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h5 className="text-xl font-bold mb-4">Pathnio</h5>
            <p className="text-gray-300 text-sm">
              A modern solution to track, manage and optimize fleet operations.
            </p>
          </div>

          <div>
            <h6 className="text-lg font-semibold mb-3">Quick Links</h6>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#about" className="hover:underline">About</a></li>
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          <div>
            <h6 className="text-lg font-semibold mb-3">Contact Us</h6>
            <p className="text-sm text-gray-300">Email: support@pathnio.com</p>
            <p className="text-sm text-gray-300">Phone: +1 800 123 4567</p>
            <p className="text-sm text-gray-300">Address: 123 Fleet Ave, NY</p>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-10">
          &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
        </div>
      </footer>

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