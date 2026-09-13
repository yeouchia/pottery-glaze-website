@echo off
chcp 65001 >nul
echo 正在產出資料夾結構樹狀圖...
tree /f > folder_tree.txt
echo.
echo =========================================
echo   產出成功！請查看 folder_tree.txt
echo =========================================
pause >nul