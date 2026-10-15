@echo off
cd /d "%~dp0"
echo Server: http://localhost:8765
echo Phone/iPad: same Wi-Fi, open http://YOUR-PC-IP:8765  (run ipconfig to find IPv4)
start "" http://localhost:8765
python -m http.server 8765
pause
