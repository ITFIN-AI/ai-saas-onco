# Konfiguracja środowiska deweloperskiego

## Spis treści
- [Wymagania wstępne](#wymagania-wstępne)
- [Konfiguracja Node.js](#konfiguracja-nodejs)
- [Konfiguracja Firebase](#konfiguracja-firebase)
- [Weryfikacja konfiguracji](#weryfikacja-konfiguracji)

## Wymagania wstępne

Upewnij się, że masz zainstalowane wszystkie wymagane narzędzia zgodnie z dokumentem [Wymagania systemowe](./01-system-requirements.md).

## Konfiguracja Node.js

### Instalacja Node.js przez ASDF (rekomendowane)

1. Zainstaluj plugin Node.js dla ASDF:
```bash
asdf plugin add nodejs
```

2. Zainstaluj Node.js 22.14.0:
```bash
asdf install nodejs 22.14.0
asdf global nodejs 22.14.0
```

3. Zainstaluj globalne narzędzia:
```bash
npm install -g pnpm firebase-tools
```

### Instalacja Node.js przez nvm (alternatywa)

1. Zainstaluj Node.js 22.14.0:
```bash
nvm install 22.14.0
nvm use 22.14.0
```

2. Zainstaluj globalne narzędzia:
```bash
npm install -g pnpm firebase-tools
```

## Konfiguracja Firebase

1. Utwórz nowy projekt w [Firebase Console](https://console.firebase.google.com/):
   - Kliknij "Create a project" / "Get started with a Firebase project"
   - Wprowadź nazwę projektu (tylko małe litery, cyfry i myślniki)
   - Wybierz, czy chcesz włączyć Gemini (opcjonalnie)
   - Wybierz, czy chcesz włączyć Google Analytics (opcjonalnie)
   - Kliknij "Create project"

2. Zaloguj się do Firebase CLI:
```bash
firebase login
```

3. Powiąż projekt z Firebase:
   - Otwórz plik `.firebaserc` w głównym katalogu projektu
   - Znajdź Project ID w Firebase Console:
     1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
     2. Wybierz swój projekt
     3. Kliknij ikonę ustawień (⚙️) obok "Project Overview"
     4. W ustawieniach projektu znajdziesz "Project ID"
   - Zaktualizuj ID projektu dla środowisk develop i production:
```json
{
  "projects": {
    "develop": "twoj-nowy-projekt-id",
    "production": "twoj-nowy-projekt-id-dla-produkcji"
  },
  "targets": {},
  "dataconnectEmulatorConfig": {}
}
```
   > **Uwaga**: Każde środowisko (develop i production) musi mieć swój własny, unikalny Project ID. Używanie tego samego ID dla obu środowisk spowoduje błędy podczas deploymentu. Na początku możesz zostawić pole "production" puste, ale pamiętaj, aby skonfigurować je przed wdrożeniem na środowisko produkcyjne.

## Weryfikacja konfiguracji

1. Sprawdź wersje narzędzi:
```bash
node --version
pnpm --version
firebase --version
```

2. Sprawdź konfigurację Firebase:
```bash
firebase projects:list
```

## Potencjalne problemy i rozwiązania

### Problem z konfiguracją Firebase
- Upewnij się, że masz odpowiednie uprawnienia do projektu Firebase
- Sprawdź, czy jesteś zalogowany do właściwego konta Google

## Przydatne linki
- [ASDF Documentation](https://asdf-vm.com/guide/getting-started.html)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
