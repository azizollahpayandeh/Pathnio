'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
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
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/60 to-blue-600/60 shadow-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg cursor-pointer transition"
          >
            Pathnio
          </Link>
          <div className="w-20 h-8 bg-white/20 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

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
          <Link href="/" className="hover:text-blue-300 transition">
            Home
          </Link>
          <Link href="/features" className="hover:text-blue-300 transition">
            Features
          </Link>
          <Link href="/about" className="hover:text-blue-300 transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-blue-300 transition">
            Contact Us
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4 ml-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-6 px-4 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow hover:bg-blue-100 transition"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
