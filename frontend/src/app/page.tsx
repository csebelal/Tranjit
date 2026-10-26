"use client";
import React, { useRef, useState } from 'react';
import RouteFinder, { type RouteFinderRef } from '@/components/home/RouteFinder';
import FareSearchTable from '@/components/home/FareSearchTable';
import RecentSearches from '@/components/home/RecentSearches';
import PopularRoutes from '@/components/home/PopularRoutes';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRecentSearches } from '@/hooks/useRecentSearches';

const HomePage = () => {
  const routeFinderRef = useRef<RouteFinderRef>(null);
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();
  const [hasSearched, setHasSearched] = useState(false);

  const handlePopularRouteClick = (from: string, to: string) => {
    routeFinderRef.current?.setRoute(from, to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecentSelect = (from: string, to: string) => {
    routeFinderRef.current?.setRoute(from, to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (from: string, to: string) => {
    addSearch(from, to);
    setHasSearched(true);
  };

  return (
    <div className="bg-slate-50/30">
      {/* ... Hero Banner ... (kept) */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 px-5 pt-8 pb-32 text-white relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] w-60 h-60 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute left-[-5%] bottom-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit">
                <Sparkles size={12} className="text-yellow-400" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white/90">ঢাকা সিটি ট্রান্সপোর্ট ইন্টেলিজেন্স</span>
            </div>
            <h2 className="text-4xl font-black leading-[1.1] tracking-tighter">সহজেই খুঁজুন আপনার <span className="text-emerald-300">ভ্রমণ রুট।</span></h2>
            <p className="text-sm text-emerald-100/70 font-medium leading-relaxed max-w-[80%]">ঢাকা শহরের ১০৬টিরও বেশি লোকাল বাস সার্ভিস এবং মেট্রোরেলের তথ্য সম্বলিত স্মার্ট গাইড।</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8">
            <RouteFinder ref={routeFinderRef} onSearch={handleSearch} />
          </div>

          {/* Side Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Searches */}
            {hasSearched && (
              <RecentSearches 
                searches={recentSearches}
                onSelect={handleRecentSelect}
                onRemove={removeSearch}
                onClearAll={clearAll}
              />
            )}
            
            {/* Popular Routes */}
            <PopularRoutes onSelect={handlePopularRouteClick} />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Link href="/buses" className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden relative active:scale-95 transition-transform group">
                <div className="absolute right-[-10%] bottom-[-10%] h-16 w-16 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100 transition-colors"></div>
                <div className="relative">
                    <div className="h-10 w-10 bg-emerald-100 flex items-center justify-center rounded-xl text-emerald-700 mb-4 transition-transform group-hover:-translate-y-1">🚌</div>
                    <h5 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-1 items-center">বাস সার্ভিস</h5>
                    <p className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors leading-normal">সব বাসের তালিকা ও রুট দেখুন</p>
                </div>
              </Link>

              <Link href="/metro" className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden relative active:scale-95 transition-transform group">
                <div className="absolute right-[-10%] bottom-[-10%] h-16 w-16 bg-pink-50 rounded-full blur-xl group-hover:bg-pink-100 transition-colors"></div>
                <div className="relative">
                    <div className="h-10 w-10 bg-pink-100 flex items-center justify-center rounded-xl text-pink-700 mb-4 transition-transform group-hover:-translate-y-1">🚇</div>
                    <h5 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-1 items-center">মেট্রোরেল (MRT)</h5>
                    <p className="text-[11px] font-bold text-slate-400 group-hover:text-pink-700 transition-colors leading-normal">মেট্রোরেল ভাড়া ও স্টেশন ম্যাপ</p>
                </div>
              </Link>
            </div>

            {/* Quick Fare Lookup TABLE */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="h-6 w-6 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">৳</div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">দ্রুত ভাড়া তথ্য গ্যালারি</h4>
                </div>
                <FareSearchTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
