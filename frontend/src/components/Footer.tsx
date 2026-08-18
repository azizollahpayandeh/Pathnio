"use client";
import React from "react";
import Link from "next/link";
import { Truck, Mail, Phone, MapPin } from "lucide-react";
import { useT } from "@/i18n";

export default function Footer() {
  const tr = useT();
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-8 px-6 relative z-20">
      <div className="container mx-auto grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white mb-4">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </span>
            Pathnio
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">{tr("ui.footer_tagline")}</p>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{tr("ui.product")}</h6>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/features" className="hover:text-white transition-colors">{tr("ui.features")}</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">{tr("ui.dashboard")}</Link></li>
            <li><Link href="/dashboard/reports" className="hover:text-white transition-colors">{tr("ui.analytics")}</Link></li>
            <li><Link href="/dashboard/live-map" className="hover:text-white transition-colors">{tr("ui.live_map")}</Link></li>
          </ul>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{tr("ui.company")}</h6>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">{tr("ui.about_us")}</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">{tr("ui.contact")}</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">{tr("ui.sign_in")}</Link></li>
          </ul>
        </div>

        <div>
          <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{tr("ui.get_in_touch")}</h6>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@pathnio.com</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +49 30 1234 5678</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {tr("ui.office_address")}</li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
      </div>
    </footer>
  );
}
