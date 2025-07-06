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
    <div className="text-gray-700">
      {/* Header / Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Pathnio</h1>
          <nav className="space-x-6 text-gray-600 font-medium">
            <a href="#" className="hover:text-blue-500 transition duration-300">Home</a>
            <a href="#about" className="hover:text-blue-500 transition duration-300">About</a>
            <a href="#features" className="hover:text-blue-500 transition duration-300">Features</a>
            <a href="#contact" className="hover:text-blue-500 transition duration-300">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Video background placeholder */}
        <div className="absolute inset-0 bg-black">
          {/* You can replace this div with a <video> tag later */}
          <div className="w-full h-full bg-black opacity-60" />
        </div>
        <div className="relative text-center z-10 text-white transition-all duration-1000 ease-out">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Fleet Management, Redefined</h2>
          <p className="text-xl max-w-xl mx-auto">
            Track, manage, and optimize your transit company’s trucks in real-time — with Pathnio.
          </p>
        </div>
      </section>

      {/* Scroll-down Content (Slow reveal) */}
      <section id="about" className="bg-white py-20 px-6 md:px-20">
        <div
          className={`max-w-4xl mx-auto text-center transform transition-opacity duration-1000 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h3 className="text-3xl font-bold text-blue-700 mb-6">Why Choose Pathnio?</h3>
          <p className="text-lg text-gray-600">
            Pathnio is a smart solution for transit and logistics companies. We provide powerful tools to monitor, control, and analyze your truck fleet in real-time — making transportation more efficient, transparent, and profitable. 
            From smart route tracking to maintenance alerts and analytics dashboards, Pathnio helps you manage operations like never before.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-blue-50 py-20 px-6 md:px-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[
            { title: "Real-Time GPS", icon: "📍" },
            { title: "Fleet Analytics", icon: "📊" },
            { title: "Driver Behavior", icon: "🧑‍✈️" },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-6 transform transition duration-700 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h4 className="text-xl font-bold text-blue-600 mb-2">{f.title}</h4>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut dolor nec sapien tincidunt.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-800 text-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h5 className="text-2xl font-semibold mb-4">Get in Touch</h5>
          <p className="mb-2">
            For business inquiries, partnership proposals, or general questions, feel free to contact our team.
          </p>
          <p className="text-sm text-gray-300">
            This is a fictional project by Pathnio Inc. for modern fleet management solutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
