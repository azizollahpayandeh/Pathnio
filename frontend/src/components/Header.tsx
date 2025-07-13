'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem('access');
    const userData = localStorage.getItem('user');

    if (access && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
    setMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/70 to-blue-600/70 shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl font-extrabold text-white tracking-wide drop-shadow-xl cursor-pointer select-none"
          >
            Pathnio
          </Link>
          <div className="w-20 h-8 bg-white/30 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-lg bg-gradient-to-r from-blue-900/90 to-blue-600/90 shadow-xl border-b border-white/25">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">
        {/* لوگو */}
        <Link
          href="/"
          className="text-3xl font-extrabold text-white tracking-wide drop-shadow-xl cursor-pointer select-none transition-transform duration-300 hover:scale-105"
          onClick={handleLinkClick}
        >
          Pathnio
        </Link>

        {/* دکمه منوی موبایل */}
        <button
          className={`md:hidden relative w-10 h-10 flex flex-col justify-center items-center group focus:outline-none`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {/* خطوط همبرگر با انیمیشن چرخش */}
          <span
            className={`block absolute h-1 w-7 bg-white rounded transition-transform duration-300 ease-in-out origin-center
              ${menuOpen ? 'rotate-45' : '-translate-y-3.5'}
            `}
          />
          <span
            className={`block absolute h-1 w-7 bg-white rounded transition-all duration-300 ease-in-out
              ${menuOpen ? 'opacity-0' : 'opacity-100'}
            `}
          />
          <span
            className={`block absolute h-1 w-7 bg-white rounded transition-transform duration-300 ease-in-out origin-center
              ${menuOpen ? '-rotate-45' : 'translate-y-3.5'}
            `}
          />
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* منو دسکتاپ */}
        <nav className="hidden md:flex space-x-8 text-white font-semibold items-center text-4x">
          <Link
            href="/"
            className="hover:text-blue-300 transition-colors duration-300"
            onClick={handleLinkClick}
          >
            Home
          </Link>
          <Link
            href="/features"
            className="hover:text-blue-300 transition-colors duration-300"
            onClick={handleLinkClick}
          >
            Features
          </Link>
          <Link
            href="/about"
            className="hover:text-blue-300 transition-colors duration-300"
            onClick={handleLinkClick}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="hover:text-blue-300 transition-colors duration-300"
            onClick={handleLinkClick}
          >
            Contact Us
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-400 transition-colors duration-300"
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-6 px-5 py-2 bg-white text-blue-900 font-semibold rounded-xl shadow-lg hover:bg-blue-100 transition-colors duration-300"
              onClick={handleLinkClick}
            >
              Login
            </Link>
          )}
        </nav>
      </div>

      {/* منوی موبایل با انیمیشن اسلاید */}
      <div
        className={`md:hidden bg-blue-900/95 text-white font-semibold flex flex-col px-6 overflow-hidden border-t border-blue-700
          transition-all duration-400 ease-in-out
          ${menuOpen ? 'max-h-96 py-6' : 'max-h-0 py-0'}
        `}
      >
        <Link
          href="/"
          onClick={handleLinkClick}
          className="py-2 hover:text-blue-300 transition-colors duration-300"
        >
          Home
        </Link>
        <Link
          href="/features"
          onClick={handleLinkClick}
          className="py-2 hover:text-blue-300 transition-colors duration-300"
        >
          Features
        </Link>
        <Link
          href="/about"
          onClick={handleLinkClick}
          className="py-2 hover:text-blue-300 transition-colors duration-300"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          onClick={handleLinkClick}
          className="py-2 hover:text-blue-300 transition-colors duration-300"
        >
          Contact Us
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-400 transition-colors duration-300"
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="mt-4 px-4 py-2 bg-white text-blue-900 font-semibold rounded-xl shadow-lg hover:bg-blue-100 transition-colors duration-300"
            onClick={handleLinkClick}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
