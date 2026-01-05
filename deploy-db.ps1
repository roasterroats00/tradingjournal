# Load .env file and run prisma db push
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        Write-Host "Set $name"
    }
}

Write-Host "`nRunning prisma db push...`n"
npx prisma db push
