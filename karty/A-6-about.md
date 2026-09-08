# Karta A-6 — strona About: dopasowanie do strategii

**Projekt:** adamnowak.online
**Data wystawienia:** 8.09.2026
**Gałąź robocza:** odbij od aktualnego `main`
**Rozmiar:** jeden plik, cztery punktowe zmiany treści
**Brzmienia poniżej są wiążące i podane dosłownie.**

---

## Po co to robimy

Strona główna prowadzi teraz do bloga, a każdy artykuł kończy się blokiem autora z odsyłaczem do About. Zbudowaliśmy ścieżkę prowadzącą do jedynej strony, na której leży osiem imiennych rekomendacji — czyli do całego dowodu zaufania w tym serwisie.

About jest w dobrym stanie merytorycznie, ale mówi jeszcze starym głosem: o programach zamiast o dziedzinie, o regionie zamiast o krajach, i nie ma w nim ani słowa o tym, że Adam buduje rzeczy sam.

**To nie jest przepisanie strony.** Cztery cięcia, reszta bez zmian.

---

## Zakres

Zmieniasz **wyłącznie** `src/app/about/AboutClient.tsx`.

### Zmiana 1 — nagłówek H1

**Było:**
> Twenty years building loyalty programs across EMEA. The complexity is the advantage.

**Ma być:**
> Twenty years in customer loyalty. Poland, Sweden, the UK — the last two in global roles. The complexity is the advantage.

Zachowaj obecne rozbicie na fragment jasny i akcentowany oraz obecne style. Jeśli dziś akcent obejmuje zdanie „The complexity is the advantage" — ma nadal je obejmować.

**Dlaczego:** „programs across EMEA" mówi jednocześnie o narzędziu i o zasięgu stanowiska. Strategia rozróżnia dwie warstwy wiarygodności: głębokość w dziedzinie (dwadzieścia lat w lojalności) i szerokość doświadczenia (trzy kraje, dwie role globalne). Nagłówek ma nieść obie.

### Zmiana 2 — akapit o ścieżce zawodowej

W zdaniu o Avisie **usuń słowo „now"**:

**Było:** At Avis Budget Group International I now lead EMEA loyalty strategy.
**Ma być:** At Avis Budget Group International I lead EMEA loyalty strategy.

**Dlaczego:** „now" w liście przeszłych ról sugeruje punkt zwrotny. Adam nadal tam pracuje — zdanie ma opisywać stan bieżący, nie zmianę.

### Zmiana 3 — nowy akapit po akapicie o ścieżce

Wstaw **bezpośrednio po** akapicie kończącym się na „...I lead EMEA loyalty strategy.", a **przed** zdaniem „The multicultural complexity isn't a constraint...".

Ten sam styl co sąsiednie akapity, ten sam odstęp:

> Alongside that, I build things. Sites, tracking, campaigns, small tools. Partly because I like it when something works, and I like fixing it when it doesn't — and partly because the distance between "we should have this" and "here it is" turns out to be mostly time and money.

**Dlaczego:** hero nie mówi już, że Adam cokolwiek buduje — słowo „tools" zostało z niego usunięte, żeby strona nie czytała się jak oferta platformy lojalnościowej. Dowód wykonania musi więc zamieszkać tutaj. Słowo „alongside" jest istotne: budowanie dzieje się **obok** pracy w Avisie, nie zamiast niej.

Zwróć uwagę na cudzysłowy wewnątrz zdania — użyj takiego samego sposobu ich zapisu, jaki jest już stosowany w tym pliku dla apostrofów i znaków specjalnych.

### Zmiana 4 — akapit domykający sekcję „Who I work with"

Na samym końcu tej sekcji, po ostatniej grupie odbiorców, dodaj akapit:

> Not every problem has an answer on the spot. Every one breaks down into time, money and decisions — and telling those three apart is most of the work.

Styl jak akapity opisowe w tej sekcji, nie jak nagłówek grupy.

**Dlaczego:** to zdanie o postawie z dokumentu strategicznego. Mówi o metodzie, nie o cesze charakteru, i działa jako filtr — kto szuka wyroczni, odpadnie.

---

## Czego NIE robisz — warunki zatrzymania

- **NIE zmieniasz treści rekomendacji** ani ich kolejności. Kolejność jest osobną decyzją Adama.
- **NIE zmieniasz akapitu otwierającego** („brands earn loyalty by being loyal first...").
- **NIE zmieniasz sekcji „What I work on".**
- **NIE ruszasz kafelków z liczbami** na górze strony.
- **NIE usuwasz „EMEA"** z akapitu o Avisie — tam jest faktem o stanowisku. Usuwamy je wyłącznie z nagłówka.
- **NIE dodajesz nowych sekcji, przycisków ani odsyłaczy.**
- **NIE zmieniasz stylów, kolorów ani krojów.**

---

## Kryteria odbioru

1. **`git diff --stat`** — dokładnie jeden zmieniony plik.
2. **Cztery zmiany i nic ponadto** — pokaż pełny diff treści.
3. **Nowy akapit stoi we właściwym miejscu:** po zdaniu o Avisie, przed zdaniem o multicultural complexity. Podaj trzy kolejne akapity w kolejności występowania na zbudowanej stronie.
4. **Brak przepełnienia poziomego** na `/about` przy 390 px. Podaj `scrollWidth` i szerokość okna.
5. **Nagłówek mieści się bez rozpychania strony** przy 390 px — podaj zmierzoną wysokość H1 przed i po.
6. **Zero wystąpień frazy „loyalty programs across EMEA"** w `src/` po zmianie.
7. **Wynik budowania** bez błędów.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu. Podstaw atrapowe wartości zmiennych i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
