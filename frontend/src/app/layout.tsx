import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isSupported, dirOf, type LocaleCode } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Vazirmatn is a variable Persian typeface purpose-built for UI text — it
// gives the "fa" locale proper Farsi glyph shaping instead of falling back
// to the OS default (Segoe UI/Tahoma), which reads noticeably worse.
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Pathnio — Modern Fleet Management",
  description:
    "Track, manage and optimize your entire fleet in real time — drivers, vehicles, trips, expenses and analytics in one beautiful dashboard.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the language on the SERVER so the first paint is already correct
  // and hydration matches (rendering English then swapping to Persian caused
  // React to keep the server markup, leaving pages in English).
  const cookieLang = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: LocaleCode = isSupported(cookieLang) ? cookieLang : DEFAULT_LOCALE;
  const dir = dirOf(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased bg-[#f4f8fb] text-[#171717]`}>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
