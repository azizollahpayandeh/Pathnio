"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Truck, Menu, X } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over the dark hero on the home page; solid elsewhere so the
  // white nav text always stays readable over light backgrounds.
  const solid = scrolled || pathname !== "/";

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        solid
          ? "bg-blue-950/90 backdrop-blur-lg shadow-lg border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-5 sm:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-wide" onClick={() => setMenuOpen(false)}>
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-brand">
            <Truck className="w-5 h-5 text-white" />
          </span>
          Pathnio
        </Link>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <nav className="hidden md:flex items-center gap-8 text-white/90 font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            href={loggedIn ? "/dashboard" : "/login"}
            className="px-5 py-2 bg-white text-blue-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {loggedIn ? "Dashboard" : "Sign In"}
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-blue-950/95 backdrop-blur-lg ${menuOpen ? "max-h-96 py-4 border-t border-white/10" : "max-h-0"}`}>
        <div className="flex flex-col px-6 gap-1 text-white/90 font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            href={loggedIn ? "/dashboard" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="mt-3 px-4 py-2.5 bg-white text-blue-800 font-semibold rounded-xl text-center"
          >
            {loggedIn ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </div>
    </header>
  );
}
