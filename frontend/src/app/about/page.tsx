'use client';

import { useEffect, useState, useRef, RefObject } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { Code, Users, Zap, Target, Heart, Star, ArrowRight, Sparkles } from 'lucide-react';

// A custom hook to detect if an element is in view with TypeScript support
function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
): [RefObject<T>, boolean] {
  const [inView, setInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options, inView]);

  // The type cast here resolves the mismatch between useRef's initial null value and React's ref prop type.
  return [ref as RefObject<T>, inView];
}

const aboutOptions = { threshold: 0.3 };
const joinOptions = { threshold: 0.3 };
const teamOptions = { threshold: 0.3 };

export default function AboutPage() {
  const [aboutSectionRef, aboutInView] = useInView<HTMLElement>(aboutOptions);
  const [teamSectionRef, teamInView] = useInView<HTMLElement>(teamOptions);
  const [joinSectionRef, joinInView] = useInView<HTMLElement>(joinOptions);
  
  // Fixed particle positions to avoid hydration mismatch
  const particles = [
    { left: 15, top: 20, delay: 0.5, duration: 3.2 },
    { left: 85, top: 15, delay: 1.2, duration: 4.1 },
    { left: 25, top: 60, delay: 0.8, duration: 3.8 },
    { left: 75, top: 70, delay: 1.8, duration: 4.3 },
    { left: 45, top: 25, delay: 0.3, duration: 3.5 },
    { left: 65, top: 85, delay: 2.1, duration: 3.9 },
    { left: 35, top: 45, delay: 1.5, duration: 4.0 },
    { left: 90, top: 40, delay: 0.9, duration: 3.7 },
    { left: 10, top: 80, delay: 2.3, duration: 3.6 },
    { left: 55, top: 10, delay: 1.1, duration: 4.2 }
  ];

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          ></div>
        ))}
      </div>

      <Header />

      <main className="flex-grow pt-24 md:pt-32 pb-16 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">About Our Journey</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent animate-gradient">
                About
              </span>
              <br />
              <span className="text-gray-900">Pathnio</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-slide-up">
              Revolutionizing logistics through cutting-edge technology and innovative solutions
            </p>
          </div>
        </section>

        {/* About Pathnio Section */}
        <section ref={aboutSectionRef} className="py-16 sm:py-24 md:py-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
              <div
                className={`space-y-8 transition-all duration-1000 ease-out ${
                  aboutInView
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-20'
                }`}
              >
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                    Our Story
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Pathnio was born from a vision to transform the logistics industry. We saw the challenges 
                    faced by fleet managers and transportation companies worldwide, and we decided to build 
                    the future of fleet management.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    From intuitive dashboards to AI-powered insights, every feature at Pathnio is meticulously 
                    crafted to empower your transport operations and drive unprecedented efficiency.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <Code className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                    <p className="text-gray-600 text-sm">Cutting-edge technology solutions</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <Target className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Precision</h3>
                    <p className="text-gray-600 text-sm">Accurate real-time monitoring</p>
                  </div>
                </div>
              </div>

              {/* Image with Enhanced Effects */}
              <div
                className={`relative transition-all duration-1000 ease-out ${
                  aboutInView
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-20'
                }`}
              >
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl transform scale-110"></div>
                  
                  {/* Main Image Container */}
                  <div className="relative w-full h-80 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden border border-blue-200 shadow-2xl">
                    <Image
                      src="/images/Pathnio.png"
                      alt="Pathnio Technology"
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent"></div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section ref={teamSectionRef} className="py-16 sm:py-24 md:py-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div
              className={`text-center mb-20 transition-all duration-1000 ease-out ${
                teamInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Meet Our Team</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight">
                Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Meet our passionate and expert team who work tirelessly every day to innovate in the logistics industry
              </p>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Team Member 1 - Azizollah Paeezadeh */}
              <div
                className={`group transition-all duration-700 ease-out ${
                  teamInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:shadow-blue-500/25">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Profile Image */}
                  <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-cyan-400/50 rounded-full"></div>
                      <span className="relative z-10">AP</span>
                    </div>
                    {/* Floating Ring */}
                    <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin-slow"></div>
                  </div>
                  
                  {/* Team Member Info */}
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                      Azizollah Payanda
                    </h3>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full border border-blue-200 mb-6">
                      <Code className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-semibold">Full Stack Developer & Founder</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                      Azizollah Payanda is the full stack developer and founder of Pathnio. With years of experience in logistics and technology, 
                      he has shaped our vision for creating intelligent fleet management solutions that revolutionize the industry.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100 border border-blue-200 transition-all duration-300 hover:scale-110">
                        <span className="text-blue-600 font-bold text-sm">L</span>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100 border border-blue-200 transition-all duration-300 hover:scale-110">
                        <span className="text-blue-600 font-bold text-sm">T</span>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100 border border-blue-200 transition-all duration-300 hover:scale-110">
                        <span className="text-blue-600 font-bold text-sm">E</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Member 2 - Amir Mohammad Marvi */}
              <div
                className={`group transition-all duration-700 ease-out ${
                  teamInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-green-100 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:shadow-green-500/25">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Profile Image */}
                  <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 via-emerald-500 to-green-700 flex items-center justify-center text-white text-3xl font-bold relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/50 to-emerald-400/50 rounded-full"></div>
                      <span className="relative z-10">AM</span>
                    </div>
                    {/* Floating Ring */}
                    <div className="absolute inset-0 border-2 border-green-400/30 rounded-full animate-spin-slow"></div>
                  </div>
                  
                  {/* Team Member Info */}
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">
                      AmirMuhammad Marwi
                    </h3>
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full border border-green-200 mb-6">
                      <Zap className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-800 font-semibold">Employee</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                      AmirMuhammad Marwi is a valued employee at Pathnio. With dedication and commitment, 
                      he contributes to the success of our team and helps deliver quality solutions to our clients.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center hover:bg-green-100 border border-green-200 transition-all duration-300 hover:scale-110">
                        <span className="text-green-600 font-bold text-sm">G</span>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center hover:bg-green-100 border border-green-200 transition-all duration-300 hover:scale-110">
                        <span className="text-green-600 font-bold text-sm">T</span>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center hover:bg-green-100 border border-green-200 transition-all duration-300 hover:scale-110">
                        <span className="text-green-600 font-bold text-sm">D</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Values */}
            <div
              className={`mt-20 text-center transition-all duration-1000 ease-out ${
                teamInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-blue-100">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-green-500/5 rounded-3xl blur-xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-8">
                    Our Team Values
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center group">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-blue-500/25">
                        <span className="text-white text-3xl">💡</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-cyan-400/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">Innovation</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">Always seeking new and better solutions to push the boundaries of what's possible</p>
                    </div>
                    <div className="text-center group">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-green-500/25">
                        <span className="text-white text-3xl">🤝</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/50 to-emerald-400/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors duration-300">Collaboration</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">Teamwork and cooperation to achieve common goals and create amazing results</p>
                    </div>
                    <div className="text-center group">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-purple-500/25">
                        <span className="text-white text-3xl">🎯</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-pink-400/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">Quality</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">Commitment to delivering the best quality in all products and services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section ref={joinSectionRef} className="py-24 md:py-32 text-center max-w-6xl mx-auto relative z-10">
          <div
            className={`transition-all duration-1000 ease-out ${
              joinInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-blue-100">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 backdrop-blur-sm rounded-full border border-blue-200 mb-8">
                  <Heart className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Join Our Mission</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-8 leading-tight">
                  Join Our Mission
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto">
                  We're always looking for talented individuals to help us build the next generation of logistics technology.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/careers"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold rounded-full text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
                    <span className="relative z-10 flex items-center">
              View Openings
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link
                    href="/contact"
                    className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-full text-lg border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                  >
                    <span className="flex items-center">
                      Get in Touch
                      <Star className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes text-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-text-fade-in-up {
          animation: text-fade-in-up 1s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-fade-in {
          animation: text-fade-in-up 1s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: text-fade-in-up 1s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}