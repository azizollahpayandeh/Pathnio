// components/Footer.tsx

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-blue-800 text-white py-16 px-6 z-20 relative"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <h5 className="text-xl font-bold mb-4">Pathnio</h5>
          <p className="text-gray-300 text-sm">
            A modern solution to track, manage and optimize fleet operations.
          </p>
        </div>

        <div>
          <h6 className="text-lg font-semibold mb-3">Quick Links</h6>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h6 className="text-lg font-semibold mb-3">Contact Us</h6>
          <p className="text-sm text-gray-300">Email: support@pathnio.com</p>
          <p className="text-sm text-gray-300">Phone: +1 800 123 4567</p>
          <p className="text-sm text-gray-300">Address: 123 Fleet Ave, NY</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-10">
        &copy; {new Date().getFullYear()} Pathnio Inc. All rights reserved.
      </div>
    </footer>
  );
}
