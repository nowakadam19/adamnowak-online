# Raport A-3 — audyt mobilny całego serwisu

**Projekt:** adamnowak.online
**Data:** 7.09.2026
**Commit mierzony:** `5c43152a87b0cd61a093a09a5282f494f1a5aea4` (`main` — zawiera scalone A-1 i A-2)
**Charakter:** audyt pomiarowy. Zero zmian w kodzie produkcyjnym.

Wszystkie liczby w tym raporcie pochodzą z pomiaru w przeglądarce (`getBoundingClientRect`, `getComputedStyle`) na produkcyjnym buildzie, nie z odczytu CSS w kodzie. Odniesienia do plików i linii wskazują jedynie **prawdopodobną przyczynę** zmierzonego zachowania.

---

## 1. Podsumowanie

- **Zmierzono: 30 / 30 adresów** (9 stałych, 15 artykułów, 6 filarów), każdy przy 390 px, 768 px i 1440 px. Brak pominięć, zero błędów wykonania.
- **Adresy z przepełnieniem poziomym: 1** — `/blog/the-enrollment-trap` (jedyny defekt krytyczny układu).
- **Pozostałe 29 adresów nie mają przepełnienia poziomego** przy żadnej z trzech szerokości.
- **Defekty systemowe (na wszystkich 30 stronach)** wynikają z trzech współdzielonych komponentów — `Header`, `Footer`, `CookieConsent` — i to one dają największą dźwignię naprawy.
- **Kalkulator ROI** nie ma przepełnienia ani skoków układu przy interakcji, ale ma najgęstsze skupisko drobnych celów dotykowych i pól < 16 px na całej stronie.

**Klasyfikacja defektów:**

| Poziom | Liczba wystąpień | Zasięg |
|---|---|---|
| Krytyczne (przepełnienie poziome) | 1 adres | `/blog/the-enrollment-trap` |
| Krytyczne (kluczowy cel dotykowy < 44 px) | 1 kontrolka | hamburger nawigacji, wszystkie 30 stron |
| Drugorzędne — cele dotykowe < 44 px | systemowe | stopka/menu/cookies na 30 stronach + kontrolki narzędzi |
| Drugorzędne — pola formularzy < 16 px | 3 obszary | kalkulator ROI, `/contact`, suwaki w artykułach |
| Drugorzędne — tekst treści < 14 px | systemowe | stopka + etykiety w komponentach diagramowych |
| Obrazy bez wymiarów | **0** | — |

---

## 2. Tabela zbiorcza

Kolumny: **Overflow 390** = przepełnienie poziome przy 390 px; **Cele < 44** = samodzielne kontrolki (poza linkami w akapitach) mniejsze niż 44 px w co najmniej jednym wymiarze; **Tekst < 14** = elementy tekstu treści < 14 px (w tym etykiety w diagramach; ~3 na każdej stronie to stała stopka + baner cookies); **Pola < 16** = pola tekstowe/liczbowe/textarea z czcionką < 16 px (ryzyko przybliżenia na iOS). 768 px i 1440 px: **brak przepełnienia na wszystkich 30 adresach**, dlatego bez osobnych kolumn.

### Strony stałe (9)

| Adres | Overflow 390 | Cele < 44 | Tekst < 14 | Pola < 16 |
|---|---|---|---|---|
| `/` | nie | 12 | 3 | 0 |
| `/blog` | nie | 9 | 3 | 0 |
| `/loyalty-system` | nie | 9 | 3 | 0 |
| `/about` | nie | 18 | 2 | 0 |
| `/contact` | nie | 10 | 3 | 3 (formularz, po interakcji) |
| `/tools/loyalty-roi-calculator` | nie | 34 | 26 | 14 |
| `/privacy-policy` | nie | 9 | 3 | 0 |
| `/work-with-me` | nie | 9 | 3 | 0 |
| `/newsletter` | nie | 9 | 3 | 0 |

### Artykuły (15)

| Adres | Overflow 390 | Cele < 44 | Tekst < 14 | Pola < 16 |
|---|---|---|---|---|
| `/blog/the-enrollment-trap` | **TAK +312 px** | 15 | 24 | 3 (suwaki) |
| `/blog/brand-intimacy--why-duolingo-s-guilt-works--others-don-t` | nie | 12 | 17 | 0 |
| `/blog/how-to-build-a-crm-content-calendar-that-starts-with-the-customer` | nie | 12 | 3 | 0 |
| `/blog/its-never-about-you-its-always-about-them` | nie | 12 | 3 | 0 |
| `/blog/last-customer-interaction-is-worth-more-than-your-next-ad-campaign` | nie | 12 | 7 | 0 |
| `/blog/launching-a-loyalty-program-is-easy-closing-it-is-suicide` | nie | 12 | 34 | 0 |
| `/blog/one-scenario-is-not-a-plan` | nie | 12 | 4 | 0 |
| `/blog/the-72-hour-window` | nie | 12 | 23 | 0 |
| `/blog/the-crm-breakthrough-formula` | nie | 12 | 12 | 0 |
| `/blog/the-customer-is-always-right-your-program-chose-one` | nie | 12 | 3 | 0 |
| `/blog/the-funnel-inside-the-program` | nie | 16 | 30 | 3 (suwaki) |
| `/blog/the-personalization-paradox` | nie | 12 | 16 | 0 |
| `/blog/the-t6-legal-audit-every-loyalty-launch-needs` | nie | 12 | 13 | 0 |
| `/blog/value-exchange--turn-customers-into-growth-partners` | nie | 12 | 9 | 0 |
| `/blog/why-points-feel-like-nothing` | nie | 14 | 27 | 1 (suwak) |

### Filary (6)

| Adres | Overflow 390 | Cele < 44 | Tekst < 14 | Pola < 16 |
|---|---|---|---|---|
| `/loyalty-system/give-before-you-ask` | nie | 11 | 3 | 0 |
| `/loyalty-system/know-who-youre-talking-to` | nie | 12 | 3 | 0 |
| `/loyalty-system/make-data-everyones-job` | nie | 12 | 3 | 0 |
| `/loyalty-system/prove-it-pays` | nie | 11 | 8 | 0 |
| `/loyalty-system/start-with-people-not-products` | nie | 11 | 3 | 0 |
| `/loyalty-system/your-best-customers-are-already-here` | nie | 13 | 3 | 0 |

---

## 3. Defekty krytyczne

### K-1. Przepełnienie poziome +312 px na `/blog/the-enrollment-trap` (390 px)

- **Zmierzone:** `document.documentElement.scrollWidth = 702 px` przy oknie 390 px → **312 px przepełnienia**. Strona przewija się w bok.
- **Element powodujący:** wiersz `div.flex.flex-nowrap.gap-4` zawierający dwie etykiety `label.flex.items-center.gap-2`, każda z polem `input.w-24` (zmierzone 96 px) i wartością `span.min-w-[32px]`. Przy 390 px druga etykieta kończy się na `right = 702 px` (wystaje 312 px), pole `input` wystaje 272 px.
- **Prawdopodobna przyczyna w kodzie:** `src/components/blog/EnrollmentQualityIndex.tsx:25` — kontener `className="flex flex-nowrap gap-4 …"`. `flex-nowrap` zakazuje zawijania, a dwa pola `w-24` (linie **39** i **48**) plus etykiety i odstępy przekraczają szerokość telefonu. Przy 768 px ten sam wiersz się mieści (brak przepełnienia), więc defekt jest wyłącznie mobilny (poniżej ~750 px).
- **Komponent:** `EnrollmentQualityIndex` (występuje na 1 stronie).

### K-2. Główna kontrolka nawigacji (hamburger) 32 × 32 px — na wszystkich 30 stronach

- **Zmierzone:** przycisk „Open menu" w nagłówku = **32 × 32 px** przy 390 px (próg dostępności to 44 × 44 px). Jest to jedyny sposób otwarcia menu na telefonie, więc mimo małego rozmiaru traktuję go jako krytyczny (kluczowa i jedyna ścieżka nawigacji mobilnej).
- **Prawdopodobna przyczyna:** `src/components/Header.tsx:47` — `className="… w-8 h-8 p-1"` (`w-8/h-8` = 32 px). Menu **jest** osiągalne (otwiera się), ale cel jest o 12 px za mały w każdym wymiarze.
- Nawigacja i stopka poza tym nie nakładają się i mieszczą w oknie (zmierzone: nagłówek i stopka nie przekraczają 390 px na żadnej stronie).

---

## 4. Defekty drugorzędne

### D-1. Cele dotykowe < 44 px — systemowo (stopka, cookies, nagłówek)

Obecne na **wszystkich 30 stronach** (źródło: komponenty współdzielone). Wymiary zmierzone przy 390 px:

| Element | Zmierzone | Źródło |
|---|---|---|
| Logo w nagłówku „Adam.Nowak" | 107 × **29** px | `Header.tsx` |
| Linki stopki: „LinkedIn" | 60 × **12** px | `Footer.tsx` |
| Stopka: „Privacy Policy" | 102 × **12** px | `Footer.tsx` / `PrivacyPolicyLink` |
| Stopka: „Manage cookies" | 114 × **17** px | `Footer.tsx` / `ManageCookiesLink` |
| Baner cookies: „Reject all" / „Accept all" | 130 × **31** px | `CookieConsent.tsx:85,92` (`py-1.5 text-[10px]`) |
| Baner cookies: link „Privacy Policy" | 79 × **15** px | `CookieConsent.tsx` |

Wszystkie mają wysokość poniżej 44 px. Naprawa w `Header`/`Footer`/`CookieConsent` usuwa defekt jednocześnie na 30 stronach.

### D-2. Cele dotykowe < 44 px — w treści artykułów i kalkulatorze

| Element | Zmierzone | Gdzie |
|---|---|---|
| „← Blog" | 52 × **19** px | 15 artykułów (`PostShell`) |
| „Copy link" | 65 × **17** px | 15 artykułów (`ShareButton`) |
| „More about me →" (blok autora z A-2) | 129 × **19** px | 15 artykułów (`PostShell`) |
| 8 imiennych linków rekomendacji (np. „Kamila Popławska-Bernatowicz" 261 × **15**) | wys. **15** px | `/about` |
| Suwaki kalkulatora `input[type=range]` | 350 × **4** px | `/tools/loyalty-roi-calculator` (11 szt.) |
| Pola liczbowe kalkulatora | 96 × **21** px | `/tools/loyalty-roi-calculator` (13 szt.) |
| Nawigacja między filarami „Next/Previous" | wys. **43** px | filary (o 1 px poniżej progu) |

Suwaki o wysokości **4 px** (`RoiCalculator.tsx:90`) mają szczególnie mały obszar trafienia dla kciuka — natywny „thumb" jest większy, ale sam element ma 4 px, co utrudnia precyzyjne złapanie.

### D-3. Pola formularzy z czcionką < 16 px (ryzyko przybliżenia widoku na iOS)

Przeglądarki mobilne przybliżają stronę przy fokusie pola z czcionką < 16 px.

| Obszar | Pole | Czcionka | Źródło |
|---|---|---|---|
| Kalkulator ROI | 13 × `input[type=number]` | **12 px** | `RoiCalculator.tsx:87,277,288` (`text-[12px]`) |
| Kalkulator ROI | `textarea` opinii | **12 px** | `RoiCalculator.tsx:428` |
| `/contact` | `input` imię / e-mail, `textarea` wiadomość | **14 px** (`text-sm`) | `contact/page.tsx:194,200,206` |
| `/contact` | pole czatu (textarea) | **14 px** | `contact/page.tsx:263` |
| Artykuły | suwaki (`input[type=range]`) | 12–14 px | `EnrollmentQualityIndex`, `MemberLifecycleFunnel`, `DenominationCoins` |

Uwaga: suwaki (`type=range`) nie wpisuje się tekstem, więc przybliżenie ich nie dotyczy — istotne są pola liczbowe i textarea. Pola `/contact` renderują się dopiero po wejściu w tryb formularza; zostały zmierzone po przeprowadzeniu strony do tego stanu.

### D-4. Tekst treści < 14 px

- **Systemowo (30 stron):** tekst stopki „Content on this site is AI-assisted…" = **12 px** i link „Privacy Policy" = 12 px (`Footer.tsx`); tekst baneru cookies = **12 px** (`CookieConsent.tsx:71`, `text-xs`). To drobny druk prawny — do decyzji, czy podnosić.
- **W komponentach diagramowych:** etykiety `<text>` w SVG mają 9–13 px, np. „signal improves" 10 px (`PersonalizationLoop`), „points" **9 px** i „Reward at 1,000 points" 10 px (`DenominationCoins`/`why-points`), „500K"/„Registered" 10 px (`MemberLifecycleFunnel`). Na telefonie są trudne do odczytania. Pełna lista przy komponentach w sekcji 5.
- **Kalkulator:** tekst instrukcji i etykiet 12–13 px (`RoiCalculator.tsx` — liczne `text-[12px]`/`text-[13px]`).

### D-5. Tabele w artykułach

Dwie strony renderują `<table>` (`the-enrollment-trap`, `the-funnel-inside-the-program`). Obie **mieszczą się** w 342 px przy 390 px i **nie rozpychają** strony (tabela na enrollment-trap nie jest przyczyną K-1 — przyczyną jest wiersz pól, nie tabela). Nie mają jednak własnego przewijania poziomego, więc szersza treść w przyszłości mogłaby przepełnić — to obserwacja, nie defekt. Bloków kodu (`<pre>`) w artykułach nie ma.

---

## 5. Komponenty artykułowe (naprawa u źródła)

Każdy interaktywny komponent jest użyty w serwisie **dokładnie raz** (jedna strona na komponent), więc „liczba stron" = 1 dla wszystkich poniższych. To istotne: naprawy komponentów artykułowych nie kumulują się między stronami — inaczej niż `Header`/`Footer`/`CookieConsent`, które są na wszystkich 30.

| Komponent | Strona | Zachowanie przy 390 px |
|---|---|---|
| **`EnrollmentQualityIndex`** | the-enrollment-trap | **KRYTYCZNE:** `flex-nowrap` + 2× `w-24` → przepełnienie +312 px (K-1). Dodatkowo suwaki 12 px. |
| `MemberLifecycleFunnel` | the-funnel-inside-the-program | Mieści się. Suwaki 80 × 16 px (12 px), etykiety 10 px („500K", „Registered"). |
| `DenominationCoins` (+ `ReferenceEffect`, `GoalGradientPath`, `FramingEffect`, `EndowmentTimeline`) | why-points-feel-like-nothing | Mieści się. Najdrobniejszy tekst w serwisie: „points" **9 px**, suwak 235 × 16 px (12 px). |
| `PersonalizationLoop` | the-personalization-paradox | Mieści się. Etykiety SVG 10–13 px („signal improves" 10 px). |
| `FirstValueMomentDiagram` | the-72-hour-window | Mieści się. Etykiety 11–13 px („FVM here" 11 px). |
| `LegalSurfaceAreaDiagram` | the-t6-legal-audit-… | Mieści się. Etykieta „Opt-in flows · Behavioural tracking" 10,5 px. |
| `ReactiveVisionaryChecklist` | the-customer-is-always-right-… | Mieści się. Bez drobnego tekstu poza stopką. |
| `SeasonalConsumerMap` | how-to-build-a-crm-content-calendar-… | Mieści się. Bez drobnego tekstu poza stopką. |
| `BrandMirror` | its-never-about-you-… | Mieści się. Bez drobnego tekstu poza stopką. |
| `BrandPersonalityMatrix` | brand-intimacy-… | Mieści się. Etykiety osi 10–12 px („LOW", „Maersk"). |
| `ExperienceGrowthLayers` | last-customer-interaction-… | Mieści się. Etykiety 11–12 px. |
| `HmInterestingGrid` | the-crm-breakthrough-formula | Mieści się. Etykiety 11–12 px. |
| `ValueExchangeLoop` | value-exchange-… | Mieści się. Etykiety 11–13 px. |

Komponent `ProfitChart` (`src/components/article`, chart.js/canvas) nie renderuje się na żadnym z 30 adresów — na żadnej stronie nie wykryto elementu `<canvas>`. Wszystkie diagramy w serwisie są SVG-owe.

**Wniosek dla kolejności napraw:** największa dźwignia to `Header` (K-2) + `Footer`/`CookieConsent` (D-1) — jedna zmiana, 30 stron. Drugi priorytet to `EnrollmentQualityIndex` (jedyne przepełnienie układu). Reszta to podniesienie rozmiarów pól i etykiet w komponentach oraz w kalkulatorze.

---

## 6. Co jest w porządku (czego nie ruszać)

- **Brak przepełnienia poziomego na 29 z 30 stron** przy 390 px oraz na **wszystkich 30** przy 768 px i 1440 px.
- **Wszystkie obrazy mają wymiary.** Zmierzono 16 elementów `<img>` — każdy ma jawne `width`/`height` lub `aspect-ratio` (brak ryzyka przeskoków układu przy wczytywaniu). Zasługa `next/image`.
- **Nagłówek i stopka mieszczą się w oknie** na każdej stronie przy 390 px — nic się nie nakłada, menu jest osiągalne.
- **Tabele w artykułach mieszczą się** i nie rozpychają strony.
- **Kalkulator ROI — brak przepełnienia i brak skoków układu:** przy 390 px `scrollWidth = 390` (0 px przepełnienia) w stanie wyjściowym; po przeciągnięciu suwaka do maksimum i po wpisaniu bardzo dużej liczby (`99999999`) `scrollWidth` pozostaje 390, a wysokość strony niezmienna (1806 px). Wyniki są widoczne bez przewijania poziomego, wszystkie 11 suwaków i 13 pól da się obsłużyć (zastrzeżenie do rozmiarów celów: D-2/D-3).
- **Layouty 768 px i 1440 px** są czyste w każdej kategorii przepełnienia.

---

## 7. Metoda

- **Commit:** `5c43152a87b0cd61a093a09a5282f494f1a5aea4` (`main`).
- **Build:** `next build` + `next start` (Next.js 16.2.4, tryb produkcyjny — nie deweloperski). Trasy API tworzą klientów Resend/Anthropic na poziomie modułu, więc na czas budowania podstawiono atrapowe `RESEND_API_KEY` i `ANTHROPIC_API_KEY`; **żaden plik nie został zmieniony**.
- **Przeglądarka:** Chromium 1194 sterowany Playwrightem 1.56.1 (zainstalowanym tymczasowo poza projektem — bez śladu w `package.json`).
- **Szerokości:** 390 px (odniesienie), 768 px, 1440 px; `deviceScaleFactor: 1`, wysokość okna 900 px. Po wczytaniu każdej strony 600 ms na ustabilizowanie wykresów/SVG.
- **Pomiary:** wyłącznie `getBoundingClientRect()` i `getComputedStyle()` w kontekście strony. Przepełnienie liczone jako `max(documentElement.scrollWidth, body.scrollWidth) − innerWidth`. Cele dotykowe: elementy `a, button, input, select, textarea, [role=button]` (linki w akapitach treści oznaczone osobno i wyłączone z kolumny „Cele < 44"). Tekst < 14 px filtrowany z pominięciem celowych etykiet/nadlinii (wielkie litery, krój Syne, duży `letter-spacing`).
- **Zakres:** 30 adresów × 3 szerokości = **90 pomiarów**, wszystkie zakończone sukcesem (0 błędów). Kalkulator ROI dodatkowo w teście interakcji (przeciągnięcie suwaka, wpisanie skrajnej wartości, ujawnienie formularza opinii).
- **Mapowanie defekt → komponent:** z pomiaru DOM (klasy, selektory, wykryte `<canvas>`/`<svg>`) skrzyżowanego z importami komponentów w plikach `src/content/posts/*.mdx`. Odniesienia `plik:linia` wskazują prawdopodobną przyczynę, nie są źródłem liczb.
