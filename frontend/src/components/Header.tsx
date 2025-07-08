'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/60 to-blue-600/60 shadow-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* لوگو که لینک به صفحه اصلی داره */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg cursor-pointer transition"
        >
          Pathnio
        </Link>

        <nav className="space-x-6 text-white font-medium flex items-center">
          <a href="/" className="hover:text-blue-300 transition">
            Home
          </a>
          <a href="/features" className="hover:text-blue-300 transition">
            Features
          </a>
          <a href="/about" className="hover:text-blue-300 transition">
            About Us
          </a>
          <a href="/contact" className="hover:text-blue-300 transition">
            Contact Us
          </a>
          <Link
            href="/login"
            className="ml-6 px-4 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
