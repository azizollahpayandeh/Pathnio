import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider, LOCALE_COOKIE, LOCALES, DEFAULT_LOCALE, type LocaleCode } from "@/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the language on the SERVER so the first paint is already correct
  // and hydration matches (rendering English then swapping to Persian caused
  // React to keep the server markup, leaving pages in English).
  const cookieLang = (await cookies()).get(LOCALE_COOKIE)?.value as LocaleCode | undefined;
  const locale: LocaleCode = cookieLang && LOCALES[cookieLang] ? cookieLang : DEFAULT_LOCALE;
  const dir = LOCALES[locale]?.dir ?? "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f4f8fb] text-[#171717]`}>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
