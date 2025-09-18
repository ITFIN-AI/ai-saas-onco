# Proces wdrażania aplikacji

## Spis treści
- [Wymagania wstępne](#wymagania-wstępne)
- [Konfiguracja pliku .firebaserc](#konfiguracja-pliku-firebaserc)
- [Wdrażanie manualne](#wdrażanie-manualne)
  - [Wdrażanie do środowiska deweloperskiego](#wdrażanie-do-środowiska-deweloperskiego)
  - [Wdrażanie do środowiska produkcyjnego](#wdrażanie-do-środowiska-produkcyjnego)
- [Wdrażanie poszczególnych komponentów](#wdrażanie-poszczególnych-komponentów)
  - [Wdrażanie całości projektu](#wdrażanie-całości-projektu)
  - [Aplikacja frontendowa](#aplikacja-frontendowa)
  - [Cloud Functions](#cloud-functions)
  - [Security Rules i Firestore Indexes](#security-rules-i-firestore-indexes)
- [Łączenie komponentów w jednym wdrożeniu](#łączenie-komponentów-w-jednym-wdrożeniu)
- [Weryfikacja wdrożenia](#weryfikacja-wdrożenia)
- [Rollback wdrożenia](#rollback-wdrożenia)
- [Potencjalne problemy i rozwiązania](#potencjalne-problemy-i-rozwiązania)
- [Przydatne linki](#przydatne-linki)

## Wymagania wstępne

1. Upewnij się, że masz skonfigurowane środowisko zgodnie z dokumentem [Konfiguracja środowiska deweloperskiego](./02-dev-environment-setup.md)
2. Upewnij się, że masz skonfigurowany projekt Firebase zgodnie z dokumentem [Konfiguracja usług Firebase](./03-firebase-configuration.md)
3. Upewnij się, że rozumiesz strukturę monorepo zgodnie z dokumentem [Konfiguracja monorepo](./04-monorepo-setup.md)
4. Upewnij się, że masz prawidłowo skonfigurowane zmienne środowiskowe zgodnie z dokumentem [Konfiguracja zmiennych środowiskowych](./06-environment-variables.md)

## Konfiguracja pliku .firebaserc

Plik `.firebaserc` jest kluczowy dla prawidłowego wdrażania aplikacji, ponieważ definiuje identyfikatory projektów Firebase dla różnych środowisk. Przed rozpoczęciem procesu wdrażania, upewnij się, że plik ten jest poprawnie skonfigurowany:

1. Otwórz plik `.firebaserc` w głównym katalogu projektu
2. Upewnij się, że zawiera poprawne identyfikatory projektów dla środowisk deweloperskiego i produkcyjnego:

   ```json
   {
     "projects": {
       "develop": "twoj-projekt-dev",
       "production": "twoj-projekt-prod"
     }
   }
   ```

3. Zastąp `twoj-projekt-dev` i `twoj-projekt-prod` rzeczywistymi identyfikatorami twoich projektów Firebase
4. Jeśli pracujesz z nowym projektem, możesz użyć polecenia:
   ```bash
   firebase use --add
   ```
   aby dodać nowe środowisko i powiązać je z identyfikatorem projektu Firebase.

5. Aby sprawdzić, który projekt jest aktualnie ustawiony jako aktywny:
   ```bash
   firebase use
   ```

6. Aby przełączyć się na konkretne środowisko:
   ```bash
   firebase use develop
   # lub
   firebase use production
   ```

> **Uwaga**: Prawidłowa konfiguracja pliku `.firebaserc` jest niezbędna do upewnienia się, że wdrażasz do właściwego środowiska.

## Wdrażanie manualne

### Wdrażanie do środowiska deweloperskiego

1. Upewnij się, że masz najnowszą wersję kodu z gałęzi `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Zainstaluj zależności:
   ```bash
   pnpm install
   ```

3. Przygotuj zmienne środowiskowe dla środowiska deweloperskiego:
   - Upewnij się, że pliki `.env.develop` istnieją w odpowiednich katalogach:
     - `apps/web-app/.env.develop`
     - `apps/functions/.env.develop`

4. Wybierz projekt deweloperski:
   ```bash
   npx firebase use develop
   ```

5. Wdróż całość projektu lub poszczególne komponenty:
   ```bash
   # Wdrażanie całości projektu
   npx firebase deploy

   # Lub wdrażanie poszczególnych komponentów (szczegóły w sekcji "Wdrażanie poszczególnych komponentów")
   ```

   > **Uwaga**: Firebase automatycznie zbuduje aplikację web-app przed wdrożeniem dzięki konfiguracji hooka `predeploy` w pliku `firebase.json`.

6. Po zakończeniu procesu, otrzymasz URL do wdrożonej aplikacji, np:
   ```
   ✔ Deploy complete!

   Project Console: https://console.firebase.google.com/project/twoj-projekt-dev/overview
   Hosting URL: https://twoj-projekt-dev.web.app
   ```

### Wdrażanie do środowiska produkcyjnego

Proces wdrażania do środowiska produkcyjnego jest podobny, ale wymaga dodatkowej ostrożności:

1. Upewnij się, że masz najnowszą wersję kodu z gałęzi `main`:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Zainstaluj zależności:
   ```bash
   pnpm install
   ```

3. Przygotuj zmienne środowiskowe dla środowiska produkcyjnego:
   - Upewnij się, że pliki `.env.production` istnieją w odpowiednich katalogach:
     - `apps/web-app/.env.production`
     - `apps/functions/.env.production`

4. Wybierz projekt produkcyjny:
   ```bash
   npx firebase use production
   ```

5. Wdróż całość projektu lub poszczególne komponenty:
   ```bash
   # Wdrażanie całości projektu
   npx firebase deploy

   # Lub wdrażanie poszczególnych komponentów (szczegóły w sekcji "Wdrażanie poszczególnych komponentów")
   ```

   > **Uwaga**: Firebase automatycznie zbuduje aplikację web-app przed wdrożeniem, używając zmiennych środowiskowych produkcyjnych.

6. **Ważne**: Po wdrożeniu, przeprowadź dokładne testy weryfikacyjne w środowisku produkcyjnym.

> **Uwaga**: Wdrażanie do środowiska produkcyjnego powinno odbywać się tylko po dokładnym przetestowaniu zmian w środowisku deweloperskim.

## Wdrażanie poszczególnych komponentów

### Wdrażanie całości projektu

Komenda `firebase deploy` bez dodatkowych parametrów wdraża wszystkie komponenty zdefiniowane w pliku `firebase.json`, w tym:
- Hosting (automatycznie budując aplikację dzięki hookowi predeploy)
- Cloud Functions
- Firestore Rules
- Firestore Indexes
- Storage Rules
- i inne skonfigurowane zasoby

```bash
# Po wybraniu odpowiedniego projektu:
npx firebase deploy
```

### Aplikacja frontendowa

Aby wdrożyć tylko aplikację frontendową (Firebase Hosting):

1. Wybierz projekt zgodnie z krokami 1-4 z sekcji "Wdrażanie manualne"
2. Wdróż tylko hosting:
   ```bash
   npx firebase deploy --only hosting
   ```

   > **Uwaga**: Dzięki hookowi predeploy, aplikacja zostanie automatycznie zbudowana przed wdrożeniem.

Możesz również wdrożyć określoną docelową konfigurację hostingu, jeśli masz ich więcej:

```bash
npx firebase deploy --only hosting:nazwa-targetu
```

### Cloud Functions

Aby wdrożyć tylko Cloud Functions:

1. Wybierz projekt zgodnie z krokami 1-4 z sekcji "Wdrażanie manualne"
2. Wdróż tylko funkcje:
   ```bash
   npx firebase deploy --only functions
   ```

Możesz również wdrożyć tylko określoną funkcję lub grupę funkcji:

```bash
# Wdrażanie konkretnej funkcji
npx firebase deploy --only functions:nazwaFunkcji

# Wdrażanie funkcji z określonego katalogu lub grupy
npx firebase deploy --only functions:grupa1,functions:grupa2
```

### Security Rules i Firestore Indexes

Aby wdrożyć tylko reguły bezpieczeństwa i indeksy Firestore:

```bash
# Wdrażanie tylko reguł Firestore
npx firebase deploy --only firestore:rules

# Wdrażanie tylko indeksów Firestore
npx firebase deploy --only firestore:indexes

# Wdrażanie zarówno reguł jak i indeksów
npx firebase deploy --only firestore
```

## Łączenie komponentów w jednym wdrożeniu

Możesz łączyć wiele komponentów w jednej komendzie wdrożeniowej, co jest przydatne gdy potrzebujesz wdrożyć kilka powiązanych ze sobą części, ale nie cały projekt:

```bash
# Wdrażanie Functions i Hosting jednocześnie
npx firebase deploy --only functions,hosting

# Wdrażanie reguł Firestore i Storage
npx firebase deploy --only firestore:rules,storage

# Wdrażanie wszystkich reguł bezpieczeństwa
npx firebase deploy --only firestore:rules,storage,database
```

## Weryfikacja wdrożenia

Po zakończeniu wdrażania, należy przeprowadzić weryfikację:

1. Sprawdź czy aplikacja jest dostępna pod adresem URL Hosting
2. Zaloguj się do aplikacji i sprawdź podstawowe funkcjonalności
3. Sprawdź konsolę deweloperską przeglądarki pod kątem błędów
4. Sprawdź logi Cloud Functions w Firebase Console
5. Przeprowadź testy na różnych urządzeniach i przeglądarkach

## Rollback wdrożenia

W przypadku problemów po wdrożeniu, możesz wykonać rollback:

### Rollback aplikacji frontendowej

1. W Firebase Console, przejdź do Hosting -> twoja-aplikacja
2. W zakładce "Releases" znajdź poprzednią wersję
3. Kliknij trzy kropki obok tej wersji i wybierz "Rollback"

### Rollback Cloud Functions

```bash
# Znajdź identyfikator poprzedniej wersji
npx firebase functions:list

# Wykonaj rollback
npx firebase functions:rollback <FUNCTION_NAME> <VERSION_ID>
```

## Potencjalne problemy i rozwiązania

### Problem: Błąd "Error: Error parsing triggers"
- **Przyczyna**: Błąd składni w kodzie Cloud Functions.
- **Rozwiązanie**: Sprawdź logi błędów, popraw kod i spróbuj ponownie.

### Problem: Błąd "Error: HTTP Error: 403, The caller does not have permission"
- **Przyczyna**: Brak wystarczających uprawnień.
- **Rozwiązanie**: Upewnij się, że jesteś zalogowany na konto z odpowiednimi uprawnieniami.

### Problem: Prośba o potwierdzenie utworzenia roli IAM {#problem-prosba-o-potwierdzenie-utworzenia-roli-iam}
- **Przyczyna**: Firebase Storage wymaga specjalnej roli IAM do korzystania z reguł cross-service.
- **Rozwiązanie**: Gdy pojawi się komunikat `Cloud Storage for Firebase needs an IAM Role to use cross-service rules. Grant the new role? (Y/n)`, wprowadź `Y` i naciśnij Enter, aby zatwierdzić utworzenie roli. Jest to jednorazowa operacja wymagana do prawidłowego działania reguł Storage.

### Problem: Błąd związany z brakiem instancji Google App Engine {#problem-blad-zwiazany-z-brakiem-instancji-google-app-engine}
- **Przyczyna**: Firebase Functions wymaga utworzonej instancji Google App Engine w tym samym regionie.
- **Rozwiązanie**: Postępuj zgodnie z instrukcjami zawartymi w kroku 5 sekcji [Cloud Functions w dokumentacji konfiguracji Firebase](./03-firebase-configuration.md#cloud-functions). Po utworzeniu aplikacji App Engine, spróbuj ponownie wdrożyć funkcje.

### Problem: Błędy wdrażania zmiennych środowiskowych
- **Przyczyna**: Nieprawidłowe zmienne środowiskowe.
- **Rozwiązanie**: Sprawdź pliki `.env.*` i upewnij się, że zawierają wszystkie wymagane zmienne.

### Problem: Błędy podczas budowania aplikacji
- **Przyczyna**: Błędy w kodzie lub niekompatybilne zależności.
- **Rozwiązanie**: Sprawdź logi błędów i rozwiąż problemy w kodzie źródłowym.

## Przydatne linki

- [Dokumentacja Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Dokumentacja Firebase Functions](https://firebase.google.com/docs/functions)
- [Zarządzanie wieloma środowiskami w Firebase](https://firebase.google.com/docs/projects/multiprojects)
