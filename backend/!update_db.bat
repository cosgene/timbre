REM To update database on PostgreSQL side, replace 'InitialCreate' with a new name describing its changes(ex. AddMessageEntity)

dotnet ef migrations add InitialCreate
dotnet ef database update

pause
