# Karta A-8 — hero strony /loyalty-system: usunąć „programmes" i „framework"

**Projekt:** adamnowak.online
**Data wystawienia:** 9.09.2026
**Gałąź robocza:** odbij od aktualnego `main`
**Rozmiar:** jeden plik, pięć miejsc
**Brzmienia poniżej są wiążące i podane dosłownie.**

---

## Po co to robimy

Strona `/loyalty-system` to jedyne miejsce w serwisie, które nie przeszło wczorajszej i dzisiejszej redakcji. Prowadzi bezpośrednio do sześciu filarów przepisanych kartą A-7 — i kontrastuje z nimi w trzech punktach: mówi „programmes" zamiast o dziedzinie (reguła 3 ze strategii), pakuje treść jako „practical framework" do kupienia zamiast manifestu przekonań (rozdz. 9: nie sprzedajemy metodologii), i otwiera bezosobową scenką korporacyjną („three teams, three roadmaps") zamiast mówić wprost do czytelnika, jak robią to już wszystkie sześć filarów.

Nagłówek H1 zostaje bez zmian — jest mocny i nie robi fałszywej obietrznicy. Zmieniają się: dwa akapity leadu pod nim oraz cztery miejsca w metadanych, które powtarzają ten sam problematyczny język dla wyszukiwarek i mediów społecznościowych.

---

## Zakres

Zmieniasz **wyłącznie** plik `src/app/loyalty-system/page.tsx`, w pięciu miejscach.

### 1. Lead pod H1 (linie ok. 67–73)

**Było:**
```
Most loyalty programmes fail at integration, not execution. Three
teams, three roadmaps, three definitions of a loyal customer — and
nobody looking at the whole.
```
```
The Loyalty System is a practical framework for building loyalty
that lasts. Six pillars, each dependent on the others. An ecosystem,
not a checklist.
```

**Ma być** (dwa osobne akapity `<p>`, struktura i klasy CSS bez zmian — zmienia się wyłącznie tekst wewnątrz):
```
Most advice on loyalty comes in isolated pieces — a tip on
segmentation here, a rule for rewards there. Put them all in the
same room and half of them contradict each other.
```
```
These six pillars aren't a checklist. Each one leans on the
others — get the customer view wrong, and everything built on top
of it inherits the mistake.
```

### 2. `metadata.description` (linia ok. 10)

**Było:** `'The biggest mistake in loyalty is a missing system. Six pillars for practitioners who want to build customer loyalty that actually lasts.'`

**Ma być:** `'The biggest mistake in loyalty is a missing system. Six interdependent pillars for practitioners who want customer loyalty that actually lasts — not a checklist.'`

### 3. `openGraph.description` (linia ok. 18)

**Było:** `'Six pillars for practitioners who want to build customer loyalty that actually lasts.'`

**Ma być:** `'Six interdependent pillars for practitioners who want customer loyalty that actually lasts — not a checklist.'`

### 4. `twitter.description` (linia ok. 26)

Identyczna zmiana jak w punkcie 3 — ten sam string co w `openGraph.description`.

### 5. `SCHEMA.description` (JSON-LD, linia ok. 36)

**Było:** `'A structured guide to building customer loyalty — six pillars for practitioners.'`

**Ma być:** `'Six interdependent pillars for building customer loyalty that lasts — for practitioners, not a checklist.'`

---

## Czego NIE robisz — warunki zatrzymania

- **NIE zmieniasz H1** ani jego struktury (fragment zwykły + fragment w `<em>`).
- **NIE zmieniasz kickera** „The Loyalty System" nad H1 ani etykiety „Six pillars" nad listą filarów — to są nawigacyjne etykiety, nie twierdzenia, zostają.
- **NIE zmieniasz sekcji z listą filarów** poniżej hero (mapowanie `pillars.map(...)`) ani niczego związanego z `getAllPillars`.
- **NIE zmieniasz `metadata.title`, `openGraph.title`, `twitter.title`** — tylko pola `description`.
- **NIE zmieniasz żadnego innego pliku**, w tym żadnego z sześciu plików `.mdx` filarów.

---

## Kryteria odbioru

1. **`git diff --stat`** — dokładnie jeden zmieniony plik.
2. **Zero wystąpień słowa „programmes"** w tym pliku po zmianie.
3. **Zero wystąpień słowa „framework"** w tym pliku po zmianie.
4. **Zero wystąpień frazy „three teams"** w tym pliku po zmianie.
5. **Pięć nowych brzmień obecnych dosłownie** — zweryfikuj przez wyszukanie każdego z pięciu nowych fragmentów tekstu w pliku.
6. **Kontrola mobilna przy 390 px** na `/loyalty-system`: brak przepełnienia poziomego. Dłuższe zdania w leadzie mogą zachowywać się inaczej niż poprzednie — zmierz i podaj wynik.
7. **Wynik budowania** bez błędów.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu. Podstaw atrapowe wartości zmiennych i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
