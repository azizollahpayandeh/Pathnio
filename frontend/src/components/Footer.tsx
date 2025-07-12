// components/Footer.tsx

import React from 'react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-blue-800 text-white py-16 px-6">
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
              <a href="/" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/features" className="hover:underline">
                Features
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact Us
              </a>
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
