import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteTrade } from "@/lib/actions/trades";

export default async function TradesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const trades = await prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { tradeDate: "desc" },
    });

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
                        <Link href="/dashboard/trades" className="text-white font-semibold">
                            Trades
                        </Link>
                        <Link href="/dashboard/settings" className="text-slate-300 hover:text-white transition">
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">All Trades</h2>
                    <Link
                        href="/dashboard/trades/new"
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition"
                    >
                        + Add Trade
                    </Link>
                </div>

                {trades.length > 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pair</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Session</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">TF</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Dir</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Entry</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">SL</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">TP</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">RR</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Result</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">P/L</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {trades.map((trade) => (
                                        <tr key={trade.id} className="hover:bg-slate-700/30 transition">
                                            <td className="px-4 py-4 text-sm text-slate-300">
                                                {new Date(trade.tradeDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-white">{trade.pair}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{trade.session}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{trade.timeframe}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${trade.direction === "Buy"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                    {trade.direction}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{trade.entryPrice}</td>
                                            <td className="px-4 py-4 text-sm text-red-400">{trade.stopLoss}</td>
                                            <td className="px-4 py-4 text-sm text-emerald-400">{trade.takeProfit}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{trade.rrRatio}:1</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${trade.result === "Win"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : trade.result === "Loss"
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-yellow-500/20 text-yellow-400"
                                                    }`}>
                                                    {trade.result}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-4 text-sm text-right font-medium ${trade.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                                                }`}>
                                                {trade.profitLoss >= 0 ? "+" : ""}${trade.profitLoss.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteTrade(trade.id);
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-12 text-center">
                        <p className="text-slate-400 mb-4">No trades yet. Start logging your trades!</p>
                        <Link
                            href="/dashboard/trades/new"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition"
                        >
                            Add Your First Trade
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
