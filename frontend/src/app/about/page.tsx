'use client';

import { useEffect, useState, useRef, RefObject } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

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
const joinOptions = { threshold: 0.5 };

export default function AboutPage() {
  const [aboutSectionRef, aboutInView] = useInView<HTMLElement>(aboutOptions);
  const [joinSectionRef, joinInView] = useInView<HTMLElement>(joinOptions);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-24 md:pt-32 pb-16 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* About Pathnio Section */}
        <section ref={aboutSectionRef} className="py-16 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
            {/* Text Content */}
            <div
              className={`w-full lg:w-1/2 text-center lg:text-left transition-all duration-700 ease-out ${
                aboutInView
                  ? 'opacity-100 translate-y-0 lg:translate-x-0'
                  : 'opacity-0 translate-y-16 lg:translate-x-16'
              }`}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-700 mb-6 leading-tight">
                About Pathnio
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                Pathnio is built by a team of engineers and designers passionate about innovation in logistics. We saw a gap in real-time fleet management — and we decided to build the future. Our journey started with a simple idea: to create a platform that makes logistics smarter, faster, and more profitable for everyone.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                From intuitive dashboards to AI-based insights, every feature at Pathnio is meticulously crafted to empower your transport operations. We believe technology should work for you, not the other way around.
              </p>
            </div>
            {/* Image */}
            <div
              className={`w-full lg:w-1/2 flex-shrink-0 transition-all duration-700 ease-out ${
                aboutInView
                  ? 'opacity-100 translate-y-0 lg:translate-x-0'
                  : 'opacity-0 translate-y-16 lg:-translate-x-16'
              }`}
            >
              <div className="relative w-full h-80 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-3xl">
                <Image
                  src="/images/pathnio.png"
                  alt="Our Vision"
                  fill
                  objectFit="cover"
                  objectPosition="center"
                  className="hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section ref={joinSectionRef} className="py-24 md:py-32 text-center max-w-6xl mx-auto">
          <div
            className={`transition-all duration-700 ease-out ${
              joinInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-700 mb-6 leading-tight">
              Join Our Mission
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8">
              We're always looking for talented individuals to help us build the next generation of logistics technology.
            </p>
            <Link
              href="/careers"
              className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-full text-lg shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              View Openings
            </Link>
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
        .animate-text-fade-in-up {
          animation: text-fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}