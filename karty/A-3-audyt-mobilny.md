# Karta A-3 — audyt mobilny całego serwisu (tylko pomiar, zero zmian w kodzie)

**Projekt:** adamnowak.online
**Data wystawienia:** 7.09.2026
**Charakter:** audyt. **Nie zmieniasz ani jednej linii kodu produkcyjnego.**
**Rozmiar:** duży — przewidziany na długą sesję bez nadzoru

---

## Po co to robimy

Serwis powstał w maju 2026 i od tamtej pory nikt nie zmierzył, jak zachowuje się na wąskim ekranie. Zasadą projektu jest mobile first, ale ta strona nigdy przez taki przegląd nie przeszła.

Ryzyko jest konkretne: **czternaście z piętnastu artykułów zawiera komponenty interaktywne** — wykresy, osie czasu, suwaki, siatki — łącznie ponad dwadzieścia sztuk. Były pisane pod szeroki ekran. Jeśli część z nich rozjeżdża się na telefonie, to nie ma sensu dokładać nowych treści ani sekcji, zanim tego nie wiemy.

Ta karta ma dać **listę defektów z pomiarami**, na podstawie której ustawimy kolejność napraw. Nie naprawiasz ich w tej karcie.

---

## Zakres — co mierzysz

Wszystkie publiczne adresy serwisu:

**Strony stałe (9):**
`/` · `/blog` · `/loyalty-system` · `/about` · `/contact` · `/tools/loyalty-roi-calculator` · `/privacy-policy` · `/work-with-me` · `/newsletter`

**Artykuły (15)** — wszystkie z `src/content/posts`
**Filary (6)** — wszystkie z `src/content/loyalty-system`

Razem **30 adresów**.

### Szerokości

- **390 px** (telefon — odniesienie podstawowe)
- **768 px** (tablet — tylko tam, gdzie 390 i 1440 dają różne układy)
- **1440 px** (desktop — punkt odniesienia, do porównania)

Buduj projekt i mierz na serwerze produkcyjnym lokalnie (`next build` + `next start`), nie w trybie deweloperskim — tryb deweloperski dokłada własne nakładki, które zaburzają pomiar.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu, więc bez zmiennych środowiskowych build się wywróci. To znany stan. Podstaw atrapowe wartości na czas budowania i **nie zmieniaj tych plików**.

---

## Co konkretnie sprawdzasz na każdym adresie

**1. Przepełnienie poziome.** Czy `document.documentElement.scrollWidth` przekracza szerokość okna. Jeśli tak — wskaż **konkretny element**, który je powoduje (selektor, klasa, komponent), i o ile pikseli wystaje. To jest najważniejszy pomiar w całej karcie.

**2. Elementy przekraczające szerokość rodzica.** Wypisz każdy element, którego prostokąt wychodzi poza kontener treści. Osobno oznacz te, które są komponentami z `src/components/blog`, `src/components/article` i `src/components/tools`.

**3. Cele dotykowe.** Każdy odsyłacz, przycisk i pole formularza mniejsze niż **44 × 44 px** przy 390 px. Podaj element, zmierzone wymiary i stronę.

**4. Czytelność tekstu.** Rozmiar czcionki poniżej **14 px** w treści (nie dotyczy etykiet i nadlinii, które z założenia są małe — te oznacz osobno). Podaj zmierzoną wartość.

**5. Obrazy bez wymiarów.** Każdy `<img>` bez jawnych `width`/`height` albo bez `aspect-ratio` — to źródło przeskoków układu przy wczytywaniu.

**6. Tabele i bloki kodu w artykułach.** Czy mają własne przewijanie poziome, czy rozpychają stronę.

**7. Formularze** (`/contact`, formularz opinii w kalkulatorze): czy pola mają rozmiar czcionki co najmniej 16 px — poniżej tej wartości przeglądarki mobilne przybliżają widok przy kliknięciu w pole.

**8. Nawigacja i stopka** przy 390 px: czy menu jest osiągalne, czy nic się nie nakłada.

---

## Osobna sekcja: kalkulator ROI

To jedyne narzędzie na stronie i najważniejszy dowód wykonania w całym serwisie. Sprawdź go dokładniej niż resztę:

- czy wszystkie pola i suwaki da się obsłużyć kciukiem przy 390 px
- czy wyniki są widoczne bez przewijania poziomego
- czy wykresy mieszczą się w szerokości ekranu
- czy przy zmianie wartości układ nie skacze

---

## Czego NIE robisz — warunki zatrzymania

- **NIE naprawiasz niczego.** Ani jednej linii w `src/`. To audyt.
- **NIE zmieniasz treści MDX.**
- **NIE dodajesz zależności do projektu.** Narzędzie do pomiaru instaluj tymczasowo, poza plikami projektu, i nie zostawiaj śladu w `package.json`.
- **NIE zgadujesz wartości.** Każda liczba w raporcie ma pochodzić z pomiaru w przeglądarce (`getBoundingClientRect`, `getComputedStyle`), nie z odczytu CSS w kodzie.
- Jeśli strona nie daje się zmierzyć (błąd wykonania, pusty ekran) — **odnotuj to jako defekt** i idź dalej, nie zatrzymuj całego audytu.

---

## Format raportu

Raport zapisz jako plik `karty/raporty/A-3-audyt-mobilny.md` na gałęzi `karty` i otwórz pull request **na gałąź `karty`**, nie na `main`. To audyt, nie zmiana produktu.

Struktura raportu:

1. **Podsumowanie** — ile adresów zmierzonych, ile z defektami, ile defektów krytycznych.
2. **Tabela zbiorcza** — jeden wiersz na adres: czy jest przepełnienie poziome, ile defektów w każdej kategorii.
3. **Defekty krytyczne** — przepełnienia poziome i nieklikalne elementy, każdy z: adresem, elementem, zmierzoną wartością, prawdopodobną przyczyną w kodzie (plik i linia, jeśli da się wskazać).
4. **Defekty drugorzędne** — reszta, pogrupowana kategoriami.
5. **Komponenty artykułowe** — osobna lista: który z ponad dwudziestu komponentów zachowuje się źle przy 390 px i na ilu stronach występuje. To pozwoli naprawiać u źródła, a nie stronami.
6. **Co jest w porządku** — krótko, żeby wiadomo było, czego nie ruszamy.
7. **Metoda** — czym mierzyłeś, w jakiej przeglądarce, na jakim commicie.

---

## Kryteria odbioru

- Zmierzone **wszystkie 30 adresów** — brak pominięć, każdy w tabeli zbiorczej.
- Każda liczba pochodzi z pomiaru, nie z kodu.
- `git diff` względem `main` pokazuje **wyłącznie nowy plik raportu**. Zero zmian w `src/`.
- Defekty w komponentach zebrane raz, z listą stron, na których występują — a nie powtórzone przy każdej stronie osobno.
