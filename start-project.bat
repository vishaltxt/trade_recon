@echo off
cd /d %~dp0
pm2 start ecosystem.config.js
pm2 logs
cmd /k
