'use client';
import React, { useState, useEffect } from 'react';
import { busService, type Bus } from '@/services/api';
import { Search, Bus as BusIcon, Clock, ChevronRight, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BusListPage = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

    useEffect(() => {
        let mounted = true;
        
        const fetchBuses = async () => {
            setIsLoading(true);
            console.log('Starting fetch...');
            try {
                const data = await busService.getAll();
                console.log('Response received:', data?.length);
                if (mounted) {
                    setBuses(data || []);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                console.error('Fetch error:', message);
                if (mounted) {
                    setBuses([]);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };
        
        fetchBuses();
        
        return () => { mounted = false; };
    }, []);

    const busList = Array.isArray(buses) ? buses : [];
    const filteredBuses = busList.filter(bus => 
        bus.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        bus.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bus.stops || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Header / Search */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-emerald-950 flex items-center gap-2 tracking-tighter uppercase"><BusIcon size={20} className="text-emerald-700" /> সকল বাস সার্ভিস</h2>
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{filteredBuses.length}টি সার্ভিস</span>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="বাসের নাম বা স্টপ খুঁজুন..."
                        className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:font-medium shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <BusIcon className="animate-bounce text-emerald-700 mb-4" size={40} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">লোড হচ্ছে...</p>
                    </div>
                ) : filteredBuses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredBuses.map((bus, idx) => (
                            <motion.div 
                                key={bus._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1, transition: { delay: idx * 0.02 } }}
                                className="group relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:border-emerald-200 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
                                onClick={() => setSelectedBus(bus)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-bold shadow-inner transition-transform group-hover:scale-110 ${bus.ac ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {bus.ac ? '❄️' : '🚌'}
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[16px] font-black text-slate-800 truncate group-hover:text-emerald-950 transition-colors uppercase tracking-tight">{bus.name}</h4>
                                        {bus.ac && <span className="bg-emerald-600 text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm">AC</span>}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-tighter">{bus.nameEn} • {bus.type}</p>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tight">{bus.stops.length} স্টপ</span>
                                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg uppercase tracking-tight">{bus.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center opacity-50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
                            <Filter size={32} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">কোনো বাস পাওয়া যায়নি</p>
                    </div>
                )}
            </div>

            {/* Bus Detail Modal */}
            <AnimatePresence>
                {selectedBus && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-950/40 backdrop-blur-sm p-4"
                        onClick={() => setSelectedBus(null)}
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-lg bg-white rounded-t-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-14 w-14 items-center justify-center flex rounded-2xl text-2xl shadow-lg shadow-emerald-100 ${selectedBus.ac ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{selectedBus.ac ? '❄️' : '🚌'}</div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tighter">{selectedBus.name}</h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedBus.nameEn}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1 overflow-x-hidden">
                                        <span className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 px-3 py-1 rounded-full border border-slate-100 items-center flex gap-1"><Clock size={11} /> {selectedBus.time}</span>
                                        <span className="bg-emerald-50 text-[10px] font-black uppercase text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 items-center flex gap-1"><Filter size={11} /> {selectedBus.type}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedBus(null)}
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">যাত্রাপথের স্টপসমূহ ({selectedBus.stops.length})</h4>
                                    <div className="grid grid-cols-1 gap-1.5 relative pl-4">
                                        <div className="absolute left-[7px] top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-600 via-emerald-100 to-emerald-900 opacity-20 rounded-full"></div>
                                        {selectedBus.stops.map((stop, i) => (
                                            <div key={i} className="flex items-center gap-4 py-2 group">
                                                <div className={`relative z-10 h-3 w-3 rounded-full flex-shrink-0 ring-4 ring-white ${i === 0 ? 'bg-emerald-600' : i === selectedBus.stops.length - 1 ? 'bg-orange-600' : 'bg-slate-200'}`}></div>
                                                <p className={`text-xs font-bold transition-colors ${i === 0 || i === selectedBus.stops.length - 1 ? 'text-slate-900 text-sm' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                                    {stop} {i === 0 ? '🟢' : i === selectedBus.stops.length - 1 ? '🔴' : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-emerald-950 text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute right-[-10%] top-[-10%] h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                                    <h5 className="relative z-10 text-[10px] font-black uppercase tracking-widest text-emerald-200/80 mb-3">স্মার্ট ট্রাভেলার টিপস</h5>
                                    <p className="relative z-10 text-xs font-medium leading-relaxed text-emerald-100/90 italic">{`"${selectedBus.name}"`} বাসটি বেশ কয়েকটি মূল স্টপ যেমন {selectedBus.stops[1]}, {selectedBus.stops[Math.floor(selectedBus.stops.length/2)]} হয়ে চলাচল করে। সঠিক স্টপে থামার জন্য কন্ডাক্টরের সহায়তা নিন।</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusListPage;
