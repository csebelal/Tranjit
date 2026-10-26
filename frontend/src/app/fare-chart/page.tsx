'use client';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Download,
  Expand,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import chartTitles from '@/data/chart-titles.json';

type ChartTitleRecord = {
  id: number;
  src: string;
  title?: string;
  alt?: string;
  fullText?: string;
  success?: boolean;
};

type ChartItem = {
  id: number;
  src: string;
  title: string;
  alt: string;
  fullText: string;
  searchText: string;
};

const repairMojibake = (value: string) => {
  if (!value) {
    return '';
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder('utf-8').decode(bytes);

    return /[\u0980-\u09FF]/.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
};

const normalizeText = (value: string) =>
  repairMojibake(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const charts: ChartItem[] = (chartTitles as ChartTitleRecord[])
  .filter((chart) => chart.success)
  .map((chart) => {
    const title = repairMojibake(chart.title || `ভাড়া চার্ট ${chart.id}`);
    const alt = repairMojibake(chart.alt || `ভাড়া চার্ট ${chart.id}`);
    const fullText = repairMojibake(chart.fullText || '');

    return {
      id: chart.id,
      src: chart.src,
      title,
      alt,
      fullText,
      searchText: normalizeText(
        [title, alt, fullText, chart.src, `chart ${chart.id}`, `ভাড়া চার্ট ${chart.id}`, `${chart.id}`]
          .filter(Boolean)
          .join(' ')
      ),
    };
  });

const FareChartPage = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const filteredCharts = useMemo(
    () =>
      normalizedQuery
        ? charts.filter((chart) => chart.searchText.includes(normalizedQuery))
        : charts,
    [normalizedQuery]
  );

  const selectedChart =
    selectedImage !== null && selectedImage >= 0 && selectedImage < filteredCharts.length
      ? filteredCharts[selectedImage]
      : null;
  const selectedPreviewIndex = selectedImage ?? 0;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && filteredCharts.length > 0) {
      setSelectedImage((selectedImage + 1) % filteredCharts.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && filteredCharts.length > 0) {
      setSelectedImage((selectedImage - 1 + filteredCharts.length) % filteredCharts.length);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#006d36] via-[#009e53] to-[#004d26] px-5 pb-32 pt-8 text-white">
        <div className="absolute right-[-10%] top-[-10%] h-60 w-60 rounded-full bg-white/10 blur-3xl opacity-40" />
        <div className="relative z-10">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/5 bg-white/10 px-3 py-1 backdrop-blur-md">
            <BarChart size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              ভাড়া চার্ট গ্যালারি
            </span>
          </div>
          <h2 className="text-4xl font-black leading-tight tracking-tighter">
            অফিসিয়াল <span className="text-emerald-100">ভাড়া চার্ট</span>
          </h2>
          <p className="mt-2 max-w-[80%] text-sm font-medium leading-relaxed text-emerald-50/80">
            অনুমোদিত সর্বশেষ ভাড়া চার্টগুলো দেখুন এবং রুট, স্টপেজ বা চার্ট নম্বর দিয়ে খুঁজুন।
          </p>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-10 max-w-7xl space-y-6 px-5 lg:px-8">
        <div className="flex max-w-2xl items-start gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Info size={24} />
          </div>
          <div>
            <h4 className="mb-1 text-[15px] font-black leading-none tracking-tight text-slate-800">
              ঢাকা মেট্রোপলিটন ট্রান্সপোর্ট কো-অর্ডিনেশন অথরিটি
            </h4>
            <p className="text-xs font-bold tracking-tight text-slate-500">
              সার্চ শিরোনাম, বিকল্প শিরোনাম, OCR টেক্সট এবং চার্ট নম্বর থেকে ফলাফল খুঁজে আনে।
            </p>
            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
              উদাহরণ: মোহাম্মদপুর, সাভার, বাড্ডা, উত্তরা, মিরপুর-১৪
            </p>
            <p className="mt-2 text-xs font-bold tracking-tight text-slate-600">
              ভাড়া হার রেফারেন্স: প্রতি কিলোমিটারে ২.৪৫ টাকা, সর্বনিম্ন ভাড়া ১০ টাকা
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="রুট, স্টপেজ বা চার্ট নম্বর দিয়ে খুঁজুন..."
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="সার্চ মুছুন"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs font-bold text-slate-500">
              {filteredCharts.length}টি ফলাফল পাওয়া গেছে
            </p>
          )}
        </div>

        {filteredCharts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-black text-slate-800">কোনো মিল পাওয়া যায়নি</h3>
            <p className="text-sm font-medium text-slate-500">অন্য রুট, স্টপেজ বা চার্ট নম্বর দিয়ে চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 xl:grid-cols-3">
            {filteredCharts.map((chart, idx) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: idx * 0.06 } }}
                className="group cursor-pointer overflow-hidden rounded-[36px] border border-slate-100 bg-white p-5 shadow-2xl transition-transform active:scale-[0.98]"
                onClick={() => setSelectedImage(idx)}
              >
                <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100 shadow-inner">
                  <Image
                    src={chart.src}
                    alt={chart.alt}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    priority={idx < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute bottom-5 left-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                      <Expand size={12} className="text-emerald-300" />
                      প্রিভিউ দেখতে চাপুন
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-2">
                  <div className="min-w-0">
                    <h5 className="truncate text-sm font-extrabold tracking-tight text-slate-800 transition-colors group-hover:text-emerald-950">
                      {chart.title}
                    </h5>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                      {chart.alt}
                    </p>
                  </div>
                  <a
                    href={chart.src}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label={`${chart.title} ডাউনলোড করুন`}
                  >
                    <Download size={18} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-2xl"
            onClick={() => setSelectedImage(null)}
          >
            <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-6 md:p-8">
              <div className="pointer-events-auto rounded-full border border-white/10 bg-white/10 px-5 py-2.5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                  {selectedPreviewIndex + 1} / {filteredCharts.length} - {selectedChart.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all hover:scale-110 hover:bg-white/20"
                aria-label="প্রিভিউ বন্ধ করুন"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="relative flex w-full max-w-6xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative max-h-[80vh] min-h-[60vh] w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl"
              >
                <Image
                  src={selectedChart.src}
                  alt={selectedChart.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </motion.div>

              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-xl transition-all hover:scale-110 hover:bg-white/20 md:left-[-60px] md:h-14 md:w-14"
                aria-label="আগের চার্ট"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-xl transition-all hover:scale-110 hover:bg-white/20 md:right-[-60px] md:h-14 md:w-14"
                aria-label="পরের চার্ট"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <a
                href={selectedChart.src}
                download
                className="flex items-center gap-3 rounded-[28px] bg-emerald-700 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-emerald-950/40 transition-all hover:scale-105 hover:bg-emerald-600"
              >
                <Download size={18} />
                চার্ট ডাউনলোড
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FareChartPage;
