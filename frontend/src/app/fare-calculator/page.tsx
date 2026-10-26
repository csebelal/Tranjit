'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTransitStore } from '@/store/useTransitStore';
import { Calculator, Train, Bus, GraduationCap, Snowflake, Users, Info, Route, DollarSign, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TransportMode = 'bus' | 'metro';

interface FareResult {
  baseFare: number;
  studentFare: number;
  acFare: number;
  distance?: number;
  stations?: number;
}

const FareCalculatorPage = () => {
  const [mode, setMode] = useState<TransportMode>('bus');
  const [copied, setCopied] = useState(false);
  const { metroStations, fetchMetroStations } = useTransitStore();

  const [busDistance, setBusDistance] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMetroStations(); }, []);

  const calculateBusFare = (dist: number) => {
    const RATE = 2.45;
    const MIN_FARE = 10;
    return Math.max(MIN_FARE, Math.round(dist * RATE));
  };

  const calculateMetroFare = (fromKm: number, toKm: number) => {
    const d = Math.abs(toKm - fromKm);
    if (d <= 2) return 20;
    if (d <= 5) return 30;
    if (d <= 8) return 40;
    if (d <= 10) return 50;
    if (d <= 12) return 60;
    if (d <= 15) return 70;
    if (d <= 17) return 80;
    return 100;
  };

  const busResult = useMemo(() => {
    if (mode !== 'bus' || !busDistance) return null;
    const dist = parseFloat(busDistance);
    if (dist <= 0) return null;
    const baseFare = calculateBusFare(dist);
    return {
      baseFare,
      studentFare: Math.round(baseFare * 0.5),
      acFare: Math.round(baseFare * 1.3),
      distance: dist,
    } as FareResult;
  }, [mode, busDistance]);

  const metroResult = useMemo(() => {
    if (mode !== 'metro' || !fromStation || !toStation) return null;
    const from = metroStations.find((s) => s._id === fromStation);
    const to = metroStations.find((s) => s._id === toStation);
    if (!from || !to) return null;
    const baseFare = calculateMetroFare(from.km, to.km);
    const stationCount = Math.abs(metroStations.findIndex((s) => s._id === toStation) - metroStations.findIndex((s) => s._id === fromStation));
    return {
      baseFare,
      studentFare: Math.round(baseFare * 0.5),
      acFare: baseFare,
      distance: Math.abs(to.km - from.km),
      stations: stationCount,
    } as FareResult;
  }, [mode, fromStation, toStation, metroStations]);

  const swapMetroStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50/50 pb-12">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 px-5 pb-32 pt-8 text-white">
        <div className="absolute right-[-20%] top-[-20%] h-80 w-80 rounded-full bg-white/10 blur-3xl opacity-40"></div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
            <Calculator size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">ভাড়া ক্যালকুলেটর</span>
          </div>
          <h2 className="text-4xl font-black leading-[1.1] tracking-tighter">সঠিক ভাড়া <span className="text-emerald-300">জানুন।</span></h2>
          <p className="max-w-[80%] text-sm font-medium leading-relaxed text-emerald-100/70">বাস ও মেট্রোরেলের ভাড়া হিসাব করুন ছাত্র ও এসি সুবিধা সহ।</p>
        </div>
      </div>

      <div className="relative z-20 -mt-10 mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto mb-8 flex max-w-sm rounded-3xl border border-slate-100 bg-white p-1.5 shadow-lg">
          <button onClick={() => setMode('bus')} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${mode === 'bus' ? 'bg-emerald-800 text-white' : 'text-slate-400'}`}>
            <Bus size={16} /> লোকাল বাস
          </button>
          <button onClick={() => setMode('metro')} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${mode === 'metro' ? 'bg-[#8B1A4A] text-white' : 'text-slate-400'}`}>
            <Train size={16} /> মেট্রোরেল
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'bus' ? (
            <motion.div key="bus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
                <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-slate-800"><Route size={16} className="text-emerald-700" /> বাস ভাড়া ক্যালকুলেটর</h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="pl-1 text-[9px] font-black uppercase tracking-widest text-slate-400">দূরত্ব (কিলোমিটার)</label>
                    <div className="relative">
                      <input type="number" min="0" step="0.5" placeholder="উদাহরণ: 5.5" value={busDistance} onChange={(e) => setBusDistance(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400">কিমি</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2"><Info size={14} className="text-slate-400" /><span className="text-[9px] font-bold uppercase text-slate-400">ভাড়া নির্ধারণ</span></div>
                    <div className="space-y-2 text-[10px] text-slate-500">
                      <p>• প্রতি কিলোমিটারে ৳2.45 হিসাবে ভাড়া গণনা</p>
                      <p>• সর্বনিম্ন ভাড়া ৳10</p>
                      <p>• ছাত্র/শিক্ষার্থীদের ৫০% ছাড় (হাফ ভাড়া)</p>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {busResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 text-white shadow-2xl">
                    <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-white/5 blur-3xl opacity-50"></div>
                    <div className="relative">
                      <div className="mb-6 text-center">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/80">সাধারণ ভাড়া</p>
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-7xl font-black tracking-tighter"><span className="mr-1 mt-[-8px] text-3xl opacity-60">৳</span>{busResult.baseFare}</h3>
                          <button onClick={() => copyToClipboard(`বাস ভাড়া: ৳${busResult.baseFare}\nদূরত্ব: ${busResult.distance} কিমি\nছাত্র ভাড়া: ৳${busResult.studentFare}\nএসি ভাড়া: ৳${busResult.acFare}`)} className="rounded-lg bg-white/10 p-2 transition-all hover:bg-white/20">{copied ? <Check size={18} className="text-emerald-300" /> : <Copy size={18} className="text-white/50" />}</button>
                        </div>
                        <p className="mt-2 text-[10px] font-medium text-emerald-200/60">{busResult.distance} কিমি × ৳2.45/কিমি</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><GraduationCap size={14} className="text-emerald-200" /><span className="text-[9px] font-black uppercase text-emerald-200">ছাত্র</span></div><p className="text-2xl font-black">৳{busResult.studentFare}</p><p className="mt-1 text-[8px] text-emerald-200/50">৫০% ছাড়</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><Snowflake size={14} className="text-cyan-200" /><span className="text-[9px] font-black uppercase text-cyan-200">এসি বাস</span></div><p className="text-2xl font-black">৳{busResult.acFare}</p><p className="mt-1 text-[8px] text-cyan-200/50">৩০% বেশি</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><Users size={14} className="text-white" /><span className="text-[9px] font-black uppercase text-white">৪ জন</span></div><p className="text-2xl font-black">৳{busResult.baseFare * 4}</p><p className="mt-1 text-[8px] text-white/50">মোট</p></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="metro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
                <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-slate-800"><Train size={16} className="text-[#8B1A4A]" /> মেট্রোরেল ভাড়া ক্যালকুলেটর</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="pl-1 text-[9px] font-black uppercase tracking-widest text-slate-400">শুরুর স্টেশন</label>
                    <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-bold text-slate-800 outline-none transition-all focus:border-pink-500 focus:bg-white" value={fromStation} onChange={(e) => setFromStation(e.target.value)}><option value="">স্টেশন বেছে নিন</option>{metroStations.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
                  </div>
                  <div className="relative flex h-4 justify-center"><button onClick={swapMetroStations} className="absolute z-10 h-10 w-10 translate-y-[-50%] rounded-full border-2 border-slate-100 bg-white text-pink-700 shadow-md transition-all duration-500 hover:scale-110 hover:bg-slate-50 active:rotate-180"><Route size={18} className="mx-auto" /></button></div>
                  <div className="space-y-2">
                    <label className="pl-1 text-[9px] font-black uppercase tracking-widest text-slate-400">গন্তব্য স্টেশন</label>
                    <select className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 font-bold text-slate-800 outline-none transition-all focus:border-pink-500 focus:bg-white" value={toStation} onChange={(e) => setToStation(e.target.value)}><option value="">স্টেশন বেছে নিন</option>{metroStations.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {metroResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-pink-800 to-[#5D1131] p-8 text-white shadow-2xl">
                    <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-white/5 blur-3xl opacity-50"></div>
                    <div className="relative">
                      <div className="mb-6 text-center">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-pink-200/80">মেট্রোরেল ভাড়া</p>
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-7xl font-black tracking-tighter"><span className="mr-1 mt-[-8px] text-3xl opacity-60">৳</span>{metroResult.baseFare}</h3>
                          <button onClick={() => copyToClipboard(`মেট্রোরেল ভাড়া: ৳${metroResult.baseFare}\nস্টেশন: ${metroResult.stations}টি\nদূরত্ব: ${metroResult.distance?.toFixed(2)} কিমি\nছাত্র ভাড়া: ৳${metroResult.studentFare}`)} className="rounded-lg bg-white/10 p-2 transition-all hover:bg-white/20">{copied ? <Check size={18} className="text-pink-300" /> : <Copy size={18} className="text-white/50" />}</button>
                        </div>
                        <p className="mt-2 text-[10px] font-medium text-pink-200/60">{metroResult.stations} স্টেশন • {metroResult.distance?.toFixed(2)} কিমি</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><GraduationCap size={14} className="text-pink-200" /><span className="text-[9px] font-black uppercase text-pink-200">ছাত্র</span></div><p className="text-2xl font-black">৳{metroResult.studentFare}</p><p className="mt-1 text-[8px] text-pink-200/50">৫০% ছাড়</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><DollarSign size={14} className="text-emerald-200" /><span className="text-[9px] font-black uppercase text-emerald-200">এমআরটি কার্ড</span></div><p className="text-2xl font-black">৳{Math.round(metroResult.baseFare * 0.9)}</p><p className="mt-1 text-[8px] text-emerald-200/50">১০% ছাড়</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm"><div className="mb-2 flex items-center justify-center gap-2"><Users size={14} className="text-white" /><span className="text-[9px] font-black uppercase text-white">৪ জন</span></div><p className="text-2xl font-black">৳{metroResult.baseFare * 4}</p><p className="mt-1 text-[8px] text-white/50">মোট</p></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase text-slate-800"><Info size={14} className="text-slate-400" /> ভাড়ার স্তর</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ range: '০-২ কিমি', fare: 20 },{ range: '২-৫ কিমি', fare: 30 },{ range: '৫-৮ কিমি', fare: 40 },{ range: '৮-১০ কিমি', fare: 50 },{ range: '১০-১২ কিমি', fare: 60 },{ range: '১২-১৫ কিমি', fare: 70 },{ range: '১৫-১৭ কিমি', fare: 80 },{ range: '১৭+ কিমি', fare: 100 }].map((tier, i) => (<div key={i} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[9px] font-black uppercase text-slate-600">{tier.range}</p><p className="text-lg font-black text-slate-800">৳{tier.fare}</p></div>))}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FareCalculatorPage;
