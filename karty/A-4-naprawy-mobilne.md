# Karta A-4 — naprawy mobilne z audytu A-3

**Projekt:** adamnowak.online
**Data wystawienia:** 8.09.2026
**Podstawa:** raport `karty/raporty/A-3-audyt-mobilny.md`
**Gałąź robocza:** odbij od aktualnego `main`
**Rozmiar:** trzy poprawki w trzech obszarach, wszystkie mechaniczne

---

## Po co to robimy

Audyt zmierzył trzydzieści adresów i wykazał, że serwis trzyma się na telefonie lepiej, niż zakładaliśmy. Zostały trzy rzeczy, które realnie przeszkadzają w obsłudze kciukiem. Wszystkie są punktowe i żadna nie wymaga decyzji projektowych.

Naprawiamy je razem, bo dwie z trzech siedzą w komponentach współdzielonych — jedna zmiana działa na wszystkich trzydziestu stronach.

---

## Poprawka 1 — przepełnienie poziome na `/blog/the-enrollment-trap` (KRYTYCZNE)

**Plik:** `src/components/blog/EnrollmentQualityIndex.tsx`

**Zmierzony stan:** przy oknie 390 px strona ma `scrollWidth = 702 px`, czyli **312 px przepełnienia**. Strona przewija się w bok. To jedyne przepełnienie w całym serwisie.

**Przyczyna:** kontener kontrolek w linii 25 ma `flex flex-nowrap gap-4`. Zakaz zawijania plus trzy etykiety z suwakami (`w-28`, `w-24`, `w-24`) i wartościami nie mieszczą się w szerokości telefonu. Przy 768 px wiersz się mieści, więc defekt jest wyłącznie mobilny.

**Co zrobić:** pozwolić kontrolkom zawijać się na wąskim ekranie. Najprostsze rozwiązanie: zamienić `flex-nowrap` na zawijanie, tak by przy 390 px każda etykieta mogła stanąć w osobnym wierszu, a przy szerszych ekranach układ pozostał jednowierszowy jak dziś.

**Warunek:** przy 1440 px układ tego komponentu ma wyglądać **tak samo jak przed zmianą**. Sprawdź to i udokumentuj.

---

## Poprawka 2 — przycisk menu za mały (KRYTYCZNE)

**Plik:** `src/components/Header.tsx`, linia 47

**Zmierzony stan:** przycisk otwierający menu ma **32 × 32 px**. Próg dostępności to 44 × 44 px. Jest to jedyna ścieżka do nawigacji na telefonie.

**Obecnie:** `className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 p-1"`

**Co zrobić:** powiększyć obszar klikalny do co najmniej 44 × 44 px, **nie zmieniając wyglądu samych kresek hamburgera**. Powiększamy cel, nie ikonę — kreski mają zostać wizualnie takie same, jak są.

**Warunek:** przycisk nie może przesunąć ani rozepchnąć nagłówka. Zmierz wysokość nagłówka przed i po.

---

## Poprawka 3 — cele dotykowe w stopce i banerze cookies

**Pliki:** `src/components/Footer.tsx`, `src/components/CookieConsent.tsx`

**Zmierzony stan przy 390 px:**

| Element | Zmierzone |
|---|---|
| „LinkedIn" | 60 × 12 px |
| „Privacy Policy" (stopka) | 102 × 12 px |
| „Manage cookies" | 114 × 17 px |
| „Reject all" / „Accept all" | 130 × 31 px |
| „Privacy Policy" (baner cookies) | 79 × 15 px |

**Co zrobić:** podnieść wysokość obszaru klikalnego tych elementów do **co najmniej 44 px** — przez odstęp wewnętrzny albo minimalną wysokość, **bez powiększania rozmiaru czcionki**.

Przyciski zgód w banerze (`Reject all` / `Accept all`) mają dziś 31 px wysokości — te podnieś w pierwszej kolejności, bo to kontrolki decyzyjne, w które ludzie realnie celują.

**Warunek:** stopka nie może urosnąć o więcej niż 60 px w sumie przy 390 px. Zmierz przed i po. Jeśli wychodzi więcej — zatrzymaj się i zgłoś zamiast kombinować.

---

## Czego NIE robisz — warunki zatrzymania

- **NIE zmieniasz rozmiarów czcionek.** Ani w stopce, ani w banerze, ani w komponentach. Kwestia drobnego druku jest osobną decyzją Adama.
- **NIE ruszasz pól formularzy** w kalkulatorze ani na `/contact`. Sprawa czcionki 16 px w polach to osobna karta.
- **NIE ruszasz pozostałych komponentów artykułowych.** Tylko `EnrollmentQualityIndex`.
- **NIE usuwasz `ProfitChart`**, mimo że audyt wykazał, że nie renderuje się nigdzie. Osobna decyzja.
- **NIE dodajesz zależności ani nowych zmiennych CSS.**
- **NIE zmieniasz plików MDX.**

---

## Kryteria odbioru

Wszystkie liczby mają pochodzić z pomiaru w przeglądarce na produkcyjnym buildzie, tą samą metodą co w audycie A-3.

1. **`/blog/the-enrollment-trap` przy 390 px:** `scrollWidth` równy szerokości okna, przepełnienie 0 px. Podaj wartość przed i po.
2. **Ten sam adres przy 1440 px:** układ kontrolek niezmieniony wobec stanu sprzed poprawki. Podaj dowód — wymiary wiersza kontrolek przed i po.
3. **Przycisk menu:** zmierzone wymiary ≥ 44 × 44 px. Podaj przed i po.
4. **Wysokość nagłówka** przy 390 px przed i po — ma być bez zmian albo różnica jasno wyjaśniona.
5. **Pięć elementów z tabeli w poprawce 3:** zmierzone wysokości po zmianie, każda ≥ 44 px.
6. **Wysokość stopki** przy 390 px przed i po.
7. **Kontrola regresji:** żadna z pozostałych 29 stron nie zyskała przepełnienia poziomego przy 390 px. Przemierz wszystkie 30 adresów i podaj wynik zbiorczy.
8. **`git diff --stat`** — dokładnie trzy zmienione pliki.
9. **Wynik budowania** bez błędów.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu. Podstaw atrapowe wartości zmiennych na czas budowania i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request **na `main`**, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
