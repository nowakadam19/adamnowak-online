---
title: "TypeScript strict mode — dlaczego warto go włączyć od początku"
date: "2026-04-20"
excerpt: "Strict mode w TypeScript bywa uciążliwy na starcie, ale na dłuższą metę oszczędza mnóstwo czasu."
tags: ["typescript", "dobre-praktyki"]
---

## Co to jest strict mode?

Flaga `"strict": true` w `tsconfig.json` włącza zestaw reguł, które sprawiają, że TypeScript weryfikuje kod znacznie dokładniej niż domyślnie. Najważniejsze z nich to:

- `strictNullChecks` — `null` i `undefined` nie są przypisywalne do innych typów bez jawnej zgody
- `noImplicitAny` — każda zmienna musi mieć znany typ
- `strictFunctionTypes` — dokładniejsza kontrola typów parametrów funkcji

## Dlaczego od początku

Włączenie strict mode w istniejącym projekcie to ból. Nagle pojawia się setki błędów, które trzeba naprawić — albo zaślepić `// @ts-ignore`, co mija się z celem.

W nowym projekcie koszt jest zerowy, a zyski są realne:

```typescript
// Bez strictNullChecks — cicha katastrofa
function getUser(id: string) {
  return users.find((u) => u.id === id);
  // zwraca User | undefined, ale TS nie krzyczy
}

getUser("abc").name; // błąd w runtime

// Z strictNullChecks — błąd w compile time
const user = getUser("abc");
user.name; // Error: Object is possibly 'undefined'
user?.name; // OK
```

## Praktyczna wskazówka

Jeśli przejmujesz projekt bez strict mode i chcesz go włączyć stopniowo, możesz dodawać flagi pojedynczo zamiast całego `"strict": true`.

Zacznij od `strictNullChecks` — to przynosi największy zwrot z inwestycji.
