// Test script to debug Prisma + better-sqlite3 adapter
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "dev.db");
console.log("Database path:", dbPath);

try {
    console.log("Creating better-sqlite3 database connection...");
    const sqlite = new Database(dbPath);
    console.log("Database connection created");

    console.log("Creating Prisma adapter...");
    const adapter = new PrismaBetterSqlite3(sqlite);
    console.log("Adapter created");

    console.log("Creating PrismaClient...");
    const prisma = new PrismaClient({ adapter });
    console.log("PrismaClient created");

    console.log("Testing database query...");
    const users = await prisma.user.findMany();
    console.log("Users count:", users.length);

    await prisma.$disconnect();
    console.log("Test completed successfully!");
} catch (error) {
    console.error("Error:", error);
    if (error && typeof error === 'object') {
        console.log("Error keys:", Object.keys(error));
        console.log("Error details:", JSON.stringify(error, null, 2));
    }
}
