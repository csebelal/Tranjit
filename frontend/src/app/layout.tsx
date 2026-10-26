import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navigation from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoBengali = Noto_Sans_Bengali({ 
  subsets: ["bengali"], 
  variable: "--font-noto-bengali",
  weight: ['400', '700']
});

export const metadata: Metadata = {
  title: "Dhaka Transit — Your Dhaka City Transport Guide",
  description: "Find bus routes, calc fares, and explore Dhaka Metro (MRT) schedules with Dhaka Transit intelligence system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoBengali.variable}`}>
      <body className="bg-slate-50 font-sans text-slate-900 min-h-screen">
        <div className="min-h-screen bg-white relative transition-all duration-300">
          <header className="sticky top-0 z-50 flex items-center justify-between bg-white/90 px-6 py-4 backdrop-blur-xl border-b border-slate-100 h-[73px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-lg shadow-emerald-200">
                🚌
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-emerald-950 leading-tight">Dhaka Transit</h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold hidden sm:block">১০৬+ বাস সার্ভিস • মেট্রারেলে ঢাকা</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
<div className="hidden md:flex items-center gap-6 mr-6">
                <Link href="/" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">সরাসরি রুট</Link>
                <Link href="/fare-calculator" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">ভাড়া ক্যালকুলেটর</Link>
                <Link href="/fare-chart" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">ভাড়া চার্ট</Link>
                <Link href="/about" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">সম্পর্কে</Link>
                <Link href="/metro" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">মেট্রোরেল ভাড়া</Link>
                <Link href="/info" className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">সহায়িকা</Link>
              </div>
              <button className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                বাং/EN
              </button>
            </div>
          </header>
          
          <div className="flex">
            <Navigation />
            <main className="flex-1 md:pl-64 transition-all duration-300">
              <div className="min-h-[calc(100vh-73px)] pb-24 md:pb-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
