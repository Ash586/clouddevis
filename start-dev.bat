@echo off
cd /d "X:\clouddevis"
npx next dev --hostname 0.0.0.0 > "X:\clouddevis\server.log" 2>&1
