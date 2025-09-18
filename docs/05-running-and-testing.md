# Uruchamianie i testowanie

## Spis treści
- [Wymagania wstępne](#wymagania-wstępne)
- [Uruchamianie aplikacji lokalnie](#uruchamianie-aplikacji-lokalnie)
- [Emulatory Firebase](#emulatory-firebase)
- [Strategia testowania](#strategia-testowania)
- [Uruchamianie testów](#uruchamianie-testów)
- [Debugowanie](#debugowanie)
- [Potencjalne problemy i rozwiązania](#potencjalne-problemy-i-rozwiązania)
- [Przydatne linki](#przydatne-linki)

## Wymagania wstępne

1. Upewnij się, że masz skonfigurowane środowisko zgodnie z dokumentem [Konfiguracja środowiska deweloperskiego](./02-dev-environment-setup.md)
2. Upewnij się, że masz skonfigurowany projekt Firebase zgodnie z dokumentem [Konfiguracja usług Firebase](./03-firebase-configuration.md)
3. Upewnij się, że rozumiesz strukturę monorepo zgodnie z dokumentem [Konfiguracja monorepo](./04-monorepo-setup.md)

## Uruchamianie aplikacji lokalnie

### Uruchamianie całego projektu

Aby uruchomić cały projekt lokalnie, wykonaj następującą komendę w głównym katalogu projektu:

```bash
pnpm dev
```

Ta komenda uruchomi wszystkie aplikacje i usługi zdefiniowane w monorepo, korzystając z konfiguracji Turborepo.

### Uruchamianie poszczególnych aplikacji

#### Aplikacja web-app

Aby uruchomić tylko aplikację frontendową:

```bash
pnpm dev --filter web-app
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

#### Funkcje Firebase

Aby uruchomić tylko funkcje Firebase:

```bash
pnpm dev --filter functions
```

Funkcje będą uruchomione lokalnie i dostępne pod adresem [http://localhost:5001](http://localhost:5001).

### Tryby uruchamiania

#### Tryb deweloperski

Domyślny tryb uruchamiania, który oferuje hot-reloading i inne udogodnienia dla developerów.

```bash
pnpm dev
```

#### Tryb produkcyjny

Aby zasymulować środowisko produkcyjne lokalnie:

```bash
pnpm build
pnpm start
```

Ta sekwencja komend zbuduje aplikacje w trybie produkcyjnym, a następnie uruchomi je lokalnie.

## Emulatory Firebase

Firebase oferuje lokalne emulatory usług, które pozwalają na szybsze testowanie bez korzystania z zasobów produkcyjnych.

### Konfiguracja emulatorów

Upewnij się, że masz zainstalowane narzędzie Firebase CLI:

```bash
npm install -g firebase-tools
```

Następnie, zaloguj się do Firebase:

```bash
firebase login
```

### Uruchamianie emulatorów

Aby uruchomić wszystkie emulatory Firebase:

```bash
firebase emulators:start
```

Aby uruchomić konkretne emulatory:

```bash
firebase emulators:start --only functions,firestore,auth,storage
```

Panel kontrolny emulatorów będzie dostępny pod adresem [http://localhost:4000](http://localhost:4000).

### Integracja z aplikacją frontendową

Aplikacja frontendowa jest już skonfigurowana do wykrywania i korzystania z emulatorów Firebase, gdy są one uruchomione. W środowisku deweloperskim emulatory są używane automatycznie, jeśli w pliku `.env.local` ustawiono odpowiednie zmienne:

```
REACT_APP_USE_FIREBASE_EMULATOR=true
REACT_APP_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
REACT_APP_FIREBASE_FIRESTORE_EMULATOR_URL=http://localhost:8080
REACT_APP_FIREBASE_FUNCTIONS_EMULATOR_URL=http://localhost:5001
REACT_APP_FIREBASE_STORAGE_EMULATOR_URL=http://localhost:9199
```

## Strategia testowania

Projekt wykorzystuje wielopoziomową strategię testowania, obejmującą różne rodzaje testów.

### Rodzaje testów w projekcie

- **Testy jednostkowe**: testują pojedyncze funkcje, komponenty i moduły w izolacji.
- **Testy integracyjne**: testują interakcję między różnymi częściami aplikacji.
- **Testy end-to-end (E2E)**: testują cały przepływ aplikacji z perspektywy użytkownika.

### Narzędzia używane do testowania

- **Vitest**: główny framework testowy, używany do testów jednostkowych i integracyjnych.
- **React Testing Library**: narzędzie ułatwiające testowanie komponentów React.
- **MSW (Mock Service Worker)**: do mockowania API w testach integracyjnych.

## Uruchamianie testów

### Uruchamianie wszystkich testów

Aby uruchomić wszystkie testy w projekcie:

```bash
pnpm test
```

### Uruchamianie testów dla konkretnych pakietów

Aby uruchomić testy tylko dla określonego pakietu:

```bash
pnpm test --filter web-app
pnpm test --filter functions
pnpm test --filter shared
```

### Tryb watch w testach

Aby uruchomić testy w trybie watch (automatyczne ponowne uruchamianie po zmianach):

```bash
pnpm test -- --watch
```

## Debugowanie

### Debugowanie aplikacji frontendowej

1. **DevTools przeglądarki**: Naciśnij F12 w przeglądarce, aby otworzyć narzędzia deweloperskie.
2. **React DevTools**: Rozszerzenie dla Chrome i Firefox do debugowania aplikacji React.
3. **Logowanie w konsoli**: Użyj `console.log()`, `console.error()` do wyświetlania informacji debugowania.

### Debugowanie funkcji Firebase

1. **Logi Firebase**: Sprawdź logi w konsoli Firebase lub emulatorze.
2. **Lokalne logi**: Użyj `console.log()` w kodzie funkcji, które będą widoczne w terminalu podczas uruchamiania emulatora.

### Narzędzia do debugowania

- **Firebase Console**: Sprawdzanie stanu usług, logów, konfiguracji.
- **Firebase Emulator UI**: Lokalne narzędzie do monitorowania i debugowania usług Firebase.
- **VS Code Debugger**: Można skonfigurować debugger VS Code do zatrzymywania wykonania kodu i inspekcji zmiennych.

## Potencjalne problemy i rozwiązania

### Typowe problemy z uruchamianiem

1. **Problem**: Aplikacja nie uruchamia się z błędem "Cannot find module".
   **Rozwiązanie**: Uruchom `pnpm install` aby zreinstalować zależności.

2. **Problem**: Konflikt portów.
   **Rozwiązanie**: Zmień port w konfiguracji lub zatrzymaj programy zajmujące port.

### Rozwiązania najczęstszych problemów

1. **Wyczyść cache**: `pnpm clean` lub usuń katalog `.turbo`.
2. **Zrestartuj emulatory**: Zatrzymaj i uruchom ponownie emulatory Firebase.
3. **Sprawdź zmienne środowiskowe**: Upewnij się, że pliki `.env` zawierają poprawne wartości.

## Przydatne linki

- [Dokumentacja Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Dokumentacja Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Przewodnik po debugowaniu React](https://reactjs.org/docs/troubleshooting.html)
