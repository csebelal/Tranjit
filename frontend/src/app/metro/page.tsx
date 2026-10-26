'use client';
import React, { useEffect, useState } from 'react';
import { useTransitStore } from '@/store/useTransitStore';
import { metroService } from '@/services/api';
import { Train, Map as MapIcon, Landmark, Clock, Route, DollarSign, GraduationCap, Navigation, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetroPage = () => {
  const { metroStations, fetchMetroStations } = useTransitStore();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [fareData, setFareData] = useState<{ fare: number; distance: string; time: number; from: string; to: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetroStations();
  }, [fetchMetroStations]);

  useEffect(() => {
    let mounted = true;
    const fetchFare = async () => {
      if (fromId && toId && fromId !== toId) {
        setIsLoading(true);
        setError(null);
        try {
          const data = await metroService.getFare(fromId, toId);
          if (mounted) setFareData(data);
        } catch (err) {
          if (mounted) {
            setFareData(null);
            setError('মেট্রোরেলের ভাড়া তথ্য লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।');
          }
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        setFareData(null);
        setError(null);
      }
    };

    fetchFare();
    return () => { mounted = false; };
  }, [fromId, toId]);

  const swapStations = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
  };

  return (
    <div className="bg-slate-50/50 pb-12">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#8B1A4A] via-[#A8245B] to-[#5D1131] px-5 pb-32 pt-8 text-white">
        <div className="absolute right-[-20%] top-[-20%] h-80 w-80 rounded-full bg-white/10 blur-3xl opacity-40"></div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
            <Train size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">মেট্রোরেল ভাড়া — MRT Line 6</span>
          </div>
          <h2 className="text-4xl font-black leading-[1.1] tracking-tighter">মেট্রোরেলে <span className="text-pink-300">যাতায়াত</span> এখন সহজ।</h2>
          <p className="max-w-[80%] text-sm font-medium leading-relaxed text-pink-100/70">উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত ১৬টি স্টেশন ও ১৯.৭২ কিমি দীর্ঘ পথ।</p>
        </div>
      </div>

      <div className="relative z-20 -mt-10 mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="space-y-6 lg:flex-1">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase text-slate-800"><DollarSign size={16} className="text-[#8B1A4A]" /> ভাড়া ক্যালকুলেটর</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="pl-1 text-[9px] font-black uppercase tracking-widest text-slate-400">শুরুর স্টেশন</label>
                  <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-bold text-slate-800 outline-none transition-all focus:border-pink-500 focus:bg-white" value={fromId} onChange={(e) => setFromId(e.target.value)}>
                    <option value="">স্টেশন বেছে নিন</option>
                    {metroStations.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="relative flex h-4 justify-center">
                  <button onClick={swapStations} className="absolute z-10 h-10 w-10 translate-y-[-50%] rounded-full border-2 border-slate-100 bg-white text-pink-700 shadow-md transition-all duration-500 hover:scale-110 hover:bg-slate-50 active:rotate-180">
                    <Route size={18} className="mx-auto" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="pl-1 text-[9px] font-black uppercase tracking-widest text-slate-400">গন্তব্য স্টেশন</label>
                  <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-bold text-slate-800 outline-none transition-all focus:border-pink-500 focus:bg-white" value={toId} onChange={(e) => setToId(e.target.value)}>
                    <option value="">স্টেশন বেছে নিন</option>
                    {metroStations.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-bold text-red-600"><AlertTriangle size={16} /> {error}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex justify-center py-12"><Train className="animate-pulse text-pink-700" size={40} /></div>
              ) : fareData ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-pink-800 to-[#5D1131] p-10 text-white shadow-2xl">
                    <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-white/5 blur-3xl opacity-50"></div>
                    <div className="relative space-y-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-200/80">মেট্রোরেল ভাড়া</p>
                      <h3 className="flex items-center justify-center text-8xl font-black tracking-tighter"><span className="mr-1 mt-[-10px] text-4xl opacity-60">৳</span>{fareData.fare}</h3>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                        <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-white/5 bg-white/15 px-4 py-2 backdrop-blur-md"><Clock size={14} className="text-pink-200" /><span className="text-xs font-black uppercase tracking-tighter">~{fareData.time} মিনিট</span></div>
                        <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-white/5 bg-white/15 px-4 py-2 backdrop-blur-md"><Navigation size={14} className="text-pink-200" /><span className="text-xs font-black uppercase tracking-tighter">{fareData.distance} কিমি</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="group flex items-center gap-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
                      <div className="h-14 w-14 rounded-2xl bg-white text-emerald-600 shadow-md transition-transform group-hover:scale-110 flex items-center justify-center"><GraduationCap size={28} /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700/60">ছাত্র ভাড়া (৫০% ছাড়)</p>
                        <h5 className="text-2xl font-black text-emerald-950">৳{Math.round(fareData.fare * 0.5)}</h5>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-pink-100 border-l-4 border-l-pink-700 bg-pink-50 p-6">
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-pink-950"><DollarSign size={14} /> মেট্রো এমআরটি কার্ড</h4>
                      <p className="text-xs font-medium leading-relaxed text-slate-500">এমআরটি কার্ড ব্যবহার করলে প্রতি যাত্রায় ছাড় প্রযোজ্য হতে পারে এবং এটি ক্যাশলেস পেমেন্টে সুবিধা দেয়।</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-3xl border border-slate-100 bg-white py-10 text-center">
                  <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300 animate-pulse"><Landmark size={36} /></div>
                  <h3 className="font-bold text-slate-400">ভাড়া দেখতে স্টেশন নির্বাচন করুন</h3>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6 lg:w-96">
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-slate-800"><MapIcon size={16} className="text-[#8B1A4A]" /> স্টেশন ম্যাপ</h4>
              <div className="relative py-4">
                <div className="absolute left-[19px] top-8 bottom-8 w-1 rounded-full bg-gradient-to-b from-pink-900 via-pink-600 to-pink-900"></div>
                <div className="space-y-1">
                  {metroStations.map((st) => {
                    const isTerminal = st.terminal;
                    const isMajor = st.major;
                    return (
                      <div key={st._id} className="relative flex items-center gap-4 py-2 pl-2">
                        <div className="relative z-10 flex-shrink-0">
                          {isTerminal ? <div className="flex h-5 w-5 items-center justify-center rounded-full border-4 border-white bg-pink-900 shadow-lg"><div className="h-1.5 w-1.5 rounded-full bg-white"></div></div> : isMajor ? <div className="h-4 w-4 rounded-full border-3 border-white bg-pink-600 shadow-md"></div> : <div className="h-3 w-3 rounded-full border-2 border-white bg-pink-400 shadow-sm"></div>}
                        </div>
                        <div className="min-w-0 flex-1 py-1">
                          <div className="flex items-center gap-2">
                            <span className={`truncate text-sm font-bold ${isTerminal ? 'text-pink-900' : isMajor ? 'text-slate-800' : 'text-slate-600'}`}>{st.name}</span>
                            {isTerminal && <span className="rounded bg-pink-900 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">End</span>}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400"><span className="truncate">{st.en}</span><span className="text-slate-300">•</span><span>{st.km.toFixed(2)} কিমি</span></div>
                        </div>
                        {isTerminal && <div className="rounded-lg bg-pink-50 px-2 py-1 text-[9px] font-bold text-pink-700">Zone {st.zone}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-pink-900"></div><span className="text-[9px] font-medium text-slate-500">Terminal</span></div>
                <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-pink-600"></div><span className="text-[9px] font-medium text-slate-500">Major</span></div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-pink-400"></div><span className="text-[9px] font-medium text-slate-500">Normal</span></div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-pink-900 p-6 text-white shadow-lg">
              <div className="absolute right-[-20%] bottom-[-20%] h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125"></div>
              <h4 className="mb-3 text-sm font-black">মেট্রোরেল হেল্পলাইন</h4>
              <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">📞</div><span className="text-2xl font-black tracking-tighter">১৬৪০৬</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetroPage;
