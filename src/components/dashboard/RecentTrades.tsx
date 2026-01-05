import { Trade } from "@prisma/client";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AITradeInsight } from "@/components/ai/AITradeInsight";
import { Fragment } from "react";

interface RecentTradesProps {
    trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
    if (trades.length === 0) {
        return (
            <div className="glass rounded-xl p-12 text-center">
                <p className="text-muted-foreground mb-4">Belum ada trade. Mulai catat trading Anda!</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pair</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arah</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hasil</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">P/L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {trades.map((trade) => (
                            <Fragment key={trade.id}>
                                <tr className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                        {new Date(trade.tradeDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                                        {trade.pair}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-md flex w-fit items-center gap-1",
                                            trade.direction === "Buy"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            {trade.direction === "Buy" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {trade.direction}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-md",
                                            trade.result === "Win"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : trade.result === "Loss"
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                        )}>
                                            {trade.result}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-sm font-bold text-right",
                                        trade.profitLoss > 0 ? "text-emerald-400 text-glow" : trade.profitLoss < 0 ? "text-rose-400" : "text-muted-foreground"
                                    )}>
                                        {trade.profitLoss > 0 ? "+" : ""}${trade.profitLoss.toFixed(2)}
                                    </td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td colSpan={5} className="px-6 py-2">
                                        <AITradeInsight tradeId={trade.id} />
                                    </td>
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
