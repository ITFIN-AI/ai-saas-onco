# Chat Integration with PostgreSQL

## Przegląd

System chat został zintegrowany z n8n webhook i lokalną bazą danych PostgreSQL. Historia rozmów jest przechowywana w PostgreSQL i wyświetlana w sidebarze po zatwierdzeniu emailu i kodu dostępu.

## Funkcjonalności

### ✅ Zaimplementowane:

1. **Integracja z n8n webhook**: `https://aiforyou.agency/webhook/87d0712c-9ce3-4f5d-a715-8a1f5f1574c6/chat`
2. **PostgreSQL Storage**: Historia rozmów przechowywana w lokalnej bazie PostgreSQL
3. **Session Management**: Każdy email ma unikalne sesje rozmów
4. **History Display**: Historia pojawia się w sidebarze po zatwierdzeniu formularza
5. **Real-time Chat**: Interfejs czatu z wiadomościami w czasie rzeczywistym
6. **Error Handling**: Obsługa błędów sieciowych i API

## Architektura

### Backend (Firebase Functions)
- **SendMessageUseCase**: Obsługuje wysyłanie wiadomości do n8n i zapis do PostgreSQL
- **GetChatHistoryFromPostgresUseCase**: Pobiera historię rozmów z PostgreSQL
- **ChatSessionDocument**: Model danych dla sesji czatu
- **ChatHistoryDocument**: Model danych dla historii rozmów

### Frontend (React)
- **ChatInterface**: Komponent interfejsu czatu
- **ChatHistory**: Komponent historii w sidebarze
- **ChatService**: Serwis do komunikacji z API

### Database (PostgreSQL)
- **chat_sessions**: Tabela sesji rozmów
- **chat_messages**: Tabela wiadomości
- **Indexes**: Optymalizacja zapytań
- **Triggers**: Automatyczne aktualizacje timestampów

## Konfiguracja

### Zmienne środowiskowe

```bash
# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=chat_history
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Docker Compose

PostgreSQL jest automatycznie uruchamiany w Docker Compose z:
- Automatycznym tworzeniem tabel
- Persistent storage
- Port 5432 dostępny lokalnie

## Uruchomienie

### 1. Uruchom aplikację z PostgreSQL

```bash
# Uruchom wszystkie serwisy (app, firebase, postgres)
docker-compose up -d

# Lub uruchom tylko PostgreSQL
docker-compose up postgres -d
```

### 2. Sprawdź czy PostgreSQL działa

```bash
# Połącz się z bazą danych
docker exec -it ai-saas-postgres psql -U postgres -d chat_history

# Sprawdź tabele
\dt
```

### 3. Sprawdź logi

```bash
# Logi aplikacji
docker-compose logs app

# Logi PostgreSQL
docker-compose logs postgres

# Logi Firebase Functions
docker-compose logs firebase
```

## API Endpoints

### 1. Send Message
```
POST /chat/sendMessage
Content-Type: application/json

{
  "message": "Pytanie użytkownika",
  "email": "user@example.com",
  "sessionId": "chat_userhash_timestamp"
}
```

### 2. Get Chat History
```
GET /chat/getChatHistoryFromPostgres?email=user@example.com
```

### 3. Get Specific Session History
```
GET /chat/getChatHistory/{sessionId}?email=user@example.com
```

## CORS Configuration

Wszystkie endpointy chat są skonfigurowane z CORS (`origin: true`), co pozwala na żądania cross-origin z frontendu.

## Flow Użytkownika

1. **Wprowadzenie danych**: Użytkownik wprowadza email i kod dostępu
2. **Zatwierdzenie**: Po kliknięciu "Potwierdzam" w sekcji regulaminu
3. **Wyświetlenie historii**: Historia rozmów pojawia się w sidebarze
4. **Rozpoczęcie czatu**: Użytkownik może zadać pytanie i rozpocząć rozmowę
5. **Kontynuacja**: Historia jest zachowana i dostępna w sidebarze

## Struktura bazy danych

### Tabela: chat_sessions
```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: chat_messages
```sql
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);
```

## Rozwiązywanie problemów

### Problem: PostgreSQL connection error
```bash
# Sprawdź czy PostgreSQL działa
docker-compose ps postgres

# Sprawdź logi
docker-compose logs postgres

# Restart serwisu
docker-compose restart postgres
```

### Problem: Tabele nie istnieją
```bash
# Uruchom skrypt SQL ręcznie
docker exec -i ai-saas-postgres psql -U postgres -d chat_history < scripts/create-chat-tables.sql
```

### Problem: Historia się nie wyświetla
1. Sprawdź czy email jest poprawny
2. Sprawdź logi Firebase Functions
3. Sprawdź czy endpoint `/chat/getChatHistoryFromPostgres` odpowiada
4. Sprawdź konsolę przeglądarki pod kątem błędów API

### Problem: CORS Error
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```

**Rozwiązanie:**
- Sprawdź czy Firebase Functions są uruchomione: `docker-compose logs firebase`
- Sprawdź czy endpoint jest dostępny: `curl http://localhost:5001/chat/getChatHistoryFromPostgres?email=test@example.com`
- Sprawdź logi Firebase Functions pod kątem błędów CORS
- Upewnij się, że frontend używa poprawnych ścieżek API (z prefiksem `/chat/`)

## Monitoring

### Logi Firebase Functions
```bash
# Logi w czasie rzeczywistym
docker-compose logs -f firebase

# Logi z filtrowaniem
docker-compose logs firebase | grep "ChatHistory"
```

### Logi PostgreSQL
```bash
# Logi zapytań SQL
docker-compose logs postgres | grep "LOG"
```

## Bezpieczeństwo

- Wszystkie zapytania używają prepared statements
- Walidacja emaili po stronie serwera
- Ograniczenia na poziomie bazy danych (CHECK constraints)
- Transakcje dla operacji atomowych

## Wydajność

- Indeksy na kluczowych kolumnach
- Connection pooling w PostgreSQL
- Ograniczenie do 50 sesji na zapytanie
- Automatyczne czyszczenie starych sesji (można dodać w przyszłości)
