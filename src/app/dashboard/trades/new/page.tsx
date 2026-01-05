"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrade } from "@/lib/actions/trades";
import { calculateRR, sessions, timeframes, directions, tradeResults, tradingPairs } from "@/lib/validations/trade";
import Link from "next/link";

export default function NewTradePage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rrRatio, setRrRatio] = useState<number | null>(null);

    // Form state for RR calculation
    const [entryPrice, setEntryPrice] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [takeProfit, setTakeProfit] = useState("");
    const [direction, setDirection] = useState<"Buy" | "Sell">("Buy");

    // Calculate RR when prices change
    function updateRR() {
        const entry = parseFloat(entryPrice);
        const sl = parseFloat(stopLoss);
        const tp = parseFloat(takeProfit);

        if (entry && sl) {
            if (tp) {
                const rr = calculateRR(entry, sl, tp, direction);
                setRrRatio(rr);
            } else {
                setRrRatio(null); // No TP = No RR
            }
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const result = await createTrade(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Trading Journal
                    </h1>
                    <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Add New Trade</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    {/* Trade Details */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Trade Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Trade Date
                                </label>
                                <input
                                    type="datetime-local"
                                    name="tradeDate"
                                    required
                                    defaultValue={new Date().toISOString().slice(0, 16)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>

                            {/* Pair */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Trading Pair
                                </label>
                                <select
                                    name="pair"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                >
                                    {tradingPairs.map((pair) => (
                                        <option key={pair} value={pair}>{pair}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Session */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Session
                                </label>
                                <select
                                    name="session"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                >
                                    {sessions.map((session) => (
                                        <option key={session} value={session}>{session}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Timeframe */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Timeframe
                                </label>
                                <select
                                    name="timeframe"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                >
                                    {timeframes.map((tf) => (
                                        <option key={tf} value={tf}>{tf}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Direction */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Direction
                                </label>
                                <select
                                    name="direction"
                                    required
                                    value={direction}
                                    onChange={(e) => {
                                        setDirection(e.target.value as "Buy" | "Sell");
                                        setTimeout(updateRR, 0);
                                    }}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                >
                                    {directions.map((dir) => (
                                        <option key={dir} value={dir}>{dir}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Lot Size */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Lot Size
                                </label>
                                <input
                                    type="number"
                                    name="lotSize"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    placeholder="0.01"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Levels */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Price Levels</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Entry */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Entry Price
                                </label>
                                <input
                                    type="number"
                                    name="entryPrice"
                                    step="0.00001"
                                    required
                                    value={entryPrice}
                                    onChange={(e) => {
                                        setEntryPrice(e.target.value);
                                        setTimeout(updateRR, 0);
                                    }}
                                    placeholder="1.1234"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>

                            {/* Stop Loss */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Stop Loss
                                </label>
                                <input
                                    type="number"
                                    name="stopLoss"
                                    step="0.00001"
                                    required
                                    value={stopLoss}
                                    onChange={(e) => {
                                        setStopLoss(e.target.value);
                                        setTimeout(updateRR, 0);
                                    }}
                                    placeholder="1.1200"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>

                            {/* Take Profit */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Take Profit <span className="text-slate-500 text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="number"
                                    name="takeProfit"
                                    step="0.00001"
                                    value={takeProfit}
                                    onChange={(e) => {
                                        setTakeProfit(e.target.value);
                                        setTimeout(updateRR, 0);
                                    }}
                                    placeholder="1.1300 (leave empty if no TP)"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>
                        </div>

                        {/* RR Display */}
                        {entryPrice && stopLoss && (
                            <div className={`mt-4 p-4 rounded-lg ${rrRatio === null
                                    ? "bg-orange-500/20 border border-orange-500/50"
                                    : rrRatio >= 2
                                        ? "bg-emerald-500/20 border border-emerald-500/50"
                                        : "bg-yellow-500/20 border border-yellow-500/50"
                                }`}>
                                <p className={`font-semibold ${rrRatio === null
                                        ? "text-orange-400"
                                        : rrRatio >= 2
                                            ? "text-emerald-400"
                                            : "text-yellow-400"
                                    }`}>
                                    {rrRatio !== null ? (
                                        <>
                                            Risk:Reward = 1:{rrRatio.toFixed(2)}
                                            {rrRatio < 2 && " ⚠️ Below minimum (1:2)"}
                                        </>
                                    ) : (
                                        <>⚠️ No Take Profit set - RR ratio: N/A</>
                                    )}
                                </p>
                                {rrRatio === null && (
                                    <p className="text-orange-300 text-sm mt-2">
                                        Trading without a Take Profit target is risky. Consider setting a profit target.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Result */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Trade Result</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Result */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Result
                                </label>
                                <select
                                    name="result"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                >
                                    {tradeResults.map((result) => (
                                        <option key={result} value={result}>{result}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Profit/Loss */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Profit/Loss ($)
                                </label>
                                <input
                                    type="number"
                                    name="profitLoss"
                                    step="0.01"
                                    required
                                    placeholder="-5.00 or 10.00"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Notes (Emotional state, reasoning)
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="What was your mindset? Why did you take this trade?"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Pre-Trade Checklist */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Pre-Trade Checklist ✓</h3>
                        <p className="text-slate-400 text-sm mb-4">All items must be checked to submit the trade.</p>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="trendAligned"
                                    required
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-slate-300">Trend alignment confirmed</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entryAtKeyLevel"
                                    required
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-slate-300">Entry at pullback or key level</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="stopLossDefined"
                                    required
                                    defaultChecked
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-slate-300">Stop loss defined</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rrAboveMinimum"
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-slate-300">RR ≥ 1:2 (or justified exception)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="riskWithinLimit"
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-slate-300">Risk within limit</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-center text-white font-semibold rounded-lg transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Trade"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
