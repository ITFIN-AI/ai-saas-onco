# Akademia SaaS - Szybka konfiguracja projektu

Ten dokument zawiera skrócony przewodnik uruchomienia projektu.

Poniżej znajdują się podstawowe kroki niezbędne do uruchomienia projektu. Wykonaj je po kolei, a w razie problemów zajrzyj do odpowiedniej, szczegółowej dokumentacji.

## 1. Wymagania systemowe
- Node.js 22
- pnpm 10.4.1
- Firebase CLI 13.25.0
- Git
- Java 11+ (w celu uruchomienia emulatorów)

> **Uwaga dla użytkowników Windows**: Zalecamy korzystanie z Windows Subsystem for Linux (WSL) w celu zapewnienia pełnej kompatybilności z narzędziami używanymi w projekcie. WSL pozwala na uruchomienie środowiska Linux bezpośrednio w systemie Windows. Instrukcje instalacji WSL można znaleźć na stronie [Microsoft Learn](https://learn.microsoft.com/pl-pl/windows/wsl/install).

## 2. Konfiguracja środowiska
```bash
# Zainstaluj pnpm globalnie
npm install -g pnpm@10.4.1

# Zainstaluj Firebase CLI
npm install -g firebase-tools@13.25.0

# Klonowanie repozytorium
git clone git@github.com:AkademiaSaaS/akademiasaas-boilerplate.git
cd akademiasaas-boilerplate

# Instalacja pakietów
pnpm install
```

> **Uwaga dla użytkowników Windows**: Jeśli podczas instalacji pnpm w PowerShell napotykasz błąd związany z polityką wykonywania skryptów ("running scripts is disabled on this system"), otwórz PowerShell jako administrator i wykonaj polecenie `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`. Szczegółowe informacje znajdziesz w sekcji [Wymagania systemowe](./01-system-requirements.md).

## 3. Konfiguracja Firebase
1. Utwórz projekty Firebase (dev/prod) na [console.firebase.google.com](https://console.firebase.google.com)
2. Włącz wymagane usługi:
   - Authentication (Email/Password, Google)
   - Firestore
   - Storage
   - Functions
   - Hosting
3. Skonfiguruj plik `.firebaserc`
   ```json
   {
     "projects": {
       "develop": "twoj-projekt-dev",
       "production": "twoj-projekt-prod"
     }
   }
   ```
4. Wybierz projekt: `firebase use develop`

## 4. Zmienne środowiskowe

Szczegółowe informacje na temat konfiguracji zmiennych środowiskowych znajdziesz w dokumencie [Konfiguracja zmiennych środowiskowych](./06-environment-variables.md).


1. Skopiuj pliki `.env.dist` do nowych plików:
   ```bash
   # Dla lokalnego rozwoju
   cp apps/web-app/.env.dist apps/web-app/.env.local
   cp apps/functions/.env.dist apps/functions/.env.local

   # Dla środowiska deweloperskiego
   cp apps/web-app/.env.dist apps/web-app/.env.develop
   cp apps/functions/.env.dist apps/functions/.env.develop

   # Dla środowiska produkcyjnego
   cp apps/web-app/.env.dist apps/web-app/.env.production
   cp apps/functions/.env.dist apps/functions/.env.production
   ```

2. Pobierz konfigurację Firebase z konsoli Firebase i uzupełnij zmienne w plikach `.env.local`, `.env.develop` i `.env.production`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   > **Ważne**: W plikach `.env.develop` i `.env.production` użyj odpowiednich wartości dla każdego środowiska (dev/prod).

3. Wygeneruj klucz API JWT i dodaj do wszystkich plików środowiskowych functions:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Skopiuj wynik do API_JWT_PRIVATE_KEY
   ```

## 5. Dostosowanie stałych aplikacji

Przed uruchomieniem projektu należy dostosować domyślne wartości stałych:

1. Otwórz plik `packages/shared/src/constants/names.ts` i zmień domyślną nazwę aplikacji:
   ```typescript
   // Zmień z
   export const APP_NAME = '__PAGE_TITLE__';
   // na swoją nazwę aplikacji
   export const APP_NAME = 'Moja Aplikacja SaaS';
   ```

2. Otwórz plik `packages/shared/src/constants/urls.ts` i zastąp domyślne adresy URL własnymi:
   ```typescript
   // Zmień poniższe wartości na odpowiednie dla twojego projektu
   export const HELP_PAGE_URL = 'https://twoja-domena.com/pomoc';
   export const API_HOST = 'https://api.twoja-domena.com';
   export const PRICING_PAGE_URL = 'https://twoja-domena.com/cennik';
   export const APP_URL = 'https://twoja-domena.com';
   export const API_DOCUMENTATION_URL = 'https://twoja-domena.com/api-docs';
   ```

   > **Wskazówka**: Dla środowiska deweloperskiego możesz użyć adresów z subdomeny dev, np. `https://dev.twoja-domena.com`.

3. Zamień również placeholder `__PAGE_TITLE__` w następujących plikach:

   - W pliku `apps/web-app/index.html` zmień tytuł strony:
     ```html
     <title>__PAGE_TITLE__</title>
     <!-- na -->
     <title>Moja Aplikacja SaaS</title>
     ```

   - W pliku `apps/web-app/public/manifest.json` zmień nazwy aplikacji:
     ```json
     "short_name": "__PAGE_TITLE__",
     "name": "__PAGE_TITLE__",
     // na
     "short_name": "Moja Aplikacja SaaS",
     "name": "Moja Aplikacja SaaS",
     ```

   - W plikach tłumaczeń `packages/shared/src/translations/en/auth.json` i `packages/shared/src/translations/pl/auth.json` zastąp wszystkie wystąpienia `__PAGE_TITLE__` nazwą swojej aplikacji, szczególnie w sekcjach:
     ```json
     "copyright": "__PAGE_TITLE__ ©",
     // oraz
     "acceptEnd": "serwisu __PAGE_TITLE__ i akceptuję jego warunki.",
     ```

   > **Uwaga**: Upewnij się, że we wszystkich plikach używasz tej samej nazwy aplikacji dla zachowania spójności.

## 6. Uruchomienie projektu lokalnie
```bash
# Uruchomienie emulatorów Firebase
pnpm emulator

# W nowym terminalu, uruchom aplikację
pnpm dev
```

## 7. Integracja z płatnościami Stripe (opcjonalnie)
1. Utwórz konto na [stripe.com](https://stripe.com)
2. Skonfiguruj klucz API w plikach środowiskowych functions:
   ```
   # Dodaj do .env.local, .env.develop i .env.production
   STRIPE_API_KEY=sk_test_... # klucz testowy dla .env.local i .env.develop
   STRIPE_API_KEY=sk_live_... # klucz produkcyjny dla .env.production
   ```
3. Utwórz produkt i plany cenowe w panelu Stripe
4. Skonfiguruj webhook Stripe wskazujący na endpoint `subscriptions-stripeEndpoint/webhook`
5. Zapisz sekret webhooka w zmiennych środowiskowych:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. W panelu Stripe, dodaj lookup keys do planów cenowych (np. pl-month-basic)
7. Włącz Stripe Tax w panelu podatkowym Stripe

## 8. Wdrażanie aplikacji
```bash
# Dla środowiska deweloperskiego
firebase use develop
firebase deploy  # Użyje zmiennych z .env.develop

# Dla środowiska produkcyjnego
firebase use production
firebase deploy  # Użyje zmiennych z .env.production
```

> **Uwaga**: Podczas pierwszego wdrażania możesz zostać poproszony o potwierdzenie utworzenia roli IAM dla Storage (`Cloud Storage for Firebase needs an IAM Role to use cross-service rules. Grant the new role? (Y/n)`). Wprowadź `Y`, aby zatwierdzić. Więcej informacji znajdziesz w [Konfiguracja usług Firebase - Problem z konfiguracją Storage i rolą IAM](./03-firebase-configuration.md#problem-z-konfiguracja-storage-i-rola-iam) oraz [Proces wdrażania - Problem z prośbą o potwierdzenie utworzenia roli IAM](./07-deployment-process.md#problem-prosba-o-potwierdzenie-utworzenia-roli-iam).

> **Ważne**: Przed wdrażaniem Cloud Functions upewnij się, że utworzyłeś instancję Google App Engine w odpowiednim regionie. Szczegóły znajdziesz w dokumentacji [Konfiguracja usług Firebase - Cloud Functions](./03-firebase-configuration.md#cloud-functions) oraz [Proces wdrażania - Problem z błędem związanym z brakiem instancji Google App Engine](./07-deployment-process.md#problem-blad-zwiazany-z-brakiem-instancji-google-app-engine).

## 9. Tworzenie administratora
1. Zarejestruj użytkownika w aplikacji wdrożonej w chmurze
2. W Google Cloud Console -> Pub/Sub -> Topics, znajdź temat administratora
3. Opublikuj wiadomość z atrybutami:
   - Klucz: `type`, Wartość: `add-admin-role`
   - Klucz: `uid`, Wartość: `UID_UŻYTKOWNIKA`
4. Użytkownik musi wylogować się i zalogować ponownie, aby zmiana roli została zastosowana

## 10. Weryfikacja wdrożenia
1. Otwórz URL aplikacji z logów wdrożenia
2. Zaloguj się i przetestuj podstawowe funkcjonalności
3. Sprawdź logi Cloud Functions w Firebase Console

## 11. Potencjalne problemy
- Jeśli emulatory nie działają, sprawdź czy porty 9099, 8080, 9199, 9000, 5001, 8085 są wolne
- Dla problemów z uwierzytelnianiem, sprawdź konfigurację Firebase w odpowiednich plikach `.env.*` zgodnie z dokumentacją [Konfiguracja zmiennych środowiskowych](./06-environment-variables.md)
- Dla problemów z funkcjami, sprawdź logi w Firebase Console
- Po zmianie roli użytkownika na administratora, wymagane jest wylogowanie i ponowne zalogowanie
- Jeśli pojawia się błąd związany z brakiem instancji Google App Engine podczas wdrażania funkcji, postępuj zgodnie z instrukcjami w [Proces wdrażania - Problem z błędem związanym z brakiem instancji Google App Engine](./07-deployment-process.md#problem-blad-zwiazany-z-brakiem-instancji-google-app-engine)
- Przy pierwszym wdrażaniu Storage, potwierdź utworzenie wymaganej roli IAM, jak opisano w [Konfiguracja usług Firebase - Problem z konfiguracją Storage i rolą IAM](./03-firebase-configuration.md#problem-z-konfiguracja-storage-i-rola-iam)
