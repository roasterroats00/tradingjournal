"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Settings {
    maxRiskPerTrade: number;
    maxDailyLoss: number;
    maxTradesPerDay: number;
    startingBalance: number;
    currentBalance: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const formData = new FormData(e.currentTarget);
        const data = {
            maxRiskPerTrade: parseFloat(formData.get("maxRiskPerTrade") as string),
            maxDailyLoss: parseFloat(formData.get("maxDailyLoss") as string),
            maxTradesPerDay: parseInt(formData.get("maxTradesPerDay") as string),
            startingBalance: parseFloat(formData.get("startingBalance") as string),
        };

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updatedSettings = await res.json();
                setSettings(updatedSettings);
                setMessage("Pengaturan berhasil disimpan!");
                router.refresh();
            } else {
                setMessage("Gagal menyimpan pengaturan");
            }
        } catch {
            setMessage("Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
                <p>Memuat pengaturan...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Trading Journal
                    </h1>
                    <nav className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                            Dashboard
                        </Link>
                        <Link href="/dashboard/trades" className="text-slate-300 hover:text-white transition">
                            Jurnal
                        </Link>
                        <Link href="/dashboard/settings" className="text-white font-semibold">
                            Pengaturan
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Pengaturan Risk Management</h2>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl ${message.includes("berhasil")
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                        }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Risk Settings */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Batas Risiko</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Risiko Maksimal per Trade (%)
                                </label>
                                <input
                                    type="number"
                                    name="maxRiskPerTrade"
                                    step="0.1"
                                    min="0.1"
                                    max="10"
                                    defaultValue={settings?.maxRiskPerTrade || 2}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                                <p className="text-xs text-slate-400 mt-1">Rekomendasi: 1-2%</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Loss Maksimal Harian (%)
                                </label>
                                <input
                                    type="number"
                                    name="maxDailyLoss"
                                    step="0.1"
                                    min="0.1"
                                    max="20"
                                    defaultValue={settings?.maxDailyLoss || 4}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                                <p className="text-xs text-slate-400 mt-1">Trading akan terkunci jika terlampaui. Rekomendasi: 4-6%</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Maksimal Trade per Hari
                                </label>
                                <input
                                    type="number"
                                    name="maxTradesPerDay"
                                    min="1"
                                    max="50"
                                    defaultValue={settings?.maxTradesPerDay || 5}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                                <p className="text-xs text-slate-400 mt-1">Mencegah overtrading</p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Settings */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Saldo Akun</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Saldo Awal ($)
                                </label>
                                <input
                                    type="number"
                                    name="startingBalance"
                                    step="0.01"
                                    min="1"
                                    defaultValue={settings?.startingBalance || 100}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                                <p className="text-xs text-slate-400 mt-1">⚠️ Mengubah nilai ini akan mereset saldo saat ini</p>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-lg">
                                <p className="text-sm text-slate-400">Saldo Saat Ini</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    ${settings?.currentBalance?.toFixed(2) || "100.00"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                    </button>
                </form>

                {/* Philosophy */}
                <div className="mt-8 p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                    <h3 className="text-lg font-semibold mb-3">🧠 Filosofi Risk Management</h3>
                    <blockquote className="text-slate-400 italic border-l-4 border-emerald-500 pl-4">
                        &quot;Sistem harus melindungi trader dari dirinya sendiri.&quot;
                    </blockquote>
                    <ul className="mt-4 text-sm text-slate-400 space-y-2">
                        <li>• UX harus mencegah overtrading</li>
                        <li>• Error harus eksplisit</li>
                        <li>• Batas harus ditegakkan oleh logic, bukan reminder</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
