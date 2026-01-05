"use server";

import { prisma } from "@/lib/prisma";
import { analyzeTradeWithAI, detectTradingPatterns } from "@/lib/ai/analysis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get AI analysis for a specific trade
 */
export async function getTradeAIAnalysis(tradeId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const trade = await prisma.trade.findUnique({
            where: { id: tradeId },
        });

        if (!trade || trade.userId !== session.user.id) {
            return { error: "Trade not found" };
        }

        // Get user history
        const allTrades = await prisma.trade.findMany({
            where: { userId: session.user.id },
            orderBy: { tradeDate: "desc" },
            take: 20,
        });

        const wins = allTrades.filter((t) => t.result === "Win").length;
        const winRate = allTrades.length > 0 ? (wins / allTrades.length) * 100 : 0;
        const averageRR = allTrades.length > 0
            ? allTrades.reduce((sum, t) => sum + t.rrRatio, 0) / allTrades.length
            : 0;

        const analysis = await analyzeTradeWithAI(trade, {
            totalTrades: allTrades.length,
            winRate: Number(winRate.toFixed(2)),
            averageRR: Number(averageRR.toFixed(2)),
            recentTrades: allTrades.slice(0, 5),
        });

        return { success: true, analysis };
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return { error: "Failed to analyze trade" };
    }
}

/**
 * Check for trading pattern warnings
 */
export async function checkTradingPatterns() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const recentTrades = await prisma.trade.findMany({
            where: { userId: session.user.id },
            orderBy: { tradeDate: "desc" },
            take: 10,
        });

        const patterns = await detectTradingPatterns(recentTrades, 24);

        return { success: true, patterns };
    } catch (error) {
        console.error("Pattern Detection Error:", error);
        return { error: "Failed to detect patterns" };
    }
}
