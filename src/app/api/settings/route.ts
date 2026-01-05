import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
    });

    if (!settings) {
        return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(settings);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { maxRiskPerTrade, maxDailyLoss, maxTradesPerDay, startingBalance } = body;

    // Get current settings to check if startingBalance changed
    const currentSettings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
    });

    // If startingBalance changed, also update currentBalance (reset account)
    const updateData: any = {
        maxRiskPerTrade,
        maxDailyLoss,
        maxTradesPerDay,
        startingBalance,
    };

    if (currentSettings && startingBalance !== currentSettings.startingBalance) {
        updateData.currentBalance = startingBalance;
    }

    const settings = await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: updateData,
    });

    return NextResponse.json(settings);
}
