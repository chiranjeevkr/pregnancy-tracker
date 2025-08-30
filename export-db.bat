@echo off
echo Exporting pregnancy-tracker database...

mkdir database-export

mongoexport --db pregnancy-tracker --collection users --out database-export/users.json
mongoexport --db pregnancy-tracker --collection chathistories --out database-export/chathistories.json  
mongoexport --db pregnancy-tracker --collection dailyreports --out database-export/dailyreports.json

echo Database exported to database-export folder
pause