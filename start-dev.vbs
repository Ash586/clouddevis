Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d C:\Users\Chahine\Documents\cd && npx next dev --hostname 0.0.0.0 > server.log 2>&1", 0, False
