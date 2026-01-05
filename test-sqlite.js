// Test better-sqlite3 works directly
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
console.log('Database path:', dbPath);

try {
    console.log('Creating better-sqlite3 database connection...');
    const sqlite = new Database(dbPath);
    console.log('Database connection created successfully!');

    // Test a simple query
    const result = sqlite.prepare('SELECT 1 as test').get();
    console.log('Simple query result:', result);

    // Check tables
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables in database:', tables.map(t => t.name));

    sqlite.close();
    console.log('Database closed. Test completed successfully!');
} catch (error) {
    console.error('Error:', error);
}
