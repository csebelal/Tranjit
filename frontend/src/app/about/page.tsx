'use client';
import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen pb-12">
      {/* Header / Hero */}
      <div className="bg-gradient-to-br from-[#00503a] to-[#003d2e] px-5 pt-8 pb-24 text-white relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] w-60 h-60 bg-white/10 rounded-full blur-3xl opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit mb-4 border border-white/5">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/90">ঢাকা ট্রানজিট অ্যাপ</span>
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight mb-3">ঢাকার লোকাল বাস রুট এখন <span className="text-emerald-300">আপনার হাতের মুঠোয়</span></h2>
          <p className="text-sm text-emerald-100/80 font-medium leading-relaxed">সঠিক বাস, সঠিক রুট, সঠিক সময়ে — নতুন ও অভিজ্ঞ যাত্রী সবার জন্য।</p>
        </div>
      </div>

      <div className="px-5 space-y-6 -mt-10 relative z-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-slate-100">
            <div className="text-2xl font-black text-emerald-900">১০০+</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">বাস সার্ভিস</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-slate-100">
            <div className="text-2xl font-black text-emerald-900">৩০০+</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">বাস স্টপ</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg border border-slate-100">
            <div className="text-2xl font-black text-pink-900">১৬টি</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">মেট্রো স্টেশন</div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">অ্যাপে যা পাবেন</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">🚌</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">সম্পূর্ণ বাস তালিকা ও রুট</h4>
                <p className="text-xs text-slate-500 leading-relaxed">ঢাকার ১০০+ লোকাল বাস সার্ভিসের সম্পূর্ণ স্টপ-বাই-স্টপ রুট। প্রতিটি বাসের ধরন (সিটিং/সেমি-সিটিং/এসি) ও সময়সূচি সহ।</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-xl flex-shrink-0">💰</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">তাৎক্ষণিক ভাড়া হিসাব</h4>
                <p className="text-xs text-slate-500 leading-relaxed">যেকোনো দুটি স্টপ বেছে নিন — সরকারি হারে (২.৪৫ টাকা/কিমি) ভাড়া সঙ্গে সঙ্গে দেখাবে। ছাত্র ছাড় ও এসি ভাড়াও হিসাব করা যাবে।</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">🚇</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">মেট্রো + বাস যাত্রা পরিকল্পনা</h4>
                <p className="text-xs text-slate-500 leading-relaxed">শুরু ও গন্তব্য স্টপ দিলে স্বয়ংক্রিয়ভাবে বাস → মেট্রো → বাস সম্পূর্ণ রুট ও মোট ভাড়া দেখাবে।</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">🔍</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">স্মার্ট সার্চ</h4>
                <p className="text-xs text-slate-500 leading-relaxed">বাসের নাম, স্টপ বা এলাকা লিখলেই ফিল্টার হয়ে যাবে। কোন স্টপ থেকে কোন বাস চলে তা এক ক্লিকে জানুন।</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">📊</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">সরকারি ভাড়া চার্ট</h4>
                <p className="text-xs text-slate-500 leading-relaxed">BRTA অনুমোদিত সর্বশেষ ভাড়া তালিকা। প্রজ্ঞাপন নং-৩৫.০০.০০০০.০২০.২৬.০০৫.১৬-৪৪৪ (৩১ আগস্ট ২০২২) অনুযায়ী।</p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Benefits */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">কারা উপকৃত হবেন</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="text-2xl mb-2">🧑‍🎓</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">ছাত্রছাত্রী</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">ছাড়সহ সঠিক বাস ও সময় জেনে নিন দ্রুত।</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="text-2xl mb-2">💼</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">অফিসগামী</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">নিত্যদিনের রুট ও বাস সহজে খুঁজুন।</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="text-2xl mb-2">🗺️</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">নতুন আগন্তুক</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">ঢাকার বাইরে থেকে আসা যাত্রীদের জন্য পথ চেনার সহজ গাইড।</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="text-2xl mb-2">👨‍👩‍👧</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">পরিবার</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">কয়জনের ভাড়া কত, এসি না নন-এসি — সব হিসাব এক জায়গায়।</p>
            </div>
          </div>
        </div>

        {/* মেট্রোরেল (MRT Line 6) */}
        <div className="rounded-[32px] bg-gradient-to-br from-[#8B1A4A] to-[#5D1131] p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">🚇</div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter">মেট্রোরেল (MRT Line 6)</h4>
                    <p className="text-[10px] font-bold text-pink-200 mt-0.5">ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-bold text-pink-200 uppercase">দূরত্ব</p>
                    <h5 className="text-xl font-black mt-1">১৯.৭২ কিমি</h5>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-bold text-pink-200 uppercase">স্টেশন</p>
                    <h5 className="text-xl font-black mt-1">১৬ টি</h5>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-bold text-pink-200 uppercase">সর্বনিম্ন ভাড়া</p>
                    <h5 className="text-xl font-black mt-1">৳ ২০</h5>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-bold text-pink-200 uppercase">সর্বোচ্চ ভাড়া</p>
                    <h5 className="text-xl font-black mt-1">৳ ১০০</h5>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-4">
                <p className="text-[10px] font-bold text-pink-200 uppercase mb-2">অপারেশন সময়</p>
                <p className="text-sm font-bold">সকাল ৭টা – রাত ১০টা</p>
            </div>

            <div className="flex gap-3 text-[9px]">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg">ছাত্র ছাড় ৫০%</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg">MRT কার্ড ১০% ছাড়</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg">হেল্পলাইন ১৬৪০৬</span>
            </div>
        </div>

        {/* যোগাযোগ */}
        <div className="rounded-3xl bg-white p-7 shadow-lg border border-slate-100 space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">📞 যোগাযোগ</h4>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[9px] font-black uppercase text-emerald-900/60 mb-2">BRTA হেল্পলাইন</p>
                    <h5 className="text-xl font-black text-emerald-950">১৬৮৮৮</h5>
                </div>
                <div className="p-5 rounded-2xl bg-pink-50 border border-pink-100">
                    <p className="text-[9px] font-black uppercase text-pink-900/60 mb-2">মেট্রোরেল হেল্পলাইন</p>
                    <h5 className="text-xl font-black text-pink-950">১৬৪০৬</h5>
                </div>
            </div>
        </div>

        {/* শীঘ্রই আসছে */}
        <div className="rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-40"></div>
            <div className="relative z-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 mb-6 flex items-center gap-2">🚀 শীঘ্রই আসছে</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-sm font-bold text-slate-100">আন্তঃজেলা বাস সার্ভিস</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-orange-400">Upcoming</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-sm font-bold text-slate-100">MRT Line 1 (Airport Line)</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-orange-400">Upcoming</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-100">লাইভ বাস ট্র্যাকিং</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-indigo-400">In Design</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Notice */}
        <div className="bg-emerald-50 rounded-2xl p-4 border-l-4 border-emerald-800">
          <p className="text-xs text-emerald-900 leading-relaxed">
            সকল ভাড়া বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (BRTA) অনুমোদিত। ছাত্রছাত্রীরা বৈধ পরিচয়পত্র দেখিয়ে ৫০% ছাড়ে ভ্রমণ করতে পারবেন। অভিযোগের জন্য: BRTA হেল্পলাইন ১৬৮৮৮
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full bg-emerald-800 text-white text-center py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-emerald-900 transition-colors"
          >
            এখনই শুরু করুন
          </Link>
          <Link 
            href="/info" 
            className="block w-full bg-slate-100 text-slate-600 text-center py-3 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            আরও তথ্য দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;