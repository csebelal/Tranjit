'use client';

import React, { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const JourneyTracker = dynamic(() => import('./JourneyTracker'), { ssr: false });
import {
  AlertTriangle,
  ArrowRight,
  Bus as BusIcon,
  Check,
  Copy,
  Map as MapIcon,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Snowflake,
  GraduationCap,
  X,
} from 'lucide-react';
import { useTransitStore } from '@/store/useTransitStore';
import { busService, type Bus, type MultimodalResponse, type RouteResponse } from '@/services/api';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
};

const StopInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { bn: string }[];
  placeholder: string;
  icon: React.ReactNode;
  onEnter?: () => void;
}> = ({ label, value, onChange, options, placeholder, icon, onEnter }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="relative flex-1">
        <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-emerald-800">{label}</label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-10 text-base font-bold text-slate-800 outline-none transition-all focus:border-emerald-500"
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.bn} value={opt.bn}>
                {opt.bn}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
          <Navigation className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-emerald-800">{label}</label>
      <div className="relative">
        <input
          list="stops-list"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          placeholder={placeholder}
          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pl-12 pr-10 text-sm font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export interface RouteFinderRef {
  setRoute: (from: string, to: string) => void;
}

interface RouteFinderProps {
  onSearch?: (from: string, to: string) => void;
}

const RouteFinder = forwardRef<RouteFinderRef, RouteFinderProps>(({ onSearch }, ref) => {
  const { stopsWithAliases, fetchStopsWithAliases } = useTransitStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [isStudent, setIsStudent] = useState(false);
  const [isAC, setIsAC] = useState(false);
  const [routeResults, setRouteResults] = useState<RouteResponse | null>(null);
  const [multimodalResult, setMultimodalResult] = useState<MultimodalResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'bus' | 'multimodal'>('bus');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  useImperativeHandle(ref, () => ({
    setRoute: (nextFrom, nextTo) => {
      setFrom(nextFrom);
      setTo(nextTo);
      void performSearch(nextFrom, nextTo);
    },
  }));

  useEffect(() => {
    void fetchStopsWithAliases();
  }, [fetchStopsWithAliases]);

  const calcBusFare = (baseFare: number) => {
    let fare = Number(baseFare) || 0;
    if (isStudent) {
      fare = Math.max(10, Math.round(fare * 0.5));
    }
    if (isAC) {
      fare = Math.round(fare * 1.3);
    }
    return fare;
  };

  const multimodalAdjustedFare = multimodalResult
    ? (calcBusFare(multimodalResult.bus1Fare || 0) + multimodalResult.metroFare + calcBusFare(multimodalResult.bus2Fare || 0)) * passengerCount
    : 0;

  const multimodalPatternLabel = multimodalResult
    ? `${multimodalResult.bus1Options?.length ? 'বাস' : 'হাঁটা/রিকশা'} + মেট্রো + ${multimodalResult.bus2Options?.length ? 'বাস' : 'হাঁটা/রিকশা'}`
    : '';
  const performSearch = async (nextFrom: string, nextTo: string) => {
    if (!nextFrom || !nextTo) {
      setError('শুরুর স্থান এবং গন্তব্য নির্বাচন করুন');
      return;
    }

    // Build list of valid stops (both Bengali and English from the list)
    const validStops = new Set<string>();
    const stopAliasMap = new Map<string, string>(); // English/Bengali -> Bengali
    stopsWithAliases.forEach((stop) => {
      validStops.add(stop.bn);
      stopAliasMap.set(stop.bn.toLowerCase(), stop.bn);
      if (stop.en) {
        validStops.add(stop.en);
        stopAliasMap.set(stop.en.toLowerCase(), stop.bn);
      }
      if (stop.aliases) {
        stop.aliases.forEach((a: string) => {
          validStops.add(a);
          stopAliasMap.set(a.toLowerCase(), stop.bn);
        });
      }
    });

    // Check if input is valid (either in list or matches an alias)
    const fromBn = stopAliasMap.get(nextFrom.toLowerCase()) || nextFrom;
    const toBn = stopAliasMap.get(nextTo.toLowerCase()) || nextTo;

    // Allow if it's a known stop or if it matches partial text in any stop
    const isValidFrom = validStops.has(nextFrom) || stopsWithAliases.some(s => 
      s.bn.toLowerCase().includes(nextFrom.toLowerCase()) ||
      (s.en && s.en.toLowerCase().includes(nextFrom.toLowerCase()))
    );
    const isValidTo = validStops.has(nextTo) || stopsWithAliases.some(s => 
      s.bn.toLowerCase().includes(nextTo.toLowerCase()) ||
      (s.en && s.en.toLowerCase().includes(nextTo.toLowerCase()))
    );

    if (!isValidFrom || !isValidTo) {
      setError('অনুগ্রহ করে তালিকা থেকে একটি স্টপ নির্বাচন করুন');
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      const [busRes, multimodalRes] = await Promise.all([
        busService.search(fromBn, toBn),
        busService.getMultimodal(fromBn, toBn),
      ]);

      setRouteResults(busRes);
      setMultimodalResult(multimodalRes);

      // Update display to show Bengali names if input was English
      setFrom(fromBn);
      setTo(toBn);

      if (multimodalRes.found && (!busRes.direct || busRes.direct.length === 0)) {
        // Only switch to multimodal if no bus options - otherwise keep bus as default
      }

      setActiveTab('bus');

      onSearch?.(nextFrom, nextTo);
    } catch (searchError) {
      console.error('Search failed:', searchError);
      setError('রুট খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    void performSearch(from, to);
  };

  const swapStops = () => {
    setFrom(to);
    setTo(from);
  };

  const getPathStops = (bus: Bus) => {
    if (!bus?.stops?.length) {
      return [];
    }

    const fromIndex = bus.stops.indexOf(from);
    const toIndex = bus.stops.indexOf(to);
    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    const routePath = bus.stops.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1);
    return fromIndex <= toIndex ? routePath : [...routePath].reverse();
  };

  const copyResult = async () => {
    const lines: string[] = [];

    if (activeTab === 'bus' && routeResults?.direct?.[0]) {
      const direct = routeResults.direct[0];
      lines.push(`রুট: ${from} → ${to}`);
      lines.push(`বাস: ${direct.name}`);
      lines.push(`ভাড়া: ৳${calcBusFare(direct.fare || 0) * passengerCount}`);
      lines.push(`দূরত্ব: ${direct.dist?.toFixed(1) || '0'} কিমি`);
    }

    if (activeTab === 'multimodal' && multimodalResult?.found) {
      lines.push(`পথ: ${multimodalPatternLabel}`);
      lines.push(`রুট: ${multimodalResult.from} → ${multimodalResult.to}`);
      lines.push(`মোট ভাড়া: ৳${multimodalAdjustedFare}`);
      lines.push(`সময় লাগবে: ~${multimodalResult.totalTime} মিনিট`);
    }

    if (lines.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const primaryBus = routeResults?.direct?.[0];
  const routePath = primaryBus ? getPathStops(primaryBus) : [];

  return (
    <div className="space-y-6 md:space-y-8">
      {showTracker && from && to && (
        <JourneyTracker from={from} to={to} routeStops={routePath} onClose={() => setShowTracker(false)} />
      )}
      <div className="relative overflow-hidden rounded-[32px] bg-white p-4 shadow-[0_20px_50px_rgba(0,80,58,0.15)] ring-1 ring-slate-100 md:-mt-20 md:p-6">
        <div className="space-y-4 md:space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <StopInput
              label="১. কোথা থেকে"
              value={from}
              onChange={setFrom}
              options={stopsWithAliases}
              placeholder="উদাহরণ: উত্তরা হাউস বিল্ডিং"
              icon={<MapPin className="text-emerald-600" size={18} />}
              onEnter={handleSearch}
            />

            <div className="flex items-center justify-center pb-1 md:items-end">
              <button
                type="button"
                onClick={swapStops}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-emerald-700 shadow-md transition-all duration-500 hover:shadow-xl active:rotate-180 md:h-12 md:w-12"
              >
                <RefreshCw size={16} strokeWidth={2.5} />
              </button>
            </div>

            <StopInput
              label="২. কোথায় যাবেন"
              value={to}
              onChange={setTo}
              options={stopsWithAliases}
              placeholder="উদাহরণ: মতিঝিল"
              icon={<Navigation className="text-emerald-600" size={18} />}
              onEnter={handleSearch}
            />
          </div>

          <datalist id="stops-list">
            {stopsWithAliases.map((stop) => (
              <option key={stop.bn} value={stop.bn} />
            ))}
          </datalist>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="flex flex-col justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-2 text-center shadow-sm md:p-3">
              <div className="mb-1 text-[9px] font-black uppercase text-emerald-600 md:text-[10px]">যাত্রী</div>
              <div className="flex items-center justify-between px-1 md:px-2">
                <button type="button" onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))} className="rounded-lg px-2 py-0.5 text-base font-black text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-800 md:text-lg">-</button>
                <span className="text-base font-black text-emerald-900 md:text-lg">{passengerCount}</span>
                <button type="button" onClick={() => setPassengerCount(Math.min(10, passengerCount + 1))} className="rounded-lg px-2 py-0.5 text-base font-black text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-800 md:text-lg">+</button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStudent((prev) => !prev)}
              className={`rounded-2xl border-2 p-2 transition-all ${isStudent ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'}`}
            >
              <div className="flex flex-col items-center gap-1 font-bold">
                <GraduationCap size={16} />
                <span className="text-[8px] font-black uppercase tracking-tight md:text-[10px]">স্টুডেন্ট</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsAC((prev) => !prev)}
              className={`rounded-2xl border-2 p-2 transition-all ${isAC ? 'border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50'}`}
            >
              <div className="flex flex-col items-center gap-1 font-bold">
                <Snowflake size={16} />
                <span className="text-[8px] font-black uppercase tracking-tight md:text-[10px]">এসি বাস</span>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!from || !to || isSearching}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-900 py-4 text-base font-black text-white shadow-xl transition-all hover:bg-black disabled:opacity-50 md:py-5 md:text-lg"
          >
            {isSearching ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
            রুট ও ভাড়া দেখুন
          </button>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-center">
              <p className="flex items-center justify-center gap-2 text-sm font-bold text-red-600">
                <AlertTriangle size={16} /> {error}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(routeResults || multimodalResult?.found) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="mx-auto flex max-w-sm rounded-3xl border border-slate-100 bg-white p-1.5 shadow-lg">
              <button type="button" onClick={() => setActiveTab('bus')} className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${activeTab === 'bus' ? 'bg-emerald-800 text-white' : 'text-slate-400'}`}>
                লোকাল বাস
              </button>
              <button type="button" onClick={() => setActiveTab('multimodal')} disabled={!multimodalResult?.found} className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${activeTab === 'multimodal' ? 'bg-[#8B1A4A] text-white' : 'text-slate-400'}`}>
                মেট্রো + বাস
              </button>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={copyResult} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm hover:border-slate-300">
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                কপি করুন
              </button>
            </div>

            {activeTab === 'bus' ? (
              <div className="space-y-6 pb-20">
                {primaryBus ? (
                  <>
                    <div className="overflow-hidden rounded-[32px] border-4 border-white bg-[#00503a] text-white shadow-2xl">
                      <div className="space-y-4 p-8 text-center">
                        <span className="text-6xl font-black tracking-tighter md:text-7xl">৳ {calcBusFare(primaryBus.fare || 0) * passengerCount}</span>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{from} → {to} • {passengerCount} জন</p>
                      </div>
                      <div className="grid grid-cols-3 bg-[#0d644d] px-6 py-5">
                        <div className="border-r border-white/10 text-center">
                          <div className="text-base font-black tracking-tight">~{primaryBus.dist?.toFixed(1) || '0'} কিমি</div>
                          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50">দূরত্ব</div>
                        </div>
                        <div className="border-r border-white/10 text-center">
                          <div className="text-base font-black tracking-tight">৳ {calcBusFare(primaryBus.fare || 0)}</div>
                          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50">প্রতি জন</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-black tracking-tight">{routeResults?.direct?.length || 0}টি</div>
                          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50">বাস</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                      <div className="mb-2 flex items-center gap-3">
                        <MapIcon size={20} className="text-emerald-700" />
                        <h4 className="text-sm font-black text-slate-900">যাত্রাপথ</h4>
                      </div>
                      <p className="mb-6 text-[11px] font-bold text-slate-400">{primaryBus.name} রুট • {Math.max(routePath.length - 1, 0)}টি স্টপ দূরে</p>
                      <div className="rounded-[28px] bg-slate-50 px-4 py-5">
                        <div className="relative pl-8">
                          <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-emerald-700/20"></div>
                          <div className="space-y-5">
                            {routePath.map((stop, index) => {
                              const isFrom = stop === from;
                              const isTo = stop === to;
                              return (
                                <div key={`${stop}-${index}`} className="relative flex items-center gap-3">
                                  <div className={`relative z-10 h-4 w-4 rounded-full border-2 ${isFrom ? 'border-emerald-700 bg-emerald-700' : isTo ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'}`}></div>
                                  <span className={`text-sm ${isFrom || isTo ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{stop}</span>
                                  {isFrom && <div className="h-3 w-3 rounded-full bg-lime-500 ring-2 ring-lime-100"></div>}
                                  {isTo && <div className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-100"></div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="mt-6 text-center text-[11px] font-bold text-slate-400">মোট {Math.max(routePath.length - 1, 0)} স্টপের মধ্যে যেতে হবে</p>
                      </div>
                      <button
                        onClick={() => setShowTracker(true)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white transition-all hover:bg-emerald-800 active:scale-95"
                      >
                        <span>📍</span>
                        <span>লাইভ ট্র্যাক করুন</span>
                      </button>
                    </div>

                    {routeResults?.direct && routeResults.direct.length > 0 && (
                      <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-2 flex items-center gap-3">
                          <BusIcon size={20} className="text-emerald-700" />
                          <h4 className="text-sm font-black text-slate-900">এই পথে চলাচলকারী বাস</h4>
                        </div>
                        <p className="mb-5 text-[11px] font-bold text-slate-400">{from} থেকে {to} — {routeResults.direct.length}টি বাস পাওয়া গেছে</p>
                        <div className="space-y-4">
                          {routeResults.direct.map((bus) => {
                            const fromIdx = bus.stops?.indexOf(from) ?? -1;
                            const toIdx = bus.stops?.indexOf(to) ?? -1;
                            const isForward = fromIdx < toIdx;
                            return (
                            <div key={bus._id} className="rounded-[24px] bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">🚌</div>
                                  <div>
                                    <p className="text-lg font-black leading-none text-slate-900">{bus.name}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-400">{bus.nameEn} • {bus.type}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-black text-slate-600">{bus.ac ? 'AC' : 'Non-AC'}</span>
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                    <span>{isForward ? '↑' : '↓'}</span>
                                    <span>{bus.routeStart} → {bus.routeEnd}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[11px] font-bold">
                                <span className="text-slate-500">রুট:</span>
                                <span className="text-slate-700">{bus.routeStart}</span>
                                <ArrowRight size={12} className="text-slate-300" />
                                <span className="text-slate-700">{bus.routeEnd}</span>
                              </div>
                              <div className="mt-3 flex items-center gap-2 text-[12px] font-bold text-slate-500">
                                <span className="h-3 w-3 rounded-full border border-slate-400 bg-white"></span>
                                <span>{from}</span>
                                <ArrowRight size={12} className="text-slate-300" />
                                <span className="h-3 w-3 rounded-full bg-lime-500"></span>
                                <span className="text-slate-700">{to}</span>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (routeResults?.transfers?.length ?? 0) === 0 ? (
                  <div className="rounded-[40px] border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                    <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">সরাসরি বাস রুট পাওয়া যায়নি</p>
                    <p className="text-[10px] font-medium text-slate-300">মেট্রো + বাস tab-এ যাত্রা পরিকল্পনা দেখে নিন</p>
              </div>
                ) : null}

                {/* Transfer routes - only show if no direct buses */}
            {!primaryBus && (routeResults?.transfers?.length ?? 0) > 0 && (
                  <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
                    <h4 className="mb-4 text-sm font-black text-slate-900">বিকল্গ ট্রান্সফার রুট</h4>
                    <div className="space-y-4">
                      {routeResults?.transfers?.slice(0, 3).map((transfer, index) => (
                        <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-black text-slate-800">দুই ধাপের বাস রুট</span>
                            <span className="text-sm font-black text-emerald-700">৳ {transfer.totalFare * passengerCount} ({passengerCount} জন)</span>
                          </div>
                          <div className="space-y-3">
                            {transfer.legs.map((leg, legIndex) => (
                              <div key={`${leg.bus}-${legIndex}`} className="rounded-lg bg-white p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <BusIcon size={14} className="text-emerald-600" />
                                    <span className="font-bold text-slate-800">{leg.bus}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{leg.from}</span>
                                    <ArrowRight size={10} />
                                    <span className="font-medium text-slate-700">{leg.to}</span>
                                  </div>
                                  <span className="text-xs font-bold text-amber-600">৳ {calcBusFare(leg.fare) * passengerCount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                            <span className="text-xs font-bold text-slate-600">মোট (প্রতি জন)</span>
                            <span className="text-sm font-black text-emerald-700">৳ {transfer.totalFare}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : multimodalResult ? (
              multimodalResult.found ? (
                <div className="space-y-4 pb-20">
                  <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 p-6 text-white shadow-2xl">
                    <div className="absolute right-[-10%] top-[-10%] h-60 w-60 rounded-full bg-pink-500/20 blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-5%] h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 text-white shadow-lg">🚇</div>
                        <div>
                          <h3 className="text-lg font-black tracking-tight">কোন পথে গেলে সুবিধা হবে দেখুন</h3>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300">{multimodalPatternLabel}</p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter">৳{multimodalAdjustedFare}</span>
                        <span className="text-xs font-bold text-white/60">({passengerCount} জন)</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                        {multimodalResult.from} → {multimodalResult.to} · ~{multimodalResult.totalTime} মিনিট
                      </p>
                    </div>
                  </div>

                  {(!multimodalResult.bus1Options || multimodalResult.bus1Options.length === 0) ? (
                    <div className="rounded-[24px] border-2 border-emerald-100 bg-white p-5 shadow-lg opacity-70">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-white">১</span>
                        <h4 className="text-sm font-black uppercase text-slate-500">বাসে মেট্রো স্টেশনে যান</h4>
                      </div>
                      <div className="py-4 text-center">
                        <p className="text-xs font-bold text-slate-400">হেঁটে বা রিকশায় মেট্রো স্টেশনে যান</p>
                        <p className="mt-1 text-[9px] text-slate-300">~{Math.round(multimodalResult.fromMetro?.station ? 10 : 5)} মিনিট</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border-2 border-emerald-100 bg-white p-5 shadow-lg">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">১</span>
                        <h4 className="text-sm font-black uppercase text-emerald-800">বাসে মেট্রো স্টেশনে যান</h4>
                      </div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">🚌</div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800">{multimodalResult.bus1Options[0].name}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            {multimodalResult.from} → {multimodalResult.bus1Options[0].alightAt} · ৳{multimodalResult.bus1Options[0].fare}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-700">৳{calcBusFare(multimodalResult.bus1Options[0].fare)}</p>
                          <p className="text-[9px] font-bold text-slate-400">প্রতি জন</p>
                        </div>
                      </div>

                      {multimodalResult.bus1Options.length > 1 && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="mb-2 text-[9px] font-bold uppercase text-slate-400">আরও {multimodalResult.bus1Options.length - 1}টি অপশন:</p>
                          <div className="space-y-2">
                            {multimodalResult.bus1Options.slice(1).map((bus, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-[10px]">
                                <span className="font-bold text-slate-600">{bus.name}</span>
                                <span className="font-black text-emerald-600">৳{calcBusFare(bus.fare)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-[24px] border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50 p-5 shadow-lg">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-xs font-black text-white">২</span>
                      <h4 className="text-sm font-black uppercase text-pink-800">মেট্রো যাত্রা</h4>
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-xl">🚇</div>
                      <div className="flex-1">
                        <p className="font-black text-slate-800">
                          {multimodalResult.boardStation?.station} → {multimodalResult.exitStation?.station}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          {(multimodalResult.exitStation?.idx || 0) - (multimodalResult.boardStation?.idx || 0)} স্টেশন · {multimodalResult.metroDist.toFixed(1)} কিমি · ~{multimodalResult.metroTime} মিনিট
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-pink-700">৳{multimodalResult.metroFare}</p>
                        <p className="text-[9px] font-bold text-slate-400">মেট্রো</p>
                      </div>
                    </div>

                    {multimodalResult.midStations && multimodalResult.midStations.length > 0 && (
                      <div className="mt-3 border-t border-pink-100 pt-3">
                        <p className="mb-2 text-[9px] font-bold uppercase text-pink-600">মাঝের স্টপ:</p>
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="font-black text-pink-700">{multimodalResult.boardStation?.station}</span>
                          {multimodalResult.midStations.map((st, i) => (
                            <React.Fragment key={i}>
                              <span className="text-pink-300">→</span>
                              <span className="font-medium text-slate-600">{st.name}</span>
                            </React.Fragment>
                          ))}
                          <span className="text-pink-300">→</span>
                          <span className="font-black text-pink-700">{multimodalResult.exitStation?.station}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(!multimodalResult.bus2Options || multimodalResult.bus2Options.length === 0) ? (
                    <div className="rounded-[24px] border-2 border-emerald-100 bg-white p-5 shadow-lg opacity-70">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-white">৩</span>
                        <h4 className="text-sm font-black uppercase text-slate-500">গন্তব্যে পৌঁছান</h4>
                      </div>
                      <div className="py-4 text-center">
                        <p className="text-xs font-bold text-slate-400">হেঁটে বা রিকশায় গন্তব্যে যান</p>
                        <p className="mt-1 text-[9px] text-slate-300">~5 মিনিট</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border-2 border-emerald-100 bg-white p-5 shadow-lg">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">৩</span>
                        <h4 className="text-sm font-black uppercase text-emerald-800">গন্তব্যে পৌঁছান</h4>
                      </div>

                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">🚌</div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800">{multimodalResult.bus2Options[0].name}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            {multimodalResult.bus2Options[0].boardAt} → {multimodalResult.to} · ৳{multimodalResult.bus2Options[0].fare}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-700">৳{calcBusFare(multimodalResult.bus2Options[0].fare)}</p>
                          <p className="text-[9px] font-bold text-slate-400">প্রতি জন</p>
                        </div>
                      </div>

                      {multimodalResult.bus2Options.length > 1 && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="mb-2 text-[9px] font-bold uppercase text-slate-400">আরও {multimodalResult.bus2Options.length - 1}টি অপশন:</p>
                          <div className="space-y-2">
                            {multimodalResult.bus2Options.slice(1).map((bus, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-[10px]">
                                <span className="font-bold text-slate-600">{bus.name}</span>
                                <span className="font-black text-emerald-600">৳{calcBusFare(bus.fare)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-3 text-[10px] font-black uppercase text-slate-400">মোট খরচ</p>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">বাস (শুরু থেকে মেট্রো)</span>
                      <span className="font-black text-emerald-700">৳{calcBusFare(multimodalResult.bus1Fare) * passengerCount}</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">মেট্রোরেল</span>
                      <span className="font-black text-pink-700">৳{multimodalResult.metroFare * passengerCount}</span>
                    </div>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-slate-600">বাস (মেট্রো থেকে গন্তব্য)</span>
                      <span className="font-black text-emerald-700">৳{calcBusFare(multimodalResult.bus2Fare) * passengerCount}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm font-black text-slate-800">মোট ({passengerCount} জন)</span>
                      <span className="text-xl font-black text-emerald-800">৳{multimodalAdjustedFare}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[40px] border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">মেট্রো + বাস যাত্রা পাওয়া যায়নি</p>
                  <p className="text-[10px] font-medium text-slate-300">{multimodalResult.message || 'এই পথে যাত্রা পরিকল্পনা পাওয়া যায়নি'}</p>
                </div>
              )
            ) : null}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

RouteFinder.displayName = 'RouteFinder';

export default RouteFinder;












