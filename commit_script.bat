@echo off
REM Move files from dir1 to dir2 and replace existing files
xcopy /s /y "C:\Users\Lenovo T470\Desktop\JS\Tipovacka\tipovacka\dist\tipovacka\browser\*" "C:\Users\Lenovo T470\Desktop\JS\gh_pages\browser\*"

REM Change to the git repository directory
cd "C:\Users\Lenovo T470\Desktop\JS\gh_pages\browser"

REM Add all changes to git
git add .

REM Commit changes with a message
git commit -a -m %*

REM Push changes to the main branch
git push origin main

REM Pause to keep the command prompt open (optional)
pause
