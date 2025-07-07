'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="text-gray-800 font-sans">
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/60 to-blue-600/60 shadow-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Pathnio
          </h1>
          <nav className="space-x-6 text-white font-medium flex items-center">
            <Link href="/" className="hover:text-blue-300 transition">
              Home
            </Link>
            <Link href="#features" className="hover:text-blue-300 transition">
              Features
            </Link>
            <Link href="/about" className="text-blue-300 font-semibold">
              About Us
            </Link>
            <Link href="#contact" className="hover:text-blue-300 transition">
              Contact Us
            </Link>
            <Link
              href="/login"
              className="ml-6 px-4 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-20 bg-white min-h-screen flex items-center justify-center">
  <div className="max-w-7xl mx-auto flex items-center gap-20">
    {/* عکس */}
    <div className="flex-shrink-0 w-[55%] h-[600px] rounded-3xl overflow-hidden shadow-xl">
      <img
        src="/images/about.png"
        alt="Our Team"
        className="w-full h-full object-center"
      />
    </div>

    {/* متن */}
    <div className="w-[45%]">
      <h2 className="text-4xl font-extrabold text-blue-800 mb-6 animate-text-fade-in">
        About Pathnio
      </h2>
      <p
        className="text-lg text-gray-600 leading-relaxed mb-4 animate-text-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        Pathnio is built by a team of engineers and designers passionate
        about innovation in logistics. We saw a gap in real-time fleet
        management — and we decided to build the future.
      </p>
      <p
        className="text-lg text-gray-600 leading-relaxed animate-text-fade-in"
        style={{ animationDelay: '0.4s' }}
      >
        From intuitive dashboards to AI-based insights, everything at
        Pathnio is built to make your transport operations smarter,
        faster, and more profitable.
      </p>
    </div>
  </div>
</main>



      <footer className="bg-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h5 className="text-2xl font-semibold mb-4">Get in Touch</h5>
          <p className="mb-4 text-gray-300">
            For business inquiries, partnership proposals, or general questions,
            feel free to contact our team.
          </p>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes text-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-text-fade-in {
          animation: text-fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
