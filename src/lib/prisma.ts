import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create adapter with URL (as per Prisma 7 docs)
// Uses file: protocol with relative path from project root
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });

// Create PrismaClient with adapter (required in Prisma 7)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
