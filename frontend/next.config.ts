import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // اجازه لود عکس از بک‌اند (لوکال و پروداکشن) و آیکون‌های خارجی
    remotePatterns: [
      // توسعه لوکال (هر پورتی روی localhost)
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      // بک‌اند روی ورسل
      {
        protocol: "https",
        hostname: "pathnio-backend.vercel.app",
      },
      // اگر بعداً دامین سفارشی اضافه شد، اینجا راحت می‌شود اضافه کرد
      // آیکون‌های خارجی
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
};

export default nextConfig;
