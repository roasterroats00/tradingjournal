"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTradeSchema, calculateRR } from "@/lib/validations/trade";
import { isTradeAllowed, validateTradeRisk, validateRR } from "@/lib/risk-engine";
import { revalidatePath } from "next/cache";

export async function createTrade(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check if trading is allowed
    const riskCheck = await isTradeAllowed(userId);
    if (!riskCheck.allowed) {
        return { error: riskCheck.reason };
    }

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
    });

    if (!settings) {
        return { error: "User settings not found" };
    }

    // Parse form data
    const rawData = {
        tradeDate: formData.get("tradeDate"),
        pair: formData.get("pair"),
        session: formData.get("session"),
        timeframe: formData.get("timeframe"),
        direction: formData.get("direction"),
        entryPrice: formData.get("entryPrice"),
        stopLoss: formData.get("stopLoss"),
        takeProfit: formData.get("takeProfit"),
        lotSize: formData.get("lotSize"),
        result: formData.get("result"),
        profitLoss: formData.get("profitLoss"),
        notes: formData.get("notes"),
        trendAligned: formData.get("trendAligned") === "on",
        entryAtKeyLevel: formData.get("entryAtKeyLevel") === "on",
        stopLossDefined: formData.get("stopLossDefined") === "on",
        rrAboveMinimum: formData.get("rrAboveMinimum") === "on",
        riskWithinLimit: formData.get("riskWithinLimit") === "on",
    };

    const parsed = createTradeSchema.safeParse(rawData);

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const data = parsed.data;

    // Calculate RR
    const rrRatio = calculateRR(
        data.entryPrice,
        data.stopLoss,
        data.takeProfit,
        data.direction
    );

    // Validate RR
    const rrValidation = validateRR(rrRatio, 2);
    if (!rrValidation.valid && !data.rrAboveMinimum) {
        return { error: rrValidation.reason + " Check the RR confirmation." };
    }

    // Calculate risk percent (simplified - based on lot size and price difference)
    const riskAmount = Math.abs(data.entryPrice - data.stopLoss) * data.lotSize * 100;
    const riskPercent = (riskAmount / settings.currentBalance) * 100;

    // Validate trade risk
    const riskValidation = validateTradeRisk(riskPercent, settings.maxRiskPerTrade);
    if (!riskValidation.valid) {
        return { error: riskValidation.reason };
    }

    // Validate pre-trade checklist
    if (!data.trendAligned || !data.entryAtKeyLevel || !data.stopLossDefined) {
        return { error: "Please complete the pre-trade checklist before submitting." };
    }

    try {
        // Create trade
        const trade = await prisma.trade.create({
            data: {
                userId,
                tradeDate: data.tradeDate,
                pair: data.pair,
                session: data.session,
                timeframe: data.timeframe,
                direction: data.direction,
                entryPrice: data.entryPrice,
                stopLoss: data.stopLoss,
                takeProfit: data.takeProfit,
                lotSize: data.lotSize,
                riskPercent,
                rrRatio,
                result: data.result,
                profitLoss: data.profitLoss,
                notes: data.notes || null,
                trendAligned: data.trendAligned,
                entryAtKeyLevel: data.entryAtKeyLevel,
                stopLossDefined: data.stopLossDefined,
                rrAboveMinimum: data.rrAboveMinimum,
                riskWithinLimit: data.riskWithinLimit,
            },
        });

        // Update current balance
        await prisma.userSettings.update({
            where: { userId },
            data: {
                currentBalance: {
                    increment: data.profitLoss,
                },
            },
        });

        // Update daily stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.dailyStats.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            create: {
                userId,
                date: today,
                totalTrades: 1,
                totalProfit: data.profitLoss > 0 ? data.profitLoss : 0,
                totalLoss: data.profitLoss < 0 ? Math.abs(data.profitLoss) : 0,
                netResult: data.profitLoss,
            },
            update: {
                totalTrades: { increment: 1 },
                totalProfit: { increment: data.profitLoss > 0 ? data.profitLoss : 0 },
                totalLoss: { increment: data.profitLoss < 0 ? Math.abs(data.profitLoss) : 0 },
                netResult: { increment: data.profitLoss },
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/trades");

        return { success: true, trade };
    } catch (error) {
        console.error("Create trade error:", error);
        return { error: "Failed to create trade" };
    }
}

export async function getTrades() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    const trades = await prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { tradeDate: "desc" },
    });

    return trades;
}

export async function deleteTrade(tradeId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const trade = await prisma.trade.findUnique({
        where: { id: tradeId },
    });

    if (!trade || trade.userId !== session.user.id) {
        return { error: "Trade not found" };
    }

    // Revert balance change
    await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: {
            currentBalance: {
                decrement: trade.profitLoss,
            },
        },
    });

    await prisma.trade.delete({
        where: { id: tradeId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/trades");

    return { success: true };
}
