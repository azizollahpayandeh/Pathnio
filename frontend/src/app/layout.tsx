import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathnio — Modern Fleet Management",
  description:
    "Track, manage and optimize your entire fleet in real time — drivers, vehicles, trips, expenses and analytics in one beautiful dashboard.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang/dir are managed at runtime by I18nProvider (RTL for Persian).
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f4f8fb] text-[#171717]`}>

        <I18nProvider>{children}</I18nProvider>

      </body>
    </html>
  );
}
