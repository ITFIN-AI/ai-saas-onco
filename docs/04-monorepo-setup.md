# Konfiguracja monorepo

## Spis treści
- [Wymagania wstępne](#wymagania-wstępne)
- [Struktura projektu](#struktura-projektu)
- [Zarządzanie zależnościami](#zarządzanie-zależnościami)
- [Konfiguracja Workspace](#konfiguracja-workspace)
- [System budowania (Turbo)](#system-budowania-turbo)
- [Konwencje nazewnictwa](#konwencje-nazewnictwa)

## Wymagania wstępne

1. Upewnij się, że masz skonfigurowane środowisko zgodnie z dokumentem [Konfiguracja środowiska deweloperskiego](./02-dev-environment-setup.md)
2. Upewnij się, że masz skonfigurowany projekt Firebase zgodnie z dokumentem [Konfiguracja usług Firebase](./03-firebase-configuration.md)

## Struktura projektu

Projekt jest zorganizowany jako monorepo, co oznacza, że wszystkie powiązane pakiety i aplikacje znajdują się w jednym repozytorium. Główne katalogi to:

- `apps/` - zawiera aplikacje końcowe:
  - `web-app/` - aplikacja frontendowa React
  - `functions/` - Cloud Functions dla Firebase
- `packages/` - zawiera współdzielone biblioteki i komponenty:
  - `shared/` - pakiet ze współdzielonym kodem
- `scripts/` - zawiera skrypty pomocnicze dla projektu
- `docs/` - zawiera dokumentację projektu

Rzeczywista struktura głównych katalogów:

```
akademiasaas-starter/
├── apps/
│   ├── web-app/       # Aplikacja frontendowa (React)
│   └── functions/     # Cloud Functions (Firebase)
├── packages/
│   └── shared/        # Współdzielony kod i komponenty
├── scripts/           # Skrypty pomocnicze (np. copyEnvFile.sh)
├── docs/              # Dokumentacja projektu
├── .turbo/            # Katalog tymczasowy dla Turborepo
├── package.json       # Główny plik package.json dla monorepo
├── pnpm-workspace.yaml # Konfiguracja workspace dla pnpm
├── turbo.json         # Konfiguracja Turborepo
├── firebase.json      # Konfiguracja Firebase
├── firestore.rules    # Reguły dla Firestore
├── storage.rules      # Reguły dla Firebase Storage
└── .firebaserc        # Konfiguracja projektu Firebase
```

Pakiet `packages/shared/` ma następującą strukturę:

```
shared/
├── src/              # Kod źródłowy
├── lib/              # Skompilowany kod (generowany)
├── package.json      # Konfiguracja pakietu
├── tsconfig.json     # Konfiguracja TypeScript
└── vitest.config.ts  # Konfiguracja testów
```

## Zarządzanie zależnościami

Projekt wykorzystuje `pnpm` do zarządzania zależnościami. Dzięki temu możemy efektywnie współdzielić zależności między pakietami i aplikacjami.

### Instalacja zależności

Aby zainstalować wszystkie zależności projektu, w głównym katalogu wykonaj:

```bash
# Instalacja zależności dla całego monorepo
pnpm install
```

Aby dodać nową zależność do konkretnego pakietu:

```bash
# Instalacja konkretnej zależności w określonym pakiecie
pnpm add <package> --filter <workspace-name>

# Przykład: Dodanie zależności lodash do aplikacji web-app
pnpm add lodash --filter web-app

# Przykład: Dodanie zależności deweloperskiej do aplikacji web-app
pnpm add @types/lodash -D --filter web-app

# Przykład: Dodanie zależności do głównego package.json (root)
pnpm add typescript -w
```

### Zależności wewnętrzne

Pakiety mogą zależeć od siebie nawzajem. Na przykład, aplikacja frontendowa (`apps/web-app`) może zależeć od pakietu shared (`packages/shared`).

W pliku `package.json` aplikacji web-app:

```json
{
  "dependencies": {
    "@akademiasaas/shared": "workspace:*"
  }
}
```

## Konfiguracja Workspace

Plik `pnpm-workspace.yaml` definiuje, które katalogi są częścią workspace'a:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## System budowania (Turbo)

Projekt wykorzystuje Turborepo do optymalizacji procesu budowania. Konfiguracja znajduje się w pliku `turbo.json` w głównym katalogu projektu.

Turbo pozwala na efektywne zarządzanie zadaniami w monorepo, umożliwiając równoległe wykonywanie zadań i korzystanie z cache'owania wyników.

### Uruchamianie zadań

```bash
# Uruchomienie zadania build dla wszystkich pakietów
pnpm build

# Uruchomienie aplikacji w trybie deweloperskim
pnpm dev

# Uruchomienie testów dla aplikacji web-app
pnpm test --filter web-app

# Uruchomienie zadania lint dla wszystkich pakietów
pnpm lint

# Sprawdzenie typów TypeScript
pnpm check-types

# Czyszczenie plików tymczasowych i wygenerowanych
pnpm clean
```

## Przydatne linki
- [Dokumentacja pnpm Workspaces](https://pnpm.io/workspaces)
- [Dokumentacja Turborepo](https://turbo.build/repo/docs)
- [Przewodnik po monorepo](https://monorepo.tools/)
- [Typescript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
