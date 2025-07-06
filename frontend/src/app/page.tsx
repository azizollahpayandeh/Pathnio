"use client";

import { useEffect, useState } from "react";

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
          <nav className="space-x-6 text-white font-medium">
            <a href="#" className="hover:text-blue-300 transition">Home</a>
            <a href="#about" className="hover:text-blue-300 transition">About</a>
            <a href="#features" className="hover:text-blue-300 transition">Features</a>
            <a href="#contact" className="hover:text-blue-300 transition">Contact</a>
          </nav>
        </div>
      </header>


      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-blue-500">
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
        <div className="relative z-10 text-center animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-xl">Fleet Management, Redefined</h2>
          <p className="text-xl max-w-xl mx-auto text-gray-200">
            Track, manage, and optimize your transit company’s trucks in real-time — with Pathnio.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className={`py-24 px-6 md:px-20 bg-white transition-opacity duration-[1200ms] ${showContent ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-blue-700 mb-8">Why Choose Pathnio?</h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            Pathnio is a smart solution for transit and logistics companies. We provide powerful tools to monitor, control, and analyze your truck fleet in real-time — making transportation more efficient, transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-blue-50 py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { title: "Real-Time GPS", icon: "📍" },
            { title: "Fleet Analytics", icon: "📊" },
            { title: "Driver Behavior", icon: "🧑‍✈️" },
          ].map((f, i) => (
            <div key={i} className="group bg-white rounded-3xl shadow-lg p-8 transform transition hover:-translate-y-3 hover:shadow-2xl">
              <div className="text-5xl mb-6 transition group-hover:scale-110">{f.icon}</div>
              <h4 className="text-2xl font-semibold text-blue-600 mb-2">{f.title}</h4>
              <p className="text-gray-600 text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut dolor nec sapien tincidunt.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h5 className="text-2xl font-semibold mb-4">Get in Touch</h5>
          <p className="mb-4 text-gray-300">
            For business inquiries, partnership proposals, or general questions, feel free to contact our team.
          </p>
          <p className="text-sm text-gray-400">
            This is a fictional project by Pathnio Inc. for modern fleet management solutions.
          </p>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
