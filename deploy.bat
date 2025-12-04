@echo off
REM Script di deploy sicuro per produzione Windows
REM Preserva i dati del database e crea backup automatici

echo 🚀 Inizio deploy SpeseCasa...
echo.

REM 1. Verifica di essere nella directory corretta
if not exist "docker-compose.yml" (
    echo ❌ Errore: docker-compose.yml non trovato!
    echo Esegui questo script dalla root del progetto
    exit /b 1
)

REM 2. Crea backup del database
echo 📦 Creazione backup database...
if not exist "backups" mkdir backups

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%b%%a)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime%
set BACKUP_FILE=backups\spesecasa_backup_%TIMESTAMP%.db

if exist "data\spesecasa.db" (
    copy "data\spesecasa.db" "%BACKUP_FILE%" >nul
    echo ✅ Backup creato: %BACKUP_FILE%
    echo.
) else (
    echo ⚠️  Database non trovato, primo deploy
    echo.
)

REM 3. Pull delle modifiche da Git
echo 📥 Pull modifiche da Git...
git pull origin master
echo.

REM 4. Ricostruisci e riavvia i container (SENZA down per preservare i dati)
echo 🔨 Ricostruzione container...
docker compose build
echo.

echo ♻️  Riavvio container...
docker compose up -d
echo.

REM 5. Attendi che i container siano pronti
echo ⏳ Attendo avvio container...
timeout /t 5 /nobreak >nul
echo.

REM 6. Verifica che i container siano running
echo 🔍 Verifica stato container...
docker compose ps
echo.

REM 7. Verifica che il database esista ancora
if exist "data\spesecasa.db" (
    echo ✅ Database integro
) else (
    echo ❌ ATTENZIONE: Database non trovato dopo il deploy!
    exit /b 1
)
echo.

REM 8. Mostra ultimi log
echo 📋 Ultimi log backend:
docker logs spesecasa-backend-1 --tail 20
echo.

echo ✅ Deploy completato con successo!
echo 🔗 Applicazione disponibile su http://localhost
echo 📊 Database: data\spesecasa.db
echo 💾 Backup: %BACKUP_FILE%
pause
