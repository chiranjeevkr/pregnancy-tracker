@echo off
echo Importing pregnancy-tracker database...

mongoimport --db pregnancy-tracker --collection users --file database-export/users.json
mongoimport --db pregnancy-tracker --collection chathistories --file database-export/chathistories.json
mongoimport --db pregnancy-tracker --collection dailyreports --file database-export/dailyreports.json

echo Database imported successfully
pause