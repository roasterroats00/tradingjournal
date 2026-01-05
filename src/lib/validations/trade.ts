import { z } from "zod";

// Trading pairs commonly used
export const tradingPairs = [
    "XAUUSD", "BTCUSD", "EURUSD", "GBPUSD", "USDJPY",
    "GBPJPY", "EURJPY", "AUDUSD", "USDCAD", "USDCHF",
    "NZDUSD", "ETHUSD", "US30", "NAS100", "SPX500"
] as const;

export const sessions = ["Asia", "London", "New York"] as const;

export const timeframes = [
    "M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"
] as const;

export const directions = ["Buy", "Sell"] as const;

export const tradeResults = ["Win", "Loss", "BE"] as const;

// Trade creation schema
export const createTradeSchema = z.object({
    tradeDate: z.coerce.date(),
    pair: z.string().min(1, "Pair is required"),
    session: z.enum(sessions),
    timeframe: z.enum(timeframes),
    direction: z.enum(directions),
    entryPrice: z.coerce.number().positive("Entry price must be positive"),
    stopLoss: z.coerce.number().positive("Stop loss must be positive"),
    takeProfit: z.preprocess(
        (val) => val === "" || val === null || val === undefined ? undefined : val,
        z.coerce.number().positive("Take profit must be positive").optional()
    ),
    lotSize: z.coerce.number().positive("Lot size must be positive"),
    result: z.enum(tradeResults),
    profitLoss: z.coerce.number(),
    notes: z.string().optional(),
    // Pre-trade checklist
    trendAligned: z.boolean().default(false),
    entryAtKeyLevel: z.boolean().default(false),
    stopLossDefined: z.boolean().default(true),
    rrAboveMinimum: z.boolean().default(false),
    riskWithinLimit: z.boolean().default(false),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;

// User settings schema
export const userSettingsSchema = z.object({
    maxRiskPerTrade: z.coerce.number().min(0.1).max(10).default(2),
    maxDailyLoss: z.coerce.number().min(0.1).max(20).default(4),
    maxTradesPerDay: z.coerce.number().int().min(1).max(50).default(5),
    startingBalance: z.coerce.number().positive().default(100),
    currentBalance: z.coerce.number().positive().default(100),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// Calculate RR ratio
export function calculateRR(
    entry: number,
    stopLoss: number,
    takeProfit: number,
    direction: "Buy" | "Sell"
): number {
    if (direction === "Buy") {
        const risk = entry - stopLoss;
        const reward = takeProfit - entry;
        return risk > 0 ? Number((reward / risk).toFixed(2)) : 0;
    } else {
        const risk = stopLoss - entry;
        const reward = entry - takeProfit;
        return risk > 0 ? Number((reward / risk).toFixed(2)) : 0;
    }
}

// Calculate risk percentage
export function calculateRiskPercent(
    entry: number,
    stopLoss: number,
    lotSize: number,
    balance: number,
    pipValue: number = 10 // Default pip value, can be adjusted
): number {
    const pips = Math.abs(entry - stopLoss);
    const dollarRisk = pips * pipValue * lotSize;
    return Number(((dollarRisk / balance) * 100).toFixed(2));
}
