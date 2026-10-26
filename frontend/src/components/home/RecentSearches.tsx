'use client';
import React from 'react';
import { Clock, X } from 'lucide-react';
import type { RecentSearch } from '@/hooks/useRecentSearches';

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (from: string, to: string) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export default function RecentSearches({ searches, onSelect, onRemove, onClearAll }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">সাম্প্রতিক অনুসন্ধান</h4>
        </div>
        <button 
          onClick={onClearAll}
          className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors"
        >
          সব মুছুন
        </button>
      </div>

      <div className="space-y-2">
        {searches.map((search, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer group transition-all"
            onClick={() => onSelect(search.from, search.to)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 truncate">{search.from}</span>
                <span className="text-slate-300 text-[10px]">→</span>
                <span className="text-xs font-bold text-slate-700 truncate">{search.to}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-full transition-all"
            >
              <X size={12} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}