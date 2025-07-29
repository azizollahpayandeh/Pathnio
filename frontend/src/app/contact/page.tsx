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
  CheckCircle,
  Sparkles,
  ArrowRight,
  Globe,
  Shield,
  Heart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import FloatingAlert from '@/components/FloatingAlert';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [scrollPercent, setScrollPercent] = useState(0);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Pathnio transformed our fleet management completely!',
      author: 'Sarah Johnson',
      role: 'Fleet Manager',
      rating: 5,
    },
    {
      text: "Best customer support I've ever experienced.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:8000/api/accounts/contact/', form);
      setAlert({
        type: 'success',
        msg: '🎉 Your message has been sent successfully!',
      });
      setForm({ name: '', email: '', message: '' });
    } catch {
      setAlert({
        type: 'error',
        msg: '❌ There was an error sending your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="relative min-h-screen overflow-hidden">
      <Header />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"></div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle opacity-30"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 3 + 2 + 's',
              }}
            />
          ))}
        </div>

        {/* Mouse Following Gradient */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up-fade">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Get in Touch</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Let's Create
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Magic Together
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Ready to revolutionize your fleet management? Our team of experts is
            here to help you succeed.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-slide-up-fade animation-delay-300">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main Contact Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info Side */}
          <div className="space-y-8 animate-slide-up-fade animation-delay-600">
            {/* Contact Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Contact Information
                </h2>
              </div>

              <p className="text-white/80 mb-8 text-lg">
                Ready to transform your business? Reach out to our amazing team!
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    text: 'contact@pathnio.com',
                    color: 'from-red-400 to-pink-500',
                  },
                  {
                    icon: Phone,
                    text: '+98 912 000 0000',
                    color: 'from-green-400 to-emerald-500',
                  },
                  {
                    icon: MapPin,
                    text: 'Vakilabad St, Mashhad, Iran',
                    color: 'from-blue-400 to-indigo-500',
                  },
                  {
                    icon: Globe,
                    text: 'www.pathnio.com',
                    color: 'from-purple-400 to-violet-500',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-lg group-hover:text-yellow-300 transition-colors duration-300">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
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

                <blockquote className="text-white/90 text-lg mb-4 italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                <div className="text-white font-semibold">
                  {testimonials[currentTestimonial].author}
                </div>
                <div className="text-white/70">
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
                        ? 'bg-yellow-400 w-8'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-up-fade animation-delay-900">
            <div className="backdrop-blur-xl bg-white/15 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Send us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label
                    htmlFor="name"
                    className="block text-white/90 mb-3 font-semibold text-lg"
                  >
                    Full Name ✨
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="What should we call you?"
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 text-lg transition-all duration-300 group-hover:bg-white/25"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-white/90 mb-3 font-semibold text-lg"
                  >
                    Email Address 📧
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@awesome-email.com"
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 text-lg transition-all duration-300 group-hover:bg-white/25"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="message"
                    className="block text-white/90 mb-3 font-semibold text-lg"
                  >
                    Your Message 💭
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us about your amazing project! We're excited to hear from you..."
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 text-lg resize-none transition-all duration-300 group-hover:bg-white/25"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              </form>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">
                    We respect your privacy
                  </span>
                </div>
                <p className="text-white/80 text-sm">
                  Your information is secure with us and will never be shared
                  with third parties.
                </p>
              </div>
            </div>
          </div>
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
      {alert && (
        <FloatingAlert
          type={alert.type}
          msg={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Enhanced Animations */}
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

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 1s ease-out forwards;
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

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
