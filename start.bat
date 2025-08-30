@echo off
echo Starting Pregnancy Tracker Application...
echo.

echo Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo MongoDB is not running. Please start MongoDB first.
    echo You can start MongoDB with: mongod
    pause
    exit /b 1
)

echo MongoDB is running!
echo.
echo Starting the application...
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

npm run dev