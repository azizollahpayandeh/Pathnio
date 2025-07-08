'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import FloatingAlert from '@/components/FloatingAlert';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [scrollPercent, setScrollPercent] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    try {
      await axios.post('http://localhost:8000/api/accounts/contact/', form); // TODO: Make this configurable for production
      setAlert({ type: 'success', msg: 'Your message has been sent successfully!' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setAlert({ type: 'error', msg: 'There was an error sending your message. Please try again.' });
    }
  };

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

  // Floating alert auto-close
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <Header />

      {/* Background decorative shapes */}
      <div className="absolute inset-0 bg-[url('/images/contact-bg.jpg')] bg-cover bg-center opacity-10 blur-sm z-0" />

      <main className="pt-32 pb-24 px-6 md:px-20 relative z-10">
        <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/60 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-slide-up-fade">
          {/* Contact Info */}
          <div className="bg-blue-900/80 text-white p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold mb-6">Contact Us</h2>
            <p className="mb-6 text-blue-200">
              To reach the Pathnio team, fill the form or use the contact
              details below.
            </p>
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-white" />
                <span>contact@pathnio.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-white" />
                <span>+98 912 000 0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-white" />
                <span>Vakilabad St, Mashhad, Pathnio HQ</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="p-18 bg-white/80 space-y-6 backdrop-blur-sm"
          >
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Your Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Let us know what's on your mind :)"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-800 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>

      {/* Footer slide-up on scroll */}
      <div
        className="transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(${100 - scrollPercent * 100}%)`,
          opacity: scrollPercent,
        }}
      >
        <Footer />
      </div>

      {/* Floating Alert */}
      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.9s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
