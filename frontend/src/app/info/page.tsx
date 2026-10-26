'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Info, Train, Clock, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InfoPage = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (idx: number) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    const faqs = [
        {
            q: 'ভাড়া কীভাবে হিসাব করা হয়?',
            a: 'সরকারি নির্ধারিত হার অনুযায়ী: ২.৪৫ টাকা × কিলোমিটার। সর্বনিম্ন ভাড়া ১০ টাকা।'
        },
        {
            q: 'আমার স্টপ খুঁজে পাচ্ছি না কেন?',
            a: 'স্টপের নাম সঠিক বাংলায় লিখুন এবং dropdown থেকে বেছে নিন। শুধু ৩০০+ প্রধান স্টপ আছে।'
        },
        {
            q: 'সরাসরি বাস নেই — কী করব?',
            a: 'অ্যাপ স্বয়ংক্রিয়ভাবে ১-৩টি বদলের রুট দেখাবে। কোথায় নামতে হবে এবং ভাড়া কত — সব বিস্তারিত দেখা যাবে।'
        },
        {
            q: 'ছাত্র ছাড় কীভাবে কাজ করে?',
            a: 'ছাত্র toggle চালু করলে বাস ভাড়া ৫০% কমে যাবে। মেট্রোরেলে আলাদাভাবে ছাত্র ভাড়া দেখায়।'
        },
        {
            q: 'AC বাসের ভাড়া কত বেশি?',
            a: 'AC toggle চালু করলে সাধারণ ভাড়ার উপর ৩০% বেশি যোগ হয়।'
        },
        {
            q: 'ভাড়া কি সবসময় সঠিক?',
            a: 'হিসাব সরকারি নির্ধারিত হারে সঠিক। তবে কিছু বাস বেশি ভাড়া নিতে পারে।'
        }
    ];

    const tips = [
        { key: 'Enter ↵', desc: 'সার্চ বক্সে Enter চাপলে সরাসরি রুট খোঁজে' },
        { key: '⇄ বাটন', desc: 'শুরু ও গন্তব্য অদলবদল করুন এক ক্লিকে' },
        { key: '✕ বাটন', desc: 'সার্চ ইনপুট দ্রুত মুছতে ডানে ✕ চাপুন' },
        { key: '📋 কপি', desc: 'ভাড়ার ফলাফল clipboard এ কপি করুন শেয়ার করার জন্য' }
    ];

    return (
        <div className="bg-slate-50/50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 px-5 pt-8 pb-24 text-white relative overflow-hidden">
                <div className="absolute right-[-20%] top-[-20%] w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-40"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit mb-4 border border-white/5">
                        <Info size={14} className="text-white" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/90">ব্যবহারকারী গাইড</span>
                    </div>
                    <h2 className="text-4xl font-black leading-tight tracking-tighter">ঢাকা ট্রানজিট <span className="text-emerald-300">গাইড।</span></h2>
                    <p className="text-sm text-emerald-100/70 font-medium leading-relaxed max-w-[80%] mt-2">বাস ও মেট্রোর ভাড়া, সময় ও তথ্য এক জায়গায়</p>
                </div>
            </div>

            <div className="px-5 space-y-6 -mt-10 relative z-20">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
                        <div className="text-2xl font-black text-emerald-700">১০৬+</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">বাস সার্ভিস</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
                        <div className="text-2xl font-black text-emerald-700">৩০০+</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">স্টপ</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
                        <div className="text-2xl font-black text-pink-700">১৬</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">মেট্রো স্টেশন</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100">
                        <div className="text-2xl font-black text-emerald-700">২.৪৫৳</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">প্রতি কিমি</div>
                    </div>
                </div>

                {/* কীভাবে ব্যবহার করবেন */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <HelpCircle size={16} className="text-emerald-700" /> কীভাবে ব্যবহার করবেন
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">১</div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900 mb-1">ফাইলটি ব্রাউজারে খুলুন</h4>
                                <p className="text-xs text-emerald-700">Chrome বা Firefox এ সবচেয়ে ভালো কাজ করে।</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">২</div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900 mb-1">শুরু ও গন্তব্য লিখুন</h4>
                                <p className="text-xs text-emerald-700">স্টপের নাম বাংলায় লিখুন, dropdown থেকে বেছে নিন।</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">৩</div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900 mb-1">রুট ও ভাড়া দেখুন</h4>
                                <p className="text-xs text-emerald-700">Enter চাপলে বা বাটনে ক্লিক করলে ফলাফল দেখাবে।</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* স্ক্রিন গাইড */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6">৫টি স্ক্রিন</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏠</div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Home — ভাড়া ক্যালকুলেটর</h4>
                                <p className="text-xs text-slate-500 mt-1">দুটো স্টপ লিখুন, যাত্রী সংখ্যা ও ছাত্র/AC ফিল্টার সেট করুন।</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚌</div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">বাস সার্ভিস — সব বাসের তালিকা</h4>
                                <p className="text-xs text-slate-500 mt-1">১০৬+ বাসের তালিকা। নাম বা স্টপ লিখে খুঁজুন।</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚇</div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">মেট্রোরেল — MRT Line 6</h4>
                                <p className="text-xs text-slate-500 mt-1">ভাড়া ক্যালকুলেটর ও সব ১৬ স্টেশনের ম্যাপ।</p>
                            </div>
                        </div>
                        <Link href="/fare-chart" className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📊</div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">ভাড়া চার্ট</h4>
                                <p className="text-xs text-slate-500 mt-1">এলাকাওয়ারি ভাড়া চার্টের ছবি গ্যালারি।</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* মেট্রোরেল গাইড */}
                <div className="bg-gradient-to-r from-pink-800 to-[#5D1131] rounded-[32px] p-6 text-white shadow-xl">
                    <h3 className="text-sm font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Train size={16} className="text-pink-300" /> MRT Line 6 গাইড
                    </h3>
                    
                    <p className="text-xs text-pink-200 mb-6">উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত ১৬ স্টেশন, ১৯.৭২ কিমি।</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <div className="text-lg mb-1">💳</div>
                            <h4 className="text-xs font-bold">ভাড়া ক্যালকুলেটর</h4>
                            <p className="text-[10px] text-pink-200 mt-1">ছাত্র ভাড়া ৫০%</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <div className="text-lg mb-1">🗺️</div>
                            <h4 className="text-xs font-bold">Journey Planner</h4>
                            <p className="text-[10px] text-pink-200 mt-1">সম্পূর্ণ যাত্রা পরিকল্পনা</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <div className="text-lg mb-1">📍</div>
                            <h4 className="text-xs font-bold">Station Map</h4>
                            <p className="text-[10px] text-pink-200 mt-1">১৬ স্টেশনের তালিকা</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <div className="text-lg mb-1">📊</div>
                            <h4 className="text-xs font-bold">ভাড়া ম্যাট্রিক্স</h4>
                            <p className="text-[10px] text-pink-200 mt-1">সব ভাড়ার টেবিল</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-pink-300" />
                            <span className="text-xs">সকাল ৭টা – রাত ১০টা</span>
                        </div>
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">হেল্পলাইন: ১৬৪০৬</span>
                    </div>
                </div>

                {/* প্রো টিপস */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6">প্রো টিপস</h3>
                    
                    <div className="space-y-3">
                        {tips.map((tip, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <span className="text-xs font-mono font-bold bg-emerald-800 text-white px-2 py-1 rounded-lg min-w-[80px] text-center">{tip.key}</span>
                                <span className="text-xs text-slate-600">{tip.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <HelpCircle size={16} className="text-slate-500" /> সাধারণ প্রশ্ন (FAQ)
                    </h3>
                    
                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-4 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                                    {openFaq === idx ? <ChevronUp size={18} className="text-emerald-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-4 pb-4">
                                                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ভাড়ার তথ্য */}
                <div className="bg-emerald-50 rounded-[32px] p-6 border-2 border-emerald-100">
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tighter mb-4">সরকারি ভাড়া নীতি</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                            <span className="text-xs text-emerald-800">ভাড়া হার</span>
                            <span className="text-sm font-black text-emerald-900">৳2.45/কিমি</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                            <span className="text-xs text-emerald-800">সর্বনিম্ন ভাড়া</span>
                            <span className="text-sm font-black text-emerald-900">৳10</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                            <span className="text-xs text-emerald-800">ছাত্র ছাড়</span>
                            <span className="text-sm font-black text-emerald-900">৫০%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                            <span className="text-xs text-emerald-800">AC বাস</span>
                            <span className="text-sm font-black text-emerald-900">+৩০%</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-emerald-600 mt-4">তথ্য সূত্র: BRTA প্রজ্ঞাপন নং-৩৫.০০.০০০০.০২০.২৬.০০৫.১৬-৪৪৪ · ৩১ আগস্ট ২০২২</p>
                </div>

                {/* Footer Info */}
                <div className="text-center py-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">তথ্যসূত্র</p>
                    <div className="flex justify-center gap-4 text-xs text-slate-500">
                        <span>BRTA: ১৬৮৮৮</span>
                        <span>মেট্রো: ১৬৪০৬</span>
                    </div>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest py-4">Dhaka Transit Build v2.0.0 — Production Ready</p>
            </div>
        </div>
    );
};

export default InfoPage;