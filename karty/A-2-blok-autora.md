# Karta A-2 — blok autora pod każdym artykułem

**Projekt:** adamnowak.online
**Data wystawienia:** 7.09.2026
**Gałąź robocza:** odbij od `main`
**Rozmiar:** jeden plik, jeden nowy blok

---

## Po co to robimy

Kto wchodzi na artykuł z zewnątrz, nie ma dziś żadnej ścieżki do strony `/about` — a na niej leży osiem imiennych rekomendacji, które są głównym dowodem wiarygodności całego serwisu. Polecenie jest głównym kanałem tego projektu, więc dowód zaufania musi być o jedno kliknięcie od tekstu, nie schowany w nawigacji.

Artykuł kończy się dziś sekcją „Related" i niczym więcej. Czytelnik, któremu tekst się spodobał, nie dowiaduje się, kto go napisał.

---

## Zakres

Zmieniasz **wyłącznie** plik `src/app/blog/[slug]/page.tsx`, w komponencie `PostShell`.

**Miejsce wstawienia:** między zamknięciem `</article>` a blokiem `{related.length > 0 && (...)}`.

### Co ma się pojawić

Blok autora zawierający:

1. **Zdjęcie** — `/adam-nowak.jpg` (jest w `public/`), okrągłe, 64 px na desktopie, 56 px na wąskim ekranie. Użyj `next/image` z jawnymi `width`/`height`, `alt="Adam Nowak"`.
2. **Tekst** — dwa akapity, brzmienia dokładnie jak poniżej, bez zmian:

> **Adam Nowak**
>
> Fifteen years building loyalty programmes — Poland, Sweden and the UK, the last two in global roles. I write about what fails in these programmes and build tools that show it in numbers.

3. **Odsyłacz** do `/about` z treścią `More about me →`.

### Układ — mobile first

- **Do 767 px:** kolumna. Zdjęcie na górze, tekst pod nim, odsyłacz na końcu.
- **Od 768 px:** zdjęcie po lewej, tekst po prawej, wyrównanie do góry, odstęp 24 px.

### Styl — bez wymyślania nowych wartości

Użyj tokenów i konwencji już obecnych w tym pliku:

- Nazwisko: `var(--font-syne)`, 10–11 px, `font-weight: 700`, `letter-spacing: 0.12em`, wielkie litery, kolor `var(--muted)` — tak jak nagłówek „Related".
- Tekst opisu: krój i rozmiar taki, jak akapity treści artykułu, kolor `var(--muted)`.
- Odsyłacz: dokładnie ten sam wzór co odsyłacz „← Blog" na górze strony — `var(--font-syne)`, 11 px, `font-weight: 600`, `letter-spacing: 0.08em`, wielkie litery, `text-muted hover:text-amber`, bez podkreślenia.
- Górna krawędź oddzielająca: `1px solid var(--border)`, tak jak nad sekcją „Related". Odstęp nad blokiem 72 px, wewnętrzny odstęp górny 48 px.

---

## Czego NIE robisz — warunki zatrzymania

- **NIE zmieniasz sekcji „Related"** ani jej odstępów. Blok autora staje nad nią i ma własną krawędź.
- **NIE tworzysz nowego komponentu w osobnym pliku.** Blok żyje w `PostShell`, bo nigdzie indziej nie jest używany.
- **NIE dodajesz nowych zmiennych CSS, kolorów ani krojów.** Wyłącznie te, które są już w pliku.
- **NIE ruszasz danych strukturalnych** (`ArticleJsonLd`).
- **NIE zmieniasz żadnego pliku MDX.**
- Jeśli `public/adam-nowak.jpg` nie istnieje albo ma inną nazwę — **zatrzymaj się i zgłoś**, nie podstawiaj zastępczego obrazka.

---

## Kryteria odbioru

Raport ma zawierać:

1. **SHA** stanu wyjściowego i po zmianie.
2. **Wynik `git diff --stat`** — ma pokazywać jeden zmieniony plik.
3. **Potwierdzenie, że blok pojawia się na wszystkich piętnastu stronach artykułów** — policz wystąpienia frazy `More about me` w zbudowanym wyjściu (`.next`), podaj liczbę. Ma być 15.
4. **Pomiar szerokości i układu** przy 390 px i 1440 px: czy przy wąskim ekranie blok jest kolumną, a przy szerokim dwiema kolumnami. Podaj zmierzone wartości, nie deklarację.
5. **Potwierdzenie, że sekcja „Related" nie zmieniła położenia** względem końca treści na stronie kontrolnej — wybierz jeden artykuł, podaj odstęp przed i po zmianie.
6. **Wynik budowania** — bez błędów.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu, więc bez zmiennych środowiskowych build się wywróci. To znany stan, zgłoszony przy karcie A-1. Podstaw atrapowe wartości na czas budowania i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
