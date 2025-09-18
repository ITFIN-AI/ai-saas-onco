# Wymagania systemowe

## Spis treści
- [Wymagania systemowe](#wymagania-systemowe)
- [Wymagane narzędzia](#wymagane-narzędzia)
- [Opcjonalne narzędzia](#opcjonalne-narzędzia)
- [Weryfikacja wymagań](#weryfikacja-wymagań)

## Wymagania systemowe

- Aktualny system MacOS / Linux lub Windows z WSL

> **Uwaga dla użytkowników Windows**: Zalecamy korzystanie z Windows Subsystem for Linux (WSL) w celu zapewnienia pełnej kompatybilności z narzędziami używanymi w projekcie. WSL pozwala na uruchomienie środowiska Linux bezpośrednio w systemie Windows. Instrukcje instalacji WSL można znaleźć na stronie [Microsoft Learn](https://learn.microsoft.com/pl-pl/windows/wsl/install).


### Oprogramowanie
- Node.js 22
- pnpm 10.4.1
- Firebase CLI 13.25.0
- Git
- Java 11+ (w celu uruchomienia emulatorów)

## Wymagane narzędzia

### Node.js i pnpm
1. Pobierz i zainstaluj Node.js 22.x ze strony [nodejs.org](https://nodejs.org/)
2. Zainstaluj pnpm globalnie:
```bash
npm install -g pnpm
```

### Git
1. Pobierz i zainstaluj Git ze strony [git-scm.com](https://git-scm.com/)
2. Skonfiguruj podstawowe ustawienia:
```bash
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.com"
```

### Firebase CLI
1. Zainstaluj Firebase CLI globalnie:
```bash
npm install -g firebase-tools
```
2. Zaloguj się do Firebase:
```bash
firebase login
```

## Opcjonalne narzędzia

### Stripe CLI
- Przydatne do testowania integracji z płatnościami
- Pobierz ze strony [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### Docker
- Przydatne do izolowanego środowiska deweloperskiego
- Pobierz ze strony [docker.com](https://www.docker.com/products/docker-desktop)

## Weryfikacja wymagań

### Sprawdzenie wersji Node.js
```bash
node --version
```

### Sprawdzenie wersji pnpm
```bash
pnpm --version
```

### Sprawdzenie wersji Firebase CLI
```bash
firebase --version
```

## Potencjalne problemy i rozwiązania

### Problem z pamięcią
- Jeśli aplikacja działa wolno lub występują problemy z pamięcią, zwiększ limit pamięci dla Node.js:
```bash
export NODE_OPTIONS=--max-old-space-size=8192
```

### Problem z uprawnieniami
- Na systemach Unix/Linux może być wymagane użycie `sudo` do instalacji globalnych pakietów
- Upewnij się, że masz odpowiednie uprawnienia do katalogów projektu

### Problem z polityką wykonywania skryptów w PowerShell (Windows)
Jeśli podczas instalacji pnpm lub innych pakietów globalnych w PowerShell widzisz błąd związany z zablokowanym uruchamień skryptów, np:
```
npm install -g pnpm
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
```

1. Otwórz PowerShell jako administrator
2. Wykonaj polecenie:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```
3. Potwierdź zmianę i spróbuj ponownie zainstalować pakiety

### Problem z wersjami Node.js
- Użyj nvm (Node Version Manager) lub ASDF do zarządzania różnymi wersjami Node.js
- ASDF jest rekomendowaną alternatywą dla nvm, ponieważ obsługuje wiele różnych narzędzi
- Instrukcje instalacji:
  - nvm: [github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
  - ASDF: [asdf-vm.com](https://asdf-vm.com/)

## Przydatne linki
- [Node.js Documentation](https://nodejs.org/docs/)
- [pnpm Documentation](https://pnpm.io/docs)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Git Documentation](https://git-scm.com/doc)
