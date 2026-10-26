'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">কিছু একটা সমস্যা হয়েছে।</p>
      <button
        onClick={reset}
        className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
      >
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
