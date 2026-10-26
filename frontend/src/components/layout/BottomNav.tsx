"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bus, Train, Heart, ChartBar } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NavItems = () => {
  const pathname = usePathname();

  const items = [
    { title: "Home", path: "/", icon: <Home size={22} /> },
    { title: "Fare Chart", path: "/fare-chart", icon: <ChartBar size={22} /> },
    { title: "Buses", path: "/buses", icon: <Bus size={22} /> },
    { title: "Metro", path: "/metro", icon: <Train size={22} /> },
    { title: "About", path: "/about", icon: <Heart size={22} /> },
  ];

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex flex-col md:flex-row items-center gap-2 md:gap-4 px-3 md:px-5 py-2 md:py-3 transition-all duration-300 rounded-2xl md:w-full",
              isActive
                ? "text-emerald-900 font-bold md:bg-emerald-50"
                : "text-slate-400 hover:text-slate-600 md:hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-emerald-100/60 scale-110 md:scale-100 md:bg-transparent" : ""
              )}
            >
              {item.icon}
            </span>
            <span className="text-[10px] md:text-sm tracking-wide uppercase md:capitalize md:tracking-normal font-bold">
              {item.title}
            </span>
          </Link>
        );
      })}
    </>
  );
};

const Navigation = () => {
  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-slate-200 bg-white/80 pb-[env(safe-area-inset-bottom,12px)] pt-3 backdrop-blur-xl transition shadow-lg px-2">
        <NavItems />
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[73px] bottom-0 w-64 flex-col border-r border-slate-100 bg-white p-6 space-y-2 z-40">
        <div className="mb-4 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-300">মূল মেনু</div>
        <NavItems />
        
        <div className="mt-auto p-4 rounded-3xl bg-emerald-900 text-white relative overflow-hidden group">
            <div className="absolute right-[-10%] bottom-[-10%] h-16 w-16 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
            <p className="text-[10px] font-black uppercase text-emerald-200 mb-2">হেল্পলাইন</p>
            <h4 className="text-xl font-black">১৬৮৮৮</h4>
            <p className="text-[9px] text-emerald-100/60 mt-1">যেকোনো তথ্যের জন্য কল করুন</p>
        </div>
        
        <div className="mt-4 text-center">
          <a 
            href="https://belal09.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
          >
            Developed by Belal Hossain
          </a>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
