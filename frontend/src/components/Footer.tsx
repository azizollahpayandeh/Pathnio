import React from "react";
import Link from "next/link";
import { Truck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-8 px-6 relative z-20">
      <div className="container mx-auto grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white mb-4">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </span>
            Pathnio
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            A modern solution to track, manage and optimize fleet operations in real time.
          </p>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h6>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/dashboard/reports" className="hover:text-white transition-colors">Analytics</Link></li>
            <li><Link href="/dashboard/live-map" className="hover:text-white transition-colors">Live Map</Link></li>
          </ul>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h6>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get in touch</h6>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@pathnio.com</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +49 30 1234 5678</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Alexanderplatz 1, Berlin</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
      </div>
    </footer>
  );
}
