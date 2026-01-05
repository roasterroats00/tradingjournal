import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                // Create default settings
                settings: {
                    create: {
                        maxRiskPerTrade: 2.0,
                        maxDailyLoss: 4.0,
                        maxTradesPerDay: 5,
                        startingBalance: 100,
                        currentBalance: 100,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message || "Validation failed" },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);
        console.log("Error type:", typeof error);
        console.log("Error name:", (error as Error)?.name);
        console.log("Error message:", (error as Error)?.message);
        if (error && typeof error === 'object') {
            console.log("Error keys:", Object.keys(error));
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
