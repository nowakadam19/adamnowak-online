# Karta A-5 — przebudowa hero strony głównej (mobile first) + korekta „twenty years”

**Projekt:** adamnowak.online
**Data wystawienia:** 8.09.2026
**Gałąź robocza:** odbij od aktualnego `main`
**Podstawa projektowa:** makieta mobilna uzgodniona z Adamem 8.09 — brzmienia w tej karcie są wiążące i podane dosłownie

---

## Po co to robimy

Pierwszy ekran strony głównej nie odpowiada na żadne z trzech pytań, które musi obsłużyć strona wejścia: **gdzie jestem, czego się ode mnie oczekuje, co mam zrobić.**

Dziś: około 400 px pustki nad treścią, nadlinia brzmiąca jak nazwa produktu, nagłówek stawiający obietnicę bez pokrycia, dwa równorzędne przyciski powtarzające menu. Brak zdjęcia, brak jakiegokolwiek dowodu wiarygodności. Dane z Vercela pokazują sześć wejść na stronę główną i zero kliknięć dalej.

Przy okazji poprawiamy **liczbę lat** — w serwisie stoi „fifteen”, a prawidłowa wartość to **twenty**. Piętnaście to okres pracy w IKEA, nie cały staż w dziedzinie.

---

## Zakres

Cztery obszary. Wszystkie zmiany **mobile first** — układ telefonu projektujemy pierwszy, desktop dostosowujemy na końcu.

### 1. Hero strony głównej — `src/app/page.tsx`

**Usuwamy:**
- pustkę nad treścią (dziś ~400 px odstępu górnego)
- nadlinię `CUSTOMER LOYALTY INTELLIGENCE`
- dwa równorzędne przyciski `Blog →` / `Loyalty System →`

**Wstawiamy, w tej kolejności od góry:**

**a) Podpis autorski** — zdjęcie `/adam-nowak.jpg` w kółku 56 px, obok niego w kolumnie:
- nazwisko `Adam Nowak` krojem szeryfowym, kursywą, ~21 px
- kwalifikacja, dwa wiersze, kolorem `var(--muted)`, ~12,5 px:

> Twenty years in loyalty.
> Poland, Sweden, the UK — the last two in global roles.

**b) Nagłówek H1 + lead** — rotowany, trzy warianty (patrz sekcja 2).

**c) Akcja główna** — przycisk do `/blog`, wysokość min. 52 px, tło `var(--green)`, tekst biały, krój `var(--font-display)`, 12 px, wersaliki, `letter-spacing: 0.1em`:

> Read the writing →

**d) Odesłanie drugiego poziomu** — odsyłacz do `/loyalty-system`, obszar klikalny min. 44 px, tekst ~13,5 px w `var(--muted)`, z podkreśleniem tylko pod nazwą:

> Or see the six-part Loyalty System

**Budżet: sześć elementów. Nic ponad powyższe.** Bez formularza, bez telefonu, bez newslettera, bez plakietek, bez liczników.

### 2. Rotacja nagłówka — mechanizm

Trzy warianty bloku H1 + lead, **rotowane deterministycznie po dacie** — ten sam wariant dla wszystkich odwiedzających przez cały dzień UTC, wybierany po stronie serwera.

**Nie losujemy po stronie klienta.** Migotanie przy wczytaniu i niestabilny nagłówek dla wyszukiwarki są wykluczone.

Warianty rotują wyłącznie w obrębie H1 i leadu. Podpis autorski, przycisk i odesłanie są stałe.

**Wariant 1 — MOŻLIWOŚĆ**
> H1: Twenty years taught me where customer loyalty breaks. New tools mean it doesn't have to.
>
> Lead: Writing on loyalty, CRM and customer marketing — plus the tools I build along the way.

**Wariant 2 — WYKONALNOŚĆ**
> H1: Most of what customer teams want isn't impossible. It's just unbuilt.
>
> Lead: Writing and working tools on loyalty, CRM and customer marketing — for people who want it built, not debated.

**Wariant 3 — METODA**
> H1: Every loyalty problem breaks down into time, money and decisions. I write about telling them apart.
>
> Lead: Loyalty, CRM and customer marketing — for practitioners who want clarity, not complexity.

Warianty trzymaj w jednym miejscu w kodzie, jako tablicę — dopisanie czwartego ma być zmianą jednej linii danych, nie przebudową.

**Akcent kolorystyczny:** w każdym H1 jeden fragment krojem szeryfowym kursywą w `var(--green)` — odpowiednio: `customer loyalty breaks`, `isn't impossible`, `time, money and decisions`. Reszta nagłówka w kolorze `var(--ink)`.

### 3. Korekta liczby lat — trzy miejsca

Wszędzie, gdzie w serwisie stoi „fifteen years" / „15+ years", ma być **twenty / 20+**:

- `src/app/page.tsx` — hero (obsłużone wyżej)
- `src/app/about/AboutClient.tsx` — sprawdź wszystkie wystąpienia
- dane strukturalne (`Person` / opis w metadanych) — sprawdź `layout.tsx` i pliki metadanych

**Przeszukaj całe `src/` i `public/`** pod kątem „fifteen" i „15+" i wypisz w raporcie każde znalezione wystąpienie wraz z decyzją, czy je zmieniasz.

### 4. Blok autora pod artykułami — `src/app/blog/[slug]/page.tsx`

Wszedł kartą A-2 i jest do przepisania z dwóch powodów: mówi „Fifteen years" i jest retrospektywny, a strona ma patrzeć naprzód.

**Nowe brzmienie, wiążące:**

> **Adam Nowak**
>
> Twenty years in loyalty — Poland, Sweden and the UK, the last two in global roles. I write about what breaks in customer loyalty, and build the tools that show it in numbers.

Reszta bloku — układ, style, odsyłacz `More about me →` — bez zmian.

---

## Czego NIE robisz — warunki zatrzymania

- **NIE projektujesz desktopu od nowa.** Mobile jest źródłem; na desktopie hero ma pozostać spójne z dzisiejszą kompozycją strony, tylko z nową treścią.
- **NIE dodajesz nowych kolorów, krojów ani zmiennych CSS.** Wyłącznie tokeny z `globals.css`.
- **NIE ruszasz sekcji poniżej hero** na stronie głównej.
- **NIE zmieniasz nawigacji ani stopki.**
- **NIE dokładasz żadnego elementu ponad wymienione sześć.**
- **NIE zmieniasz treści artykułów ani filarów.**
- Jeśli kadr zdjęcia w kółku 56 px wygląda źle (ucięta głowa, zła oś) — **zgłoś to w raporcie**, nie kombinuj z kadrowaniem na siłę.

---

## Kryteria odbioru

Pomiary w przeglądarce na buildzie produkcyjnym, tą samą metodą co audyt A-3.

1. **Wysokość hero przy 390 px dla każdego z trzech wariantów** — różnica między najwyższym a najniższym **nie większa niż 24 px**. To warunek, żeby strona nie skakała między dniami. Podaj trzy zmierzone wartości.
2. **Wszystkie sześć elementów mieści się nad linią zgięcia przy 390 × 844 px.** Podaj pozycję dolnej krawędzi odsyłacza do Loyalty System.
3. **Przycisk główny ≥ 52 px wysokości, odsyłacz drugiego poziomu ≥ 44 px.** Zmierzone.
4. **Rotacja jest deterministyczna:** ten sam wariant przy trzech kolejnych wczytaniach tej samej doby. Pokaż dowód — trzykrotny odczyt H1 z wyrenderowanego HTML.
5. **Brak przepełnienia poziomego** przy 390 px dla każdego z trzech wariantów.
6. **Zero wystąpień „fifteen" i „15+"** w `src/` po zmianie. Podaj wynik wyszukiwania.
7. **Blok autora** na wszystkich piętnastu artykułach zawiera nowe brzmienie — policz wystąpienia frazy `Twenty years in loyalty` w zbudowanym wyjściu, ma być 15.
8. **Kontrola regresji:** żadna z 30 stron nie zyskała przepełnienia poziomego przy 390 px.
9. **Wynik budowania** bez błędów.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu. Podstaw atrapowe wartości zmiennych i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
