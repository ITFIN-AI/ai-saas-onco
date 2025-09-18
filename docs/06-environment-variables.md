# Konfiguracja zmiennych środowiskowych

## Spis treści
- [Wymagania wstępne](#wymagania-wstępne)
- [Podstawy zmiennych środowiskowych](#podstawy-zmiennych-środowiskowych)
- [Konfiguracja Firebase](#konfiguracja-firebase)
- [Pozostałe zmienne środowiskowe](#pozostałe-zmienne-środowiskowe)
- [Konfiguracja Cloud Functions](#konfiguracja-cloud-functions)
- [Konfiguracja emulatorów](#konfiguracja-emulatorów)
- [Weryfikacja konfiguracji](#weryfikacja-konfiguracji)
- [Zmienne dla różnych środowisk](#zmienne-dla-różnych-środowisk)
- [Potencjalne problemy i rozwiązania](#potencjalne-problemy-i-rozwiązania)
- [Przydatne linki](#przydatne-linki)

## Wymagania wstępne

1. Upewnij się, że masz skonfigurowane środowisko zgodnie z dokumentem [Konfiguracja środowiska deweloperskiego](./02-dev-environment-setup.md)
2. Upewnij się, że masz skonfigurowany projekt Firebase zgodnie z dokumentem [Konfiguracja usług Firebase](./03-firebase-configuration.md)
3. Upewnij się, że rozumiesz strukturę monorepo zgodnie z dokumentem [Konfiguracja monorepo](./04-monorepo-setup.md)

## Podstawy zmiennych środowiskowych

Projekt używa plików `.env` do konfiguracji zmiennych środowiskowych. W aplikacji React (Vite) zmienne muszą zaczynać się od prefiksu `VITE_`, aby były dostępne w kodzie frontendowym.

Główne pliki konfiguracyjne:
- `.env.dist` - plik szablonowy z listą wymaganych zmiennych (nie zawiera rzeczywistych wartości)
- `.env.local` - plik z lokalnymi zmiennymi środowiskowymi (używany w lokalnym środowisku deweloperskim)
- `.env.develop` - plik ze zmiennymi dla współdzielonego środowiska deweloperskiego (np. serwer deweloperski)
- `.env.production` - plik ze zmiennymi dla środowiska produkcyjnego (tworzony podczas wdrażania)

> **Ważne**: Pliki `.env.local`, `.env.develop` i `.env.production` zawierają poufne informacje i nie powinny być udostępniane w repozytorium. Są one dodane do `.gitignore`.

## Konfiguracja Firebase

Konfiguracja Firebase jest kluczowa dla działania aplikacji. Bez poprawnych wartości otrzymasz błąd podobny do: `FirebaseError: Firebase: Error (auth/invalid-api-key)`.

### Pobieranie konfiguracji Firebase

1. Zaloguj się do [Firebase Console](https://console.firebase.google.com/)
2. Wybierz swój projekt Firebase
3. Kliknij na ikonę koła zębatego (⚙️) obok "Project Overview" w lewym menu
4. Wybierz "Project settings"
5. Przewiń w dół do sekcji "Your apps"
6. Jeśli nie masz jeszcze dodanej aplikacji webowej, kliknij na ikonę web (`</>`)
   - Nadaj aplikacji nazwę (np. "akademia-saas-web")
   - Zaznacz opcję "Also set up Firebase Hosting for this app"
   - W rozwiniętym formularzu wybierz z listy hosting skonfigurowany w kroku [Konfiguracja usług Firebase](./03-firebase-configuration.md)
   - Kliknij "Register app"
7. Konfiguracja Firebase zostanie wyświetlona w formacie JavaScript. Potrzebujesz wartości z obiektu `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                          // To będzie VITE_FIREBASE_API_KEY
  authDomain: "project-id.firebaseapp.com",   // To będzie VITE_FIREBASE_AUTH_DOMAIN
  projectId: "project-id",                    // To będzie VITE_FIREBASE_PROJECT_ID
  storageBucket: "project-id.appspot.com",    // To będzie VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",             // To będzie VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123def456",      // To będzie VITE_FIREBASE_APP_ID
  measurementId: "G-ABC123DEF"                // To będzie VITE_FIREBASE_MEASUREMENT_ID
};
```

### Uzupełnianie pliku .env.local

1. Skopiuj plik `.env.dist` do `.env.local` w katalogu `apps/web-app`:

2. Uzupełnij zmienne Firebase na podstawie konfiguracji z konsoli Firebase.

Poza konfiguracją Firebase, aplikacja wymaga również innych zmiennych środowiskowych. Zawierają one zmienne dotyczące integracji z różnymi serwisami (np. Stripe, Sentry) oraz inne konfiguracje aplikacji.

### Opis kluczowych zmiennych środowiskowych dla aplikacji frontendowej

Poniżej znajduje się opis najważniejszych zmiennych środowiskowych używanych przez aplikację frontendową:

| Zmienna | Opis | Priorytet |
|---------|------|-----------|
| `VITE_FIREBASE_API_KEY` | Klucz API dla Firebase | Wymagana |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domena uwierzytelniania Firebase | Wymagana |
| `VITE_FIREBASE_PROJECT_ID` | ID projektu Firebase | Wymagana |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket Storage w Firebase | Wymagana |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID nadawcy dla Firebase Cloud Messaging | Wymagana |
| `VITE_FIREBASE_APP_ID` | ID aplikacji Firebase | Wymagana |
| `VITE_FIREBASE_MEASUREMENT_ID` | ID dla Google Analytics | Opcjonalna* |
| `VITE_ENV_NAME` | Nazwa środowiska (local, develop, production) | Wymagana |
| `VITE_FIREBASE_EMULATOR` | Flaga włączająca emulatory Firebase | Wymagana dla lokalnego rozwoju |
| `VITE_STRIPE_PUBLIC_KEY` | Publiczny klucz dla integracji ze Stripe | Opcjonalna* |
| `VITE_SENTRY_KEY` | Klucz dla integracji z Sentry (monitorowanie błędów) | Opcjonalna* |
| `VITE_FUNCTION_DOMAIN` | Domena dla funkcji Firebase | Opcjonalna* |

> \* Zmienne opcjonalne są wymagane tylko dla funkcjonalności, które z nich korzystają. Na przykład `VITE_STRIPE_PUBLIC_KEY` jest potrzebny tylko jeśli korzystasz płatności przez Stripe. Niektóre z nich mogą zostać dodane później.

## Konfiguracja Cloud Functions

Cloud Functions używają podobnego mechanizmu zmiennych środowiskowych jak aplikacja frontendowa, czyli plików `.env`. Jedyna różnica polega na tym, że zmienne dla Cloud Functions nie wymagają prefiksu `VITE_`.

W przypadku Cloud Functions:
- Dla lokalnego rozwoju używamy pliku `.env.local`
- Dla środowiska deweloperskiego używamy pliku `.env.develop`
- Dla środowiska produkcyjnego używamy pliku `.env.production`

> **Ważne**: Zmienne środowiskowe dla Cloud Functions **nie używają** prefiksu `VITE_`, który jest specyficzny tylko dla aplikacji frontendowej opartej o Vite.

### Opis kluczowych zmiennych środowiskowych

Poniżej znajduje się opis najważniejszych zmiennych środowiskowych używanych przez Cloud Functions:

| Zmienna | Opis | Priorytet |
|---------|------|-----------|
| `ENVIRONMENT_NAME` | Nazwa środowiska (local, develop, production) | Wymagana |
| `API_JWT_PRIVATE_KEY` | Klucz używany do podpisywania tokenów JWT | Opcjonalna* |
| `DOMAIN` | Domena aplikacji (np. localhost dla środowiska lokalnego) | Wymagana |
| `GOOGLE_CLOUD_PROJECT` | ID projektu Google Cloud - ustawiana automatycznie w środowisku Google Cloud | Automatyczna |
| `SLACK_URL` | Webhook URL dla powiadomień Slack | Opcjonalna* |
| `SLACK_CHANNEL` | Kanał dla powiadomień Slack | Opcjonalna* |
| `POSTMARK_API_KEY` | Klucz API dla serwisu e-mail Postmark | Opcjonalna* |
| `POSTMARK_FROM` | Adres nadawcy dla e-maili | Opcjonalna* |
| `FAKTUROWNIA_API_KEY` | Klucz API dla integracji z Fakturownia | Opcjonalna* |
| `FAKTUROWNIA_API_URL` | URL API Fakturownia | Opcjonalna* |
| `FAKTUROWNIA_DEPARTMENT_ID` | ID oddziału w Fakturownia | Opcjonalna* |
| `STRIPE_API_KEY` | Klucz API dla integracji ze Stripe | Opcjonalna* |
| `STRIPE_CLIENT_ID` | ID klienta dla integracji ze Stripe | Opcjonalna* |
| `STRIPE_WEBHOOK_SECRET` | Sekret webhooka Stripe | Opcjonalna* |
| `STRIPE_PRODUCT_ID` | ID produktu w Stripe | Opcjonalna* |
| `UPSTASH_REDIS_REST_URL` | URL dla Redis Upstash | Opcjonalna* |
| `UPSTASH_REDIS_REST_TOKEN` | Token dla Redis Upstash | Opcjonalna* |

> \* Zmienne opcjonalne są wymagane tylko dla funkcjonalności, które z nich korzystają. Np. `API_JWT_PRIVATE_KEY` jest wymagane tylko gdy używasz API.

#### Generowanie klucza API_JWT_PRIVATE_KEY

Zmienna `API_JWT_PRIVATE_KEY` jest wymagana do inicjalizacji API i podpisywania tokenów JWT, jeśli korzystasz z funkcjonalności API. Aby wygenerować klucz:

1. Uruchom poniższą komendę, aby wygenerować losowy klucz:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. Skopiuj wygenerowany ciąg znaków i użyj go jako wartość zmiennej `API_JWT_PRIVATE_KEY`:
```
API_JWT_PRIVATE_KEY="abcdef123456789...klucz_wygenerowany_powyższą_komendą"
```

> **Uwaga**: Klucz JWT jest bardzo wrażliwą informacją. Nigdy nie umieszczaj go w repozytorium kodu ani nie udostępniaj publicznie.

### Zmienne środowiskowe dla lokalnych emulatorów

Emulatory Cloud Functions automatycznie korzystają z pliku `.env.local`:

1. Skopiuj plik `.env.dist` do `.env.local` w katalogu `apps/functions`:
2. Dostosuj zmienne w pliku `.env.local` według potrzeb Twojego projektu.

3. Emulator automatycznie załaduje te zmienne przy uruchomieniu:
```bash
firebase emulators:start
```

> **Uwaga na etapie rozwoju**: Dla większości lokalnych implementacji nie wszystkie zmienne muszą być skonfigurowane. Możesz zacząć od podstawowych, a pozostałe dodawać w miarę rozszerzania funkcjonalności.

### Ustawienie zmiennych środowiskowych dla wdrożonych funkcji

Dla funkcji wdrożonych do Firebase, zmienne środowiskowe definiujemy w odpowiednich plikach `.env`:

1. Dla środowiska deweloperskiego tworzymy plik `apps/functions/.env.develop`
2. Dla środowiska produkcyjnego tworzymy plik `apps/functions/.env.production`

Struktura zmiennych w tych plikach jest analogiczna do opisanej powyżej dla środowiska lokalnego. Dostosuj wartości odpowiednio do danego środowiska (np. inne URL-e, klucze API, itd.). Pamiętaj, że `GOOGLE_CLOUD_PROJECT` jest ustawiane automatycznie w środowisku Google Cloud.

> **Bezpieczeństwo**: Dla środowisk produkcyjnych zaleca się używanie osobnych kluczy dostępowych i tajnych, innych niż używane w środowisku deweloperskim. Wartości powinny być odpowiednio zabezpieczone.

### Dostęp do zmiennych środowiskowych w kodzie Cloud Functions

W kodzie Cloud Functions dostęp do zmiennych odbywa się przez standardowy obiekt `process.env`.

## Konfiguracja emulatorów

Aby korzystać z emulatorów Firebase zamiast produkcyjnych usług, ustaw w zmiennych web-app:

```
VITE_FIREBASE_EMULATOR=true
```

Ta zmienna powoduje, że aplikacja będzie łączyć się z lokalnymi emulatorami Firebase zamiast z usługami w chmurze. Jest to zalecane podczas lokalnego rozwoju, ponieważ:
- Nie generujesz faktycznych kosztów
- Możesz pracować w trybie offline
- Masz pełną kontrolę nad danymi
- Nie ryzykujesz modyfikacji danych produkcyjnych

## Weryfikacja konfiguracji

Aby sprawdzić, czy zmienne środowiskowe są poprawnie skonfigurowane:

1. Uruchom emulatory Firebase (w osobnym terminalu):
```bash
pnpm emulator
```

2. Uruchom aplikację (w innym terminalu):
```bash
pnpm dev
```

3. Otwórz przeglądarkę pod adresem [http://localhost:3000](http://localhost:3000)

4. Sprawdź konsolę deweloperską (F12) - powinieneś zobaczyć komunikat "Running on Firebase emulator!" jeśli `VITE_FIREBASE_EMULATOR=true`

5. Spróbuj zarejestrować nowego użytkownika lub zalogować się - jeśli działa, oznacza to, że konfiguracja Firebase jest poprawna

## Zmienne dla różnych środowisk

Projekt wspiera trzy różne środowiska pracy, każde z własnym zestawem zmiennych środowiskowych:

### Środowisko lokalne
- Używaj pliku `.env.local` (dla web-app i functions)
- Ustaw `VITE_ENV_NAME=local` (dla web-app)
- Ustaw `ENVIRONMENT_NAME=local` (dla functions)
- Włącz emulatory: `VITE_FIREBASE_EMULATOR=true`
- To środowisko jest używane podczas lokalnego developmentu na Twoim komputerze
- Dane są przechowywane tylko lokalnie w emulatorach

### Środowisko deweloperskie (develop)
- Używaj pliku `.env.develop` (dla web-app i functions)
- Ustaw `VITE_ENV_NAME=develop` (dla web-app)
- Ustaw `ENVIRONMENT_NAME=develop` (dla functions)
- Połącz z projektem deweloperskim Firebase (najczęściej tym samym, który jest używany w `.firebaserc` jako 'develop')
- Wyłącz emulatory: `VITE_FIREBASE_EMULATOR=false` lub usuń tę zmienną
- To środowisko jest używane dla współdzielonej wersji deweloperskiej, dostępnej dla całego zespołu

### Środowisko produkcyjne
- Używaj pliku `.env.production` (dla web-app i functions)
- Ustaw `VITE_ENV_NAME=production` (dla web-app)
- Ustaw `ENVIRONMENT_NAME=production` (dla functions)
- Połącz z projektem produkcyjnym Firebase (najczęściej tym samym, który jest używany w `.firebaserc` jako 'production')
- Wyłącz emulatory: `VITE_FIREBASE_EMULATOR=false` lub usuń tę zmienną

> **Ważne**: Wszystkie pliki `.env.*` zawierają poufne informacje i powinny być dodane do `.gitignore`. Nigdy nie umieszczaj ich w repozytorium.

### Tworzenie pliku .env.develop

Dla aplikacji frontendowej (web-app):

1. Skopiuj plik `.env.dist` do `.env.develop`:
```bash
cd apps/web-app
cp .env.dist .env.develop
```

2. Uzupełnij zmienne Firebase dla środowiska deweloperskiego:
```
VITE_FIREBASE_API_KEY=<apiKey z deweloperskiego projektu Firebase>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain z deweloperskiego projektu Firebase>
VITE_FIREBASE_PROJECT_ID=<projectId z deweloperskiego projektu Firebase>
VITE_FIREBASE_STORAGE_BUCKET=<storageBucket z deweloperskiego projektu Firebase>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId z deweloperskiego projektu Firebase>
VITE_FIREBASE_APP_ID=<appId z deweloperskiego projektu Firebase>
VITE_FIREBASE_MEASUREMENT_ID=<measurementId z deweloperskiego projektu Firebase>
VITE_ENV_NAME=develop
VITE_FIREBASE_EMULATOR=false
```

Dla Cloud Functions, utwórz analogiczny plik w katalogu `apps/functions` z odpowiednimi zmiennymi opisanymi wcześniej w sekcji Cloud Functions.

## Potencjalne problemy i rozwiązania

### Problem: FirebaseError: Firebase: Error (auth/invalid-api-key)
- **Przyczyna**: Brak lub niepoprawne wartości dla konfiguracji Firebase.
- **Rozwiązanie**: Upewnij się, że poprawnie uzupełniłeś wszystkie zmienne `VITE_FIREBASE_*` w pliku `.env.local`.

### Problem: Emulator Firebase nie jest używany pomimo ustawienia
- **Przyczyna**: Emulator może nie być uruchomiony lub zmienna nie jest poprawnie odczytana.
- **Rozwiązanie**:
  1. Upewnij się, że emulator jest uruchomiony (`pnpm emulator`)
  2. Upewnij się, że ustawiłeś `VITE_FIREBASE_EMULATOR=true` (jako string, nie boolean)
  3. Zrestartuj aplikację po zmianie zmiennych środowiskowych


### Problem: Inne usługi (Stripe, itp.) nie działają
- **Przyczyna**: Brak konfiguracji dla tych usług.
- **Rozwiązanie**: Te usługi nie są wymagane do podstawowego działania aplikacji. Będą konfigurowane w późniejszych etapach rozwoju.

## Przydatne linki
- [Dokumentacja Firebase - Konfiguracja aplikacji web](https://firebase.google.com/docs/web/setup)
- [Dokumentacja Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Dokumentacja Vite - Zmienne środowiskowe](https://vitejs.dev/guide/env-and-mode.html)
- [Dokumentacja Stripe API](https://stripe.com/docs/api)
