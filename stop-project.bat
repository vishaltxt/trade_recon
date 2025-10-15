@echo off
cd /d %~dp0
pm2 stop all
pm2 delete all
echo All PM2 processes stopped and deleted.
cmd /k
