'use client';
import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

interface PopularRoute {
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  desc: string;
  icon?: string;
}

interface PopularRoutesProps {
  onSelect: (from: string, to: string) => void;
}

const popularRoutes: PopularRoute[] = [
  { from: "মিরপুর ১০", to: "মতিঝিল", fromLabel: "মিরপুর ১০", toLabel: "মতিঝিল", desc: "সবচেয়ে ব্যস্ত করিডোর", icon: "🔥" },
  { from: "হাউজ বিল্ডিং", to: "ফার্মগেট", fromLabel: "উত্তরা", toLabel: "ফার্মগেট", desc: "অফিস কমিউটার রুট", icon: "💼" },
  { from: "গাবতলী", to: "গুলিস্তান", fromLabel: "গাবতলী", toLabel: "গুলিস্তান", desc: "পশ্চিম–পূর্ব প্রধান রুট", icon: "🚌" },
  { from: "মোহাম্মদপুর", to: "শাহবাগ", fromLabel: "মোহাম্মদপুর", toLabel: "শাহবাগ", desc: "শিক্ষার্থী • বিশ্ববিদ্যালয়", icon: "🎓" },
  { from: "যাত্রাবাড়ি", to: "মতিঝিল", fromLabel: "যাত্রাবাড়ি", toLabel: "মতিঝিল", desc: "দক্ষিণ ঢাকা • ব্যবসা কেন্দ্র", icon: "🏙️" },
  { from: "সদরঘাট", to: "মিরপুর ১০", fromLabel: "সদরঘাট", toLabel: "মিরপুর ১০", desc: "পুরান ঢাকা • মিরপুর", icon: "⚓" },
  { from: "বাড্ডা", to: "গুলিস্তান", fromLabel: "বাড্ডা", toLabel: "গুলিস্তান", desc: "পূর্ব ঢাকা • কেন্দ্রীয় রুট", icon: "🔄" },
  { from: "শ্যামলী", to: "ফার্মগেট", fromLabel: "শ্যামলী", toLabel: "ফার্মগেট", desc: "পশ্চিম ঢাকা • অফিস জোন", icon: "🏢" },
];

export default function PopularRoutes({ onSelect }: PopularRoutesProps) {
  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-600" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-800">জনপ্রিয় রুট</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {popularRoutes.map((route, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-transparent hover:bg-white hover:border-emerald-100 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelect(route.from, route.to)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
              {route.icon || "🚌"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{route.fromLabel}</span>
                <span className="text-slate-300 text-[10px]">→</span>
                <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{route.toLabel}</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">
                {route.desc}
              </p>
            </div>
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Zap size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}