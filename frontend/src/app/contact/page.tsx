'use client';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Zap,
  Star,
  Users,
  Clock,
  ArrowRight,
  Globe,
  Shield,
  Heart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Alert {
  type: 'success' | 'error';
  msg: string;
}

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [scrollPercent, setScrollPercent] = useState(0);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Pathnio completely transformed our fleet management system!',
      author: 'Sarah Johnson',
      role: 'Fleet Manager',
      rating: 5,
    },
    {
      text: 'Best customer support I have ever experienced.',
      author: 'Ahmad Rezaei',
      role: 'Operations Director',
      rating: 5,
    },
    {
      text: 'The team is incredibly responsive and helpful.',
      author: 'Maria Garcia',
      role: 'Transport Coordinator',
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Clients' },
    { icon: Zap, value: '99.9%', label: 'Uptime' },
    { icon: Clock, value: '<1hr', label: 'Response Time' },
    { icon: Star, value: '4.9/5', label: 'Rating' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setAlert({
        type: 'success',
        msg: '🎉 Your message has been sent successfully!',
      });
      setForm({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollPercent(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-56 h-56 bg-gradient-to-r from-blue-50 to-blue-150 rounded-full opacity-25 animate-blob animation-delay-4000"></div>
        <div
          className="absolute w-72 h-72 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full opacity-10 transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 144,
            top: mousePosition.y - 144,
            filter: 'blur(40px)',
          }}
        />
      </div>
      <div className="relative min-h-screen bg-white flex flex-col">
        <Header />
        <main className="relative z-10 pt-20 pb-24 px-6 md:px-20 flex-grow">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-slide-up-fade">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-gray-900 leading-tight">
              Contact Us
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to revolutionize your fleet management? Our expert team is
              here to help you succeed.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-slide-up-fade animation-delay-300">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Main Contact Section */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info Side */}
            <div className="space-y-8 animate-slide-up-fade animation-delay-600">
              {/* Contact Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  Ready to transform your business? Get in touch with our
                  amazing team!
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Mail,
                      text: 'contact@pathnio.com',
                      color: 'bg-red-500',
                    },
                    {
                      icon: Phone,
                      text: '+98 912 000 0000',
                      color: 'bg-green-500',
                    },
                    {
                      icon: MapPin,
                      text: 'Vakilabad St, Mashhad, Iran',
                      color: 'bg-blue-500',
                    },
                    {
                      icon: Globe,
                      text: 'www.pathnio.com',
                      color: 'bg-purple-500',
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 group cursor-pointer"
                      >
                        <div
                          className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-gray-700 text-lg group-hover:text-blue-600 transition-colors duration-300">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Testimonial Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    What Our Clients Say
                  </h3>
                </div>

                <div className="transition-all duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      )
                    )}
                  </div>

                  <blockquote className="text-gray-700 text-lg mb-4 italic">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>

                  <div className="text-gray-900 font-semibold">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-blue-600 w-8'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-slide-up-fade animation-delay-900">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Send us a Message
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-gray-800 mb-3 font-semibold text-lg">
                      Full Name ✨
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="What should we call you?"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-lg transition-all duration-300 group-hover:bg-gray-100"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-gray-800 mb-3 font-semibold text-lg">
                      Email Address 📧
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@awesome-email.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-lg transition-all duration-300 group-hover:bg-gray-100"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-gray-800 mb-3 font-semibold text-lg">
                      Your Message 💭
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell us about your amazing project! We're excited to hear from you..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-lg resize-none transition-all duration-300 group-hover:bg-gray-100"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden relative"
                  >
                    <div className="relative flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Sending your magic...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                          Send Message
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>
                </div>

                <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 font-semibold">
                      We respect your privacy
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Your information is secure with us and will never be shared
                    with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Alert */}
        {alert && (
          <div className="fixed top-6 right-6 z-50 bg-white border border-gray-200 rounded-2xl p-4 shadow-xl animate-slide-down">
            <div
              className={`text-lg font-semibold ${
                alert.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {alert.msg}
            </div>
          </div>
        )}

        {/* Animations */}
        <style jsx>{`
          @keyframes slide-up-fade {
            from {
              opacity: 0;
              transform: translateY(60px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }

          .animate-slide-up-fade {
            animation: slide-up-fade 1s ease-out forwards;
          }

          .animate-slide-down {
            animation: slide-down 0.5s ease-out forwards;
          }

          .animation-delay-300 {
            animation-delay: 0.3s;
          }

          .animation-delay-600 {
            animation-delay: 0.6s;
          }

          .animation-delay-900 {
            animation-delay: 0.9s;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }

          .animate-blob {
            animation: blob 7s infinite;
          }
        `}</style>
        {/* Footer is now outside the main content for visibility */}
      </div>
      <Footer />
    </>
  );
}
