import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isTradeAllowed, getDailyPL, getPerformanceMetrics, getEquityCurve } from "@/lib/risk-engine";
import { StatCard } from "@/components/ui/StatCard";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { Wallet, TrendingUp, AlertTriangle, Target, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { UserSettings } from "@prisma/client";
import { AIPatternWarning } from "@/components/ai/AIPatternWarning";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
    });

    if (!settings) {
        redirect("/login");
    }

    // Get risk status & metrics
    const riskStatus = await isTradeAllowed(userId);
    const dailyPL = await getDailyPL(userId);
    const metrics = await getPerformanceMetrics(userId);
    const equityCurve = await getEquityCurve(userId);

    // Get recent trades
    const recentTrades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { tradeDate: "desc" },
        take: 5,
    });

    const remainingDailyRisk = settings.maxDailyLoss - (dailyPL.totalLoss / settings.currentBalance) * 100;

    // Calculate trend for card
    const pnlTrend = dailyPL.netResult >= 0 ? "up" : "down";

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-glow">
                        Selamat datang, <span className="text-primary">{session.user.name?.split(" ")[0] || "Trader"}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Status pasar <span className="text-emerald-400 font-medium">Aktif</span>. Anda {riskStatus.allowed ? "diizinkan trading" : "terkunci"}.
                    </p>
                </div>

                {riskStatus.allowed ? (
                    <Link
                        href="/dashboard/trades/new"
                        className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-primary/20 rounded-full hover:bg-primary/30 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] border border-primary/50"
                    >
                        <span className="absolute inset-0 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <Plus className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Tambah Trade</span>
                    </Link>
                ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full w-fit">
                        <Lock className="w-4 h-4" />
                        <span className="font-semibold">Trading Terkunci</span>
                    </div>
                )}
            </div>

            {/* Risk Warning Panel */}
            {!riskStatus.allowed && (
                <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-4 backdrop-blur-md">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-400">Batas Risiko Terlampaui</h3>
                        <p className="text-sm text-red-300/80 mt-1">{riskStatus.reason}</p>
                    </div>
                </div>
            )}

            {/* AI Pattern Warning */}
            <AIPatternWarning />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Saldo"
                    value={`$${settings.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={Wallet}
                    trend="neutral"
                    trendValue="Live"
                    description={`Awal: $${settings.startingBalance.toLocaleString()}`}
                />

                <StatCard
                    title="P/L Harian"
                    value={`${dailyPL.netResult >= 0 ? "+" : ""}$${dailyPL.netResult.toFixed(2)}`}
                    icon={TrendingUp}
                    trend={pnlTrend}
                    className={dailyPL.netResult >= 0 ? "border-emerald-500/20" : "border-rose-500/20"}
                    trendValue={`${dailyPL.tradesCount} trade`}
                />

                <StatCard
                    title="Sisa Resiko"
                    value={`${remainingDailyRisk.toFixed(1)}%`}
                    icon={AlertTriangle}
                    trend={remainingDailyRisk < 1 ? "down" : "neutral"}
                    description={`Maks Harian: ${settings.maxDailyLoss}%`}
                    className={remainingDailyRisk < 0 ? "border-red-500/30 bg-red-500/5" : ""}
                />

                <StatCard
                    title="Win Rate"
                    value={`${metrics.winRate}%`}
                    icon={Target}
                    trend="up"
                    description={`${metrics.totalTrades} Total Trade`}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[350px] md:h-[400px]">
                    <PnLChart data={equityCurve} />
                </div>
                <div className="h-[300px] md:h-[400px]">
                    <WinRateChart wins={metrics.totalWins} losses={metrics.totalLosses} />
                </div>
            </div>

            {/* Recent Trades */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Aktivitas Terakhir</h2>
                    <Link href="/dashboard/trades" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        Lihat Semua Riwayat &rarr;
                    </Link>
                </div>
                <RecentTrades trades={recentTrades} />
            </div>
        </div>
    );
}
