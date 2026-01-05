import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// PostgreSQL connection is configured in prisma.config.ts
// Prisma v7 automatically loads datasource URL from the config file
export const prisma = global.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;



