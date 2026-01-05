// Test Prisma with better-sqlite3 adapter - verbose
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
console.log('Database path:', dbPath);

async function main() {
    try {
        console.log('Step 1: Creating better-sqlite3 database connection...');
        const sqlite = new Database(dbPath);
        console.log('Step 1: DONE - Database connection created');

        console.log('Step 2: Creating Prisma adapter...');
        const adapter = new PrismaBetterSqlite3(sqlite);
        console.log('Step 2: DONE - Adapter created');

        console.log('Step 3: Creating PrismaClient...');
        const prisma = new PrismaClient({ adapter });
        console.log('Step 3: DONE - PrismaClient created');

        console.log('Step 4: Testing database query...');
        const users = await prisma.user.findMany();
        console.log('Step 4: DONE - Users count:', users.length);

        await prisma.$disconnect();
        console.log('All steps completed successfully!');
    } catch (error) {
        console.error('\n=== ERROR DETAILS ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error meta:', error.meta);
        console.error('Client version:', error.clientVersion);
        console.error('\nFull error stack:', error.stack);
    }
}

main();
