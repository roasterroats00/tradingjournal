import prisma from "./prisma";

export interface RiskValidationResult {
    allowed: boolean;
    reason?: string;
    dailyLoss?: number;
    dailyLossPercent?: number;
    tradesCount?: number;
    remainingRisk?: number;
}

/**
 * Check if a trade is allowed based on risk management rules
 */
export async function isTradeAllowed(userId: string): Promise<RiskValidationResult> {
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
    });

    if (!settings) {
        return { allowed: false, reason: "User settings not found. Please configure your account first." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count today's trades first
    const tradesCount = await prisma.trade.count({
        where: {
            userId,
            tradeDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });

    // Get daily stats
    const dailyStats = await prisma.dailyStats.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });

    // If locked but no trades exist today, unlock (data inconsistency fix)
    if (dailyStats?.isLocked && tradesCount === 0) {
        await prisma.dailyStats.update({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            data: {
                isLocked: false,
                totalLoss: 0,
                totalProfit: 0,
                netResult: 0,
                totalTrades: 0,
            },
        });
        // Continue with normal flow
    } else if (dailyStats?.isLocked) {
        // Locked and has trades - enforce lock
        return {
            allowed: false,
            reason: "Trading is locked for today. Daily loss limit exceeded.",
            dailyLoss: dailyStats.totalLoss,
            dailyLossPercent: (dailyStats.totalLoss / settings.currentBalance) * 100,
        };
    }

    // Check max trades per day
    if (tradesCount >= settings.maxTradesPerDay) {
        return {
            allowed: false,
            reason: `Maximum trades per day (${settings.maxTradesPerDay}) reached.`,
            tradesCount,
        };
    }

    // Calculate daily loss
    const todayTrades = await prisma.trade.findMany({
        where: {
            userId,
            tradeDate: {
                gte: today,
                lt: tomorrow,
            },
        },
        select: { profitLoss: true },
    });

    const dailyLoss = todayTrades
        .filter((t) => t.profitLoss < 0)
        .reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);

    const dailyLossPercent = (dailyLoss / settings.currentBalance) * 100;

    // Check daily loss limit
    if (dailyLossPercent >= settings.maxDailyLoss) {
        // Lock trading for today
        await lockTradingForToday(userId, today, dailyLoss);
        return {
            allowed: false,
            reason: `Daily loss limit (${settings.maxDailyLoss}%) exceeded.`,
            dailyLoss,
            dailyLossPercent,
        };
    }

    const remainingRisk = settings.maxDailyLoss - dailyLossPercent;

    return {
        allowed: true,
        dailyLoss,
        dailyLossPercent,
        tradesCount,
        remainingRisk,
    };
}

/**
 * Validate individual trade risk
 */
export function validateTradeRisk(
    riskPercent: number,
    maxRiskPerTrade: number
): { valid: boolean; reason?: string } {
    if (riskPercent > maxRiskPerTrade) {
        return {
            valid: false,
            reason: `Risk per trade (${riskPercent}%) exceeds maximum allowed (${maxRiskPerTrade}%).`,
        };
    }
    return { valid: true };
}

/**
 * Validate RR ratio
 */
export function validateRR(
    rrRatio: number,
    minimumRR: number = 2
): { valid: boolean; reason?: string } {
    if (rrRatio < minimumRR) {
        return {
            valid: false,
            reason: `Risk:Reward ratio (${rrRatio}) is below minimum (${minimumRR}:1).`,
        };
    }
    return { valid: true };
}

/**
 * Lock trading for today
 */
async function lockTradingForToday(userId: string, date: Date, totalLoss: number) {
    await prisma.dailyStats.upsert({
        where: {
            userId_date: {
                userId,
                date,
            },
        },
        create: {
            userId,
            date,
            totalLoss,
            isLocked: true,
        },
        update: {
            totalLoss,
            isLocked: true,
        },
    });
}

/**
 * Calculate daily P/L
 */
export async function getDailyPL(userId: string): Promise<{
    totalProfit: number;
    totalLoss: number;
    netResult: number;
    tradesCount: number;
}> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trades = await prisma.trade.findMany({
        where: {
            userId,
            tradeDate: {
                gte: today,
                lt: tomorrow,
            },
        },
        select: { profitLoss: true },
    });

    const totalProfit = trades
        .filter((t) => t.profitLoss > 0)
        .reduce((sum, t) => sum + t.profitLoss, 0);

    const totalLoss = trades
        .filter((t) => t.profitLoss < 0)
        .reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);

    return {
        totalProfit,
        totalLoss,
        netResult: totalProfit - totalLoss,
        tradesCount: trades.length,
    };
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(userId: string) {
    const trades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { tradeDate: "asc" },
    });

    if (trades.length === 0) {
        return {
            totalTrades: 0,
            winRate: 0,
            averageRR: 0,
            totalProfit: 0,
            totalLoss: 0,
            netProfit: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            totalWins: 0,
            totalLosses: 0,
        };
    }

    const wins = trades.filter((t) => t.result === "Win").length;
    const losses = trades.filter((t) => t.result === "Loss").length;
    const winRate = (wins / trades.length) * 100;

    const averageRR = trades.reduce((sum, t) => sum + t.rrRatio, 0) / trades.length;

    const totalProfit = trades
        .filter((t) => t.profitLoss > 0)
        .reduce((sum, t) => sum + t.profitLoss, 0);

    const totalLoss = trades
        .filter((t) => t.profitLoss < 0)
        .reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit;

    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let equity = 0;

    for (const trade of trades) {
        equity += trade.profitLoss;
        if (equity > peak) peak = equity;
        const drawdown = peak - equity;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return {
        totalTrades: trades.length,
        winRate: Number(winRate.toFixed(2)),
        averageRR: Number(averageRR.toFixed(2)),
        totalProfit,
        totalLoss,
        netProfit: totalProfit - totalLoss,
        profitFactor: Number(profitFactor.toFixed(2)),
        maxDrawdown,
        totalWins: wins,
        totalLosses: losses,
    };
}

/**
 * Get Equity Curve Data
 */
export async function getEquityCurve(userId: string) {
    const trades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { tradeDate: "asc" },
        select: {
            tradeDate: true,
            profitLoss: true,
        },
    });

    let cumulativePnL = 0;
    const curve = trades.map((trade, index) => {
        cumulativePnL += trade.profitLoss;
        return {
            name: trade.tradeDate.toLocaleDateString(), // Or use simple index if many trades same day
            pnl: cumulativePnL,
            index: index + 1
        };
    });

    // If no trades, provide baseline
    if (curve.length === 0) {
        return [{ name: "Start", pnl: 0, index: 0 }];
    }

    return curve;
}
