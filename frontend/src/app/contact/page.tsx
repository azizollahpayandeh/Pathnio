'use client';

import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f6ff] to-[#b3d6ff] px-4 md:px-10 py-16 relative">
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed top-6 right-6 bg-green-100 text-green-900 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Your message was sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Contact Info */}
        <div className="bg-blue-800 text-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold mb-6">Contact Us</h2>
          <p className="mb-6 text-blue-200">
            Feel free to contact the Pathnio team via the form or the info below.
          </p>
          <div className="space-y-4 text-blue-100">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white" />
              <span>contact@pathnio.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-white" />
              <span>+98 912 000 0000</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white" />
              <span>Pathnio HQ, Vakilabad St, Mashhad</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-10 bg-white space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Name</label>
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
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
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
            <label className="block text-gray-700 mb-2 font-medium">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here :)"
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
  );
}
