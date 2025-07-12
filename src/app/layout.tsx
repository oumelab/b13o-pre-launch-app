import Footer from "@/components/footer";
import Header from "@/components/header";
import { NotificationBanner } from "@/components/ui/notification-banner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "もくもく React",
  description: "もくもく React の事前予約サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Header />
          <NotificationBanner />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
