# Deploy SpeseCasa in Produzione

Questa guida spiega come aggiornare SpeseCasa in produzione **senza perdere dati**.

## 🔒 Sicurezza dei Dati

Il database è persistente grazie al volume Docker:
```yaml
volumes:
  - ./data:/app/data  # Database SQLite salvato qui
```

Questo significa che il database **NON viene cancellato** quando si aggiornano i container.

## 🚀 Deploy Automatico

### Su Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Su Windows:
```cmd
deploy.bat
```

## 📋 Cosa fa lo script di deploy

1. ✅ **Backup automatico** del database prima dell'update
2. ✅ **Pull** delle modifiche da Git
3. ✅ **Rebuild** dei container con nuovo codice
4. ✅ **Riavvio** senza cancellare i dati
5. ✅ **Verifica** che database e container siano ok
6. ✅ **Mantiene** gli ultimi 10 backup

## 🛠️ Deploy Manuale

Se preferisci farlo a mano:

```bash
# 1. Backup manuale (importante!)
cp ./data/spesecasa.db ./backups/spesecasa_$(date +%Y%m%d).db

# 2. Pull modifiche
git pull origin master

# 3. Rebuild e restart (NON usare 'down'!)
docker compose build
docker compose up -d

# 4. Verifica
docker compose ps
docker logs spesecasa-backend-1 --tail 20
```

## ⚠️ Comandi da EVITARE

**NON usare questi comandi in produzione:**

```bash
# ❌ SBAGLIATO - cancella il volume dei dati
docker compose down -v

# ❌ SBAGLIATO - cancella tutti i volumi
docker volume prune

# ❌ SBAGLIATO - rimuove il database
rm -rf ./data
```

## 🔄 Migrazioni Database

Se ci sono migrazioni da eseguire, lo script le esegue automaticamente.

Per eseguire manualmente:
```bash
docker exec spesecasa-backend-1 python migrations/add_audit_fields.py
```

## 📦 Restore da Backup

Se qualcosa va storto:

```bash
# 1. Ferma i container
docker compose stop

# 2. Ripristina il backup (scegli il file dalla cartella backups/)
cp backups/spesecasa_backup_TIMESTAMP.db ./data/spesecasa.db

# 3. Riavvia
docker compose up -d
```

## 📊 Monitoraggio

Controlla i log in tempo reale:
```bash
# Backend
docker logs -f spesecasa-backend-1

# Frontend
docker logs -f spesecasa-frontend-1

# Tutti
docker compose logs -f
```

## 🔍 Verifica Database

Controlla dimensione e ultima modifica:
```bash
ls -lh ./data/spesecasa.db
```

Lista backup disponibili:
```bash
ls -lh ./backups/
```

## 🎯 Checklist Pre-Deploy

- [ ] Ho fatto il backup del database
- [ ] Ho testato le modifiche in locale
- [ ] Ho verificato che `./data` esista e contenga `spesecasa.db`
- [ ] Ho comunicato agli utenti la manutenzione (se necessario)

## 🆘 Troubleshooting

**"Database non trovato dopo deploy"**
- Controlla che `./data` esista
- Usa un backup recente per ripristinare

**"Container non si avvia"**
- Controlla i log: `docker logs spesecasa-backend-1`
- Verifica che non ci siano errori di sintassi nel codice

**"Errore di migrazione"**
- Ripristina il backup
- Esegui la migrazione manualmente
- Controlla i log per l'errore specifico
