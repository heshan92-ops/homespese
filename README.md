# SpeseCasa Lite

Gestore di spese domestiche semplice e leggero, ottimizzato per Raspberry Pi.

## Funzionalità
- 🏠 **Dashboard**: KPI mensili, grafici di spesa.
- 💰 **Movimenti**: Inserimento spese ed entrate, vista tabellare.
- 📊 **Budget**: Gestione limiti di spesa per categoria.
- 🔒 **Privacy**: Dati salvati localmente su file SQLite.

## Requisiti
- Raspberry Pi 4 (o superiore) / PC Linux / Windows / Mac.
- Docker e Docker Compose installati.

## Installazione su Raspberry Pi

1. **Clona il repository** (o copia i file):
   ```bash
   git clone <url-repository> spesecasa
   cd spesecasa
   ```

2. **Avvia l'applicazione**:
   ```bash
   docker-compose up -d --build
   ```
   *La prima volta potrebbe richiedere alcuni minuti per costruire le immagini.*

3. **Accedi all'app**:
   Apri il browser e vai all'indirizzo IP del tuo Raspberry Pi:
   `http://<IP-RASPBERRY>`
   (es. `http://192.168.1.100`)

## Sviluppo Locale

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Struttura Dati
Il database SQLite viene salvato in `./data/spesecasa.db`.
Per fare un backup, basta copiare questo file.
