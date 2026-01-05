import { generateAIResponse } from "./gemini";
import { Trade } from "@prisma/client";

interface TradeAnalysisResult {
    feedback: string;
    warnings: string[];
    suggestions: string[];
}

/**
 * Analyze a single trade and provide AI feedback
 */
export async function analyzeTradeWithAI(
    trade: Trade,
    userHistory: {
        totalTrades: number;
        winRate: number;
        averageRR: number;
        recentTrades: Trade[];
    }
): Promise<TradeAnalysisResult> {
    const prompt = `
Kamu adalah AI Trading Coach yang membantu trader retail meningkatkan performa mereka.

**Data Trade Terbaru:**
- Pair: ${trade.pair}
- Sesi: ${trade.session}
- Timeframe: ${trade.timeframe}
- Arah: ${trade.direction}
- RR Ratio: ${trade.rrRatio}:1
- Hasil: ${trade.result}
- P/L: $${trade.profitLoss}
- Catatan Trader: ${trade.notes || "Tidak ada catatan"}

**Statistik Trader:**
- Total Trade: ${userHistory.totalTrades}
- Win Rate: ${userHistory.winRate}%
- Average RR: ${userHistory.averageRR}:1

**5 Trade Terakhir:**
${userHistory.recentTrades
            .map(
                (t, i) =>
                    `${i + 1}. ${t.pair} | ${t.session} | ${t.result} | P/L: $${t.profitLoss}`
            )
            .join("\n")}

**Tugasmu:**
1. Berikan feedback singkat (2-3 kalimat) tentang trade ini
2. Identifikasi pola berbahaya jika ada (revenge trading, overtrading, FOMO)
3. Berikan 1-2 saran konkret untuk perbaikan

Format response dalam JSON:
{
  "feedback": "string",
  "warnings": ["string"],
  "suggestions": ["string"]
}

Gunakan bahasa Indonesia yang ramah tapi tegas. Fokus pada perilaku, bukan prediksi pasar.
`;

    try {
        const response = await generateAIResponse(prompt);

        // Parse JSON response
        const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const analysis: TradeAnalysisResult = JSON.parse(cleanedResponse);

        return analysis;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        // Fallback response
        return {
            feedback: "Analisis AI tidak tersedia saat ini.",
            warnings: [],
            suggestions: [],
        };
    }
}

/**
 * Detect trading patterns (revenge trading, overtrading, etc.)
 */
export async function detectTradingPatterns(
    recentTrades: Trade[],
    timeWindowHours: number = 24
): Promise<{
    hasRevengeTrading: boolean;
    hasOvertrading: boolean;
    hasFOMO: boolean;
    message: string;
}> {
    if (recentTrades.length < 3) {
        return {
            hasRevengeTrading: false,
            hasOvertrading: false,
            hasFOMO: false,
            message: "",
        };
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);

    const tradesInWindow = recentTrades.filter(
        (t) => new Date(t.tradeDate) >= windowStart
    );

    // Revenge Trading: Multiple trades in short time after a loss
    const hasRevengeTrading = tradesInWindow.some((trade, index) => {
        if (index === 0) return false;
        const prevTrade = tradesInWindow[index - 1];
        const timeDiff = new Date(trade.tradeDate).getTime() - new Date(prevTrade.tradeDate).getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        return prevTrade.result === "Loss" && minutesDiff < 30;
    });

    // Overtrading: Too many trades in a day
    const hasOvertrading = tradesInWindow.length > 5;

    // FOMO: Trades without proper checklist
    const hasFOMO = tradesInWindow.some(
        (t) => !t.trendAligned || !t.entryAtKeyLevel
    );

    let message = "";
    if (hasRevengeTrading) {
        message = "⚠️ Terdeteksi revenge trading! Kamu melakukan trade terlalu cepat setelah loss.";
    } else if (hasOvertrading) {
        message = "⚠️ Overtrading detected! Terlalu banyak trade dalam 24 jam terakhir.";
    } else if (hasFOMO) {
        message = "⚠️ Beberapa trade tidak memenuhi checklist. Apakah ini FOMO?";
    }

    return {
        hasRevengeTrading,
        hasOvertrading,
        hasFOMO,
        message,
    };
}

/**
 * Generate weekly performance summary
 */
export async function generateWeeklySummary(
    trades: Trade[],
    startDate: Date,
    endDate: Date
): Promise<string> {
    const weekTrades = trades.filter(
        (t) =>
            new Date(t.tradeDate) >= startDate && new Date(t.tradeDate) <= endDate
    );

    if (weekTrades.length === 0) {
        return "Tidak ada trade minggu ini.";
    }

    // Calculate stats
    const wins = weekTrades.filter((t) => t.result === "Win").length;
    const losses = weekTrades.filter((t) => t.result === "Loss").length;
    const totalPL = weekTrades.reduce((sum, t) => sum + t.profitLoss, 0);

    // Group by pair
    const pairStats = weekTrades.reduce((acc, t) => {
        if (!acc[t.pair]) {
            acc[t.pair] = { wins: 0, losses: 0, pl: 0 };
        }
        if (t.result === "Win") acc[t.pair].wins++;
        if (t.result === "Loss") acc[t.pair].losses++;
        acc[t.pair].pl += t.profitLoss;
        return acc;
    }, {} as Record<string, { wins: number; losses: number; pl: number }>);

    // Group by session
    const sessionStats = weekTrades.reduce((acc, t) => {
        if (!acc[t.session]) {
            acc[t.session] = { wins: 0, losses: 0, pl: 0 };
        }
        if (t.result === "Win") acc[t.session].wins++;
        if (t.result === "Loss") acc[t.session].losses++;
        acc[t.session].pl += t.profitLoss;
        return acc;
    }, {} as Record<string, { wins: number; losses: number; pl: number }>);

    const prompt = `
Kamu adalah AI Trading Analyst. Buatkan ringkasan performa trading mingguan yang insightful.

**Data Minggu Ini:**
- Total Trade: ${weekTrades.length}
- Wins: ${wins} | Losses: ${losses}
- Total P/L: $${totalPL.toFixed(2)}

**Performa per Pair:**
${Object.entries(pairStats)
            .map(([pair, stats]) => `- ${pair}: ${stats.wins}W/${stats.losses}L | P/L: $${stats.pl.toFixed(2)}`)
            .join("\n")}

**Performa per Sesi:**
${Object.entries(sessionStats)
            .map(([session, stats]) => `- ${session}: ${stats.wins}W/${stats.losses}L | P/L: $${stats.pl.toFixed(2)}`)
            .join("\n")}

**Tugasmu:**
Buatkan ringkasan 4-5 paragraf yang mencakup:
1. Overview performa minggu ini
2. Pair terbaik dan terburuk
3. Sesi paling profitable
4. Saran konkret untuk minggu depan

Gunakan bahasa Indonesia yang motivasi tapi realistis. Jangan terlalu panjang.
`;

    try {
        const summary = await generateAIResponse(prompt);
        return summary;
    } catch (error) {
        console.error("Weekly Summary Error:", error);
        return "Gagal generate ringkasan mingguan.";
    }
}
