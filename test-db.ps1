# Test Supabase connection - Simple version
$env:DATABASE_URL = "postgresql://postgres.anbehztlxvuwchcctaok:eoo3sAKllvl6MvfT@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

Write-Host "Testing Prisma DB Push to Supabase..."
Write-Host ""

npx prisma db push
