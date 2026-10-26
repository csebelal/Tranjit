'use client';
import React, { useState, useEffect } from 'react';
import { fareService, type Fare } from '@/services/api';
import { Search } from 'lucide-react';

const FareSearchTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [fares, setFares] = useState<Fare[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFares = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fareService.search(searchTerm);
                setFares(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError('তথ্য লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(loadFares, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="ভাড়া খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white rounded-2xl border-2 border-slate-100 py-3.5 pl-12 pr-4 text-sm font-bold"
                />
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 mt-2">লোড হচ্ছে...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl text-center">
                    {error}
                </div>
            )}

            {!loading && !error && fares.length === 0 && searchTerm && (
                <div className="text-center py-4 text-slate-400 text-sm font-bold">
                    {`"${searchTerm}"`} এ কিছু পাওয়া যায়নি
                </div>
            )}

            {!loading && fares.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="text-left p-3 text-xs font-black text-slate-400">থেকে</th>
                                    <th className="text-left p-3 text-xs font-black text-slate-400">যায়</th>
                                    <th className="text-right p-3 text-xs font-black text-slate-400">ভাড়া</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fares.slice(0, 20).map((f, i) => (
                                    <tr key={i} className="border-t border-slate-50 hover:bg-emerald-50">
                                        <td className="p-3 font-bold text-slate-700">{f.from}</td>
                                        <td className="p-3 font-bold text-slate-700">{f.to}</td>
                                        <td className="p-3 text-right font-black text-emerald-700">৳{f.fare}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="p-4 bg-emerald-900 rounded-2xl text-white text-xs">
                <span className="font-black">ন্যূনতম ভাড়া: ৳10</span>
                <span className="ml-2 opacity-60">| ২.৪৫ টাকা/কিমি</span>
            </div>
        </div>
    );
};

export default FareSearchTable;