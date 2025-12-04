#!/bin/bash

# Script di deploy sicuro per produzione
# Preserva i dati del database e crea backup automatici

set -e  # Exit on error

echo "🚀 Inizio deploy SpeseCasa..."

# 1. Verifica di essere nella directory corretta
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Errore: docker-compose.yml non trovato!"
    echo "Esegui questo script dalla root del progetto"
    exit 1
fi

# 2. Crea backup del database
echo "📦 Creazione backup database..."
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/spesecasa_backup_$TIMESTAMP.db"

if [ -f "./data/spesecasa.db" ]; then
    cp ./data/spesecasa.db $BACKUP_FILE
    echo "✅ Backup creato: $BACKUP_FILE"
    
    # Mantieni solo gli ultimi 10 backup
    ls -t $BACKUP_DIR/spesecasa_backup_*.db | tail -n +11 | xargs -r rm
    echo "🧹 Vecchi backup rimossi (mantiengo gli ultimi 10)"
else
    echo "⚠️  Database non trovato, primo deploy"
fi

# 3. Pull delle modifiche da Git
echo "📥 Pull modifiche da Git..."
git pull origin master

# 4. Ricostruisci e riavvia i container (SENZA down per preservare i dati)
echo "🔨 Ricostruzione container..."
docker compose build

echo "♻️  Riavvio container..."
docker compose up -d

# 5. Verifica che i container siano running
echo "🔍 Verifica stato container..."
sleep 3
docker compose ps

# 6. Verifica che il database esista ancora
if [ -f "./data/spesecasa.db" ]; then
    DB_SIZE=$(du -h ./data/spesecasa.db | cut -f1)
    echo "✅ Database integro: $DB_SIZE"
else
    echo "❌ ATTENZIONE: Database non trovato dopo il deploy!"
    exit 1
fi

# 7. Mostra ultimi log
echo "📋 Ultimi log backend:"
docker logs spesecasa-backend-1 --tail 20

echo ""
echo "✅ Deploy completato con successo!"
echo "🔗 Applicazione disponibile su http://localhost"
echo "📊 Database: ./data/spesecasa.db"
echo "💾 Backup: $BACKUP_FILE"
