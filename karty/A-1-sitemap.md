# Karta A-1 — mapa strony: dodać brakujące adresy

**Projekt:** adamnowak.online
**Data wystawienia:** 7.09.2026
**Gałąź robocza:** odbij od `main`, nazwij `karta/a1-sitemap`
**Rozmiar:** jeden plik, kilkanaście linii

---

## Po co to robimy

Mapa strony (`src/app/sitemap.ts`) zawiera dziś tylko stronę główną, `/blog`, `/loyalty-system`, wpisy blogowe i filary. Poza nią zostają **kalkulator ROI** — jedyne narzędzie na stronie i jedyna rzecz nie do skopiowania z bloga dostawcy — oraz **strona About**, na której leży osiem imiennych rekomendacji stanowiących główny dowód wiarygodności.

Obie są dziś niewidoczne dla wyszukiwarek.

---

## Zakres

Zmieniasz **wyłącznie** plik `src/app/sitemap.ts`.

Dodaj cztery wpisy:

| Adres | priority | changeFrequency |
|---|---|---|
| `/tools/loyalty-roi-calculator` | 0.8 | `monthly` |
| `/about` | 0.7 | `monthly` |
| `/contact` | 0.6 | `yearly` |
| `/privacy-policy` | 0.3 | `yearly` |

Zachowaj konwencję już obecną w pliku: `lastModified: new Date()`, stała `BASE_URL`, ten sam kształt obiektu.

Kolejność w tablicy: strona główna, `/blog`, `/loyalty-system`, kalkulator, About, Contact, wpisy blogowe, filary, na końcu polityka prywatności.

---

## Czego NIE robisz — warunki zatrzymania

- **NIE dodajesz `/work-with-me` ani `/newsletter`.** Obie są pustymi stronami z napisem „Coming soon". Wpuszczenie ich do mapy strony oznaczałoby zapraszanie wyszukiwarki do pustej obietnicy. Decyzja o ich losie zapada osobno.
- **NIE zmieniasz żadnego innego pliku.** Jeśli wydaje się, że coś jeszcze wymaga poprawki — zatrzymaj się i zgłoś w raporcie, nie naprawiaj.
- **NIE ruszasz `robots.ts`.**
- **NIE zmieniasz priorytetów istniejących wpisów.**

---

## Kryteria odbioru

Raport ma zawierać:

1. **SHA commita**, z którego czytałeś stan wyjściowy, i SHA po zmianie.
2. **Liczbę adresów w mapie przed i po** — policzoną z wygenerowanego `sitemap.xml` po zbudowaniu projektu, nie z kodu.
3. **Pełną listę czterech nowych adresów** dokładnie tak, jak pojawiają się w wyjściu — z pełnym `https://www.adamnowak.online`.
4. **Potwierdzenie, że `/work-with-me` i `/newsletter` NIE występują** w wygenerowanej mapie.
5. **Wynik `git diff --stat`** — ma pokazywać jeden zmieniony plik.
6. **Wynik budowania** — projekt musi się zbudować bez błędów.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie PR. Nie scalaj sam — scalenie jest decyzją Adama.
