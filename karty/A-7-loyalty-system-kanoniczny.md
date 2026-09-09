# Karta A-7 — Loyalty System: podmiana treści na wersję kanoniczną

**Projekt:** adamnowak.online
**Data wystawienia:** 9.09.2026
**Gałąź robocza:** odbij od aktualnego `main`
**Rozmiar:** sześć plików treści, jedna drobna zmiana komponentu
**Brzmienia poniżej są wiążące i podane dosłownie — to jest podmiana treści, nie redakcja.**

---

## Po co to robimy

Sześć filarów Loyalty System przeszło pełną redakcję — od pierwowzorów z 2021 roku, przez porównanie z wersją z 2025 i dzisiejszym blogiem, do sześciu tekstów zatwierdzonych zdanie po zdaniu. Cała praca redakcyjna jest zakończona i zapisana w Notion (strona „Loyalty System — redakcja kanoniczna"). Ta karta wykonuje wyłącznie mechaniczną podmianę: stary tekst na nowy, w sześciu plikach `.mdx`.

Manifest zmienia gatunek: z podręcznika z numerowanymi krokami i sekcją „Common mistakes" na ciągłą prozę broniącą jednej tezy na filar. Zero numerowanych list, zero nagłówków „How to", zero nagłówków „Common mistakes" w żadnym z sześciu plików po zmianie.

**Adresy URL (slugi plików) zostają bez zmian.** Zmieniają się tytuły w treści, nie nazwy plików ani ścieżki — strony były dwa dni temu dodane do mapy strony i część już mogła zostać zaindeksowana. Zmiana slugów zerwałaby te odnośniki bez potrzeby.

---

## Zakres

Zmieniasz **wyłącznie** sześć plików w `src/content/loyalty-system/`. Dla każdego: **zastąp całą zawartość pliku dokładnie poniższym tekstem, znak w znak** — to nie jest edycja fragmentu, to pełna podmiana treści przy zachowaniu nazwy pliku.

Zachowaj pole `pillar:` (numer) bez zmian w każdym pliku — tylko `title`, `headline`, `description` i cała treść poniżej `---` się zmieniają. Pole `tags:` zostaje bez zmian — nie modyfikuj go.

---

### Plik: `know-who-youre-talking-to.mdx`

```
---
pillar: 1
title: "Build a single view of the customer"
headline: "Not a complete file — a working memory."
description: "People change emails, phones, cities, browsers. A single view means recognising the same person anyway — not with certainty, but often enough to stop treating them like a stranger."
tags: ["CRM", "Data", "System design"]
---

How many times have you started browsing on your phone during lunch, only to finish the order on your laptop at home? How many times have you stood in the store, phone in hand, checking one more review before you decide?

That's not an edge case. That's every customer's journey now.

And yet most companies are still built around channels, not people. An ecommerce team here, a store division there, a call centre, a media desk. Each with its own tools, its own metrics, its own version of who the customer is. Nobody's wrong. Nobody sees the whole person.

That gap isn't just inconvenient — it's expensive. You email someone to finish a purchase they already made in the store an hour ago. You spend acquisition budget chasing a "new" customer who's already yours, just browsing on a different device. Your service team apologises for a problem they can't see the shape of, because half the story lives in a system they can't open.

A single view of the customer means recognising the same person, however and wherever they show up. Not a complete file — a working memory. It doesn't need to be perfect to be useful. It needs to be honest about what it doesn't know yet.

Two things build that memory.

What people choose to tell you. Ask, and most people will answer — not because they're naïve, but because reciprocity is one of the oldest rules in human behaviour: give something, get something back. A preference shared at sign-up, an honest answer to one well-placed question — that's not surveillance. That's a conversation someone agreed to have.

What people leave behind without saying a word. A click, a visit, a call, a return. None of it means much alone. Connected — through one identifier every team actually uses — it starts to look like a person, not a session.

This isn't a project you finish. People change emails, phones, cities. The picture is always a little out of date, and that's fine. The point was never certainty. It was recognising someone well enough, often enough, to stop treating them like a stranger every time they come back.
```

---

### Plik: `start-with-people-not-products.mdx`

```
---
pillar: 2
title: "Place humans above your products"
headline: "There's no such thing as an average customer."
description: "Most brands sell to a spreadsheet. Once you focus on the actual person and the barrier in their way, the shift rarely stops at communication — it reaches the offer, then the product itself."
tags: ["Segmentation", "Customer insight", "Human-first"]
---

"Our average customer spends €X and visits us Y times a year." Every company has a sentence like this — comfortable, easy to repeat, understood by everyone from the intern to the board. It makes the room feel like the customer is known. The bad news: there's no such person. It describes a spreadsheet, not somebody standing in your store at eleven at night.

An average customer doesn't have a problem to solve — just a profile to match. So that's what brands end up offering: not an answer to anything specific, just the product itself, aimed at the market in general. Marketing decides what to say by opening a commercial calendar and dropping a product name into a cell — the same yes/no question asked over and over: do you want this? Some people say yes. Most say no. Ask a few more times and they stop listening.

Focus on the person instead of the average, and the question changes. Not "do you want this" but "what's actually in your way" — and a barrier, once you can name it, rarely stays a marketing problem for long. It reaches the offer, then the service, then eventually the product itself.

Nobody has ever felt loved by an average. But most people notice, quietly, when a brand treats them like one — and when it doesn't.
```

---

### Plik: `give-before-you-ask.mdx`

```
---
pillar: 3
title: "Offer value exchange that is meaningful for your customers"
headline: "A discount opens a wallet, not a relationship."
description: "Customers hand over something real when they join — who they are, what they like. The honest test of any benefit: does it earn more spend and more trust, at the same time?"
tags: ["Value exchange", "Rewards design", "Member benefits"]
---

For most brands, the loyalty relationship starts and ends with rewards — points, miles, discounts for spend. For me, that's the cherry on the cake. It matters, but only after there's a cake underneath it.

When customers join, they're not just signing up for a card. They're handing you something real — who they are, what they like, how they move through their day — and, in return, they expect something real back. That's the actual contract, whether anyone says it out loud or not.

The trouble is, most brands hear only half of it. Wherever I've worked, I've heard the same line: "Our customers just love a good discount." They're not wrong — most people do. But a discount opens a wallet, not a relationship. It works well enough to bring someone in, and then very little to keep them, because there's always someone else on the market willing to go a little lower. Whatever margin you spent to win them goes with them, the moment they find that someone.

Real value looks different — a faster return, a better warranty, being recognised before you have to explain yourself again. Most of it costs the brand very little to give and means quite a lot to receive. And the honest test of any of it is simple: does it give someone a reason to spend more, and a reason to tell you more about themselves — at the same time? Value that only does one of those is a discount wearing a nicer outfit.

Get that exchange right, and the relationship stops being transactional. It starts paying for itself twice — once in what customers spend, and once in what they're willing to let you know about them.
```

---

### Plik: `your-best-customers-are-already-here.mdx`

```
---
pillar: 4
title: "Always start with your members"
headline: "Two paths through the same forest — the CRM data and the media plan."
description: "You can spend a media budget re-finding someone you already have full contact details for. Start with what you already know before paying to learn it twice."
tags: ["Member engagement", "Owned channels", "Media strategy"]
---

Attention isn't what it used to be. People spend more time consuming content than ever, scattered across more places, and every year it gets a little harder to find them there — not because they've vanished, but because the platforms holding their attention have every reason to keep charging you for access to it.

Which is exactly the trap worth noticing: believing the only way to reach anyone is through someone else's channel, on someone else's terms, at someone else's price.

Your CRM data and your paid media plan are usually run like two separate departments — two paths through the same forest, running side by side, rarely checking what's happening on the other. Which means you can spend a media budget finding someone you already have full contact details for, while a member who's never once heard from you directly sits one campaign away, uncounted.

Neither mistake is small. One wastes money re-discovering people you could reach for free. The other quietly under-invests in the people already worth the most.

Start with what you already know before paying to learn it twice. Build the media plan on your own data first — who you can already reach directly, who's gone quiet, who's been an active member for months without ever hearing from you. Only once that's mapped does it make sense to decide where paid media actually needs to fill a gap.

It's not an argument for spending less on media. It's an argument against spending to re-find people you've already found.
```

---

### Plik: `prove-it-pays.mdx`

```
---
pillar: 5
title: "Track the performance"
headline: "You can't argue with a control group."
description: "Loyalty is more countable than almost anything else in the business. Three numbers turn 'we think this worked' into something nobody can wave away."
tags: ["ROI", "Measurement", "Business case"]
---

Money talks, and everyone in your organisation already speaks that language. Resources are limited, decisions get made on what pays back and how fast — you don't need an MBA to know that, just a seat in enough budget meetings.

Which puts loyalty and CRM in an odd position. Most of what happens here is more countable than almost anything else in the company. You can argue for weeks about what a brand campaign is really worth. You can't argue with a control group.

That's the advantage worth using. Take a slice of your members, hold them out, and let the numbers say what actually moved because of what you did — not what would have happened anyway. It turns "we think this worked" into something nobody at the table can wave away, and it works just as well on a small test as it will later at scale.

Three things tend to come out of that kind of measurement, and they matter for different reasons. Share of sales — how much of the business goes through people you can actually identify and reach directly. Incremental impact — how much of that wouldn't have happened without you. And lifetime value — what your best customers and the ones who could become them are actually worth, and where that worth comes from.

None of these numbers are decoration. Once they exist, they change what gets asked in other rooms — how much a campaign is worth funding, which customers a product roadmap should have in mind, where the next investment should go. That's the real shift: from being asked to justify your cost, to being the person whose numbers other people build their case on.

<Toolbox
  pillar="Track the performance"
  toolsJson='[{"title":"Loyalty Programme ROI Calculator","description":"Quantify required lift, revenue impact, and ROI — no control group needed.","href":"/tools/loyalty-roi-calculator"}]'
/>
```

**Uwaga do tego pliku — czytaj uważnie:** dzisiejszy `<Toolbox>` ma dwa wpisy, drugi oznaczony `"comingSoon":true` (kalkulator CLV, który nie istnieje). Nowa wersja ma **tylko jeden wpis** — prawdziwy, działający kalkulator ROI. Wpis o kalkulatorze CLV usuń całkowicie, nie zostawiaj go nawet jako `comingSoon`. Decyzja Adama 9.09: nie obiecujemy narzędzi, których nie ma; gdy powstaną, dopiszemy je wtedy.

---

### Plik: `make-data-everyones-job.mdx`

```
---
pillar: 6
title: "Enable data-driven decisions by fueling your organisation with customer data"
headline: "The streetlight effect: looking where the light is good, not where the answer is."
description: "Whatever you know about the customer stops being useful the moment nobody else can act on it. Democratising insight means trusting others to find what you wouldn't have thought to look for."
tags: ["Data democratisation", "Cross-functional", "Customer intelligence"]
---

There's a decent chance people in your organisation quietly don't love you for it — but if you own the single view of the customer, you already know things before the report meant to tell you does. The NPS score from a service call, before the summary lands in anyone's inbox. Which product page people keep abandoning. What a specific customer complained about, twice, to two different teams who never compared notes.

If that's making you unpopular, it's usually not because you're being difficult. It's because everyone else is working with a fraction of the picture, and fractions are uncomfortable to be reminded of.

There's a name for the pattern behind that discomfort: the streetlight effect. People look for answers where the light is good, not where the answer actually is. Every siloed department does exactly that — solves what it can see through its own narrow window, and calls it thorough.

The instinct, once you're the one holding the fuller picture, is to protect it. Guard the access, control the narrative, stay the only person in the room who really knows. Understandable — and precisely the wrong move. Whatever you're sitting on stops being useful to anyone the moment nobody else can act on it.

Take a complaint that shows up as a low NPS score. On its own, it's a data point with no direction. Connect it to where the customer dropped out of a journey, to which internal process actually failed them, and it turns into something people can act on — often several teams at once, none of whom own the whole problem alone.

Democratising that isn't handing out dashboards nobody asked for. It's making sure the people closest to a decision have what they need to make it without waiting on you — and trusting that once they do, they'll start finding things you wouldn't have thought to look for.
```

---

## Czego NIE robisz — warunki zatrzymania

- **NIE zmieniasz nazw plików ani ścieżek URL.** Slugi zostają identyczne z dzisiejszymi, tylko `title` w treści się zmienia.
- **NIE zmieniasz pola `pillar:`** (numeru porządkowego) w żadnym pliku.
- **NIE zmieniasz pola `tags:`** w żadnym pliku.
- **NIE dodajesz z powrotem sekcji „How to" ani „Common mistakes"** — nawet w skróconej formie. Manifest jest ciągłą prozą, bez struktury podręcznikowej.
- **NIE zostawiasz wpisu o kalkulatorze CLV** (`comingSoon`) w pliku `prove-it-pays.mdx` — patrz uwaga wyżej.
- **NIE zmieniasz żadnego innego pliku** — ani strony indeksu `/loyalty-system`, ani komponentu `Toolbox`, ani `[slug]/page.tsx`. Ta karta dotyczy wyłącznie sześciu plików treści.
- **NIE zmieniasz treści artykułów blogowych** ani bloku autora pod nimi.

---

## Kryteria odbioru

1. **`git diff --stat`** — dokładnie sześć zmienionych plików, wszystkie w `src/content/loyalty-system/`.
2. **Sześć nowych tytułów obecnych dosłownie** — zweryfikuj przez wyszukanie każdego z sześciu tytułów w odpowiednim pliku.
3. **Zero wystąpień fraz „How to" i „Common mistakes"** w całym katalogu `src/content/loyalty-system/` po zmianie.
4. **Zero wystąpień usuniętych, niepotwierdzonych liczb** w całym katalogu: „70%", „34%", „19%", „2 mln EUR", „2 million". Podaj wynik wyszukiwania każdej frazy.
5. **`prove-it-pays.mdx` zawiera dokładnie jeden obiekt w `toolsJson`** — bez `comingSoon`. Podaj zawartość pola.
6. **Wynik budowania** bez błędów.
7. **Kontrola mobilna:** przy 390 px sprawdź stronę `/loyalty-system` oraz wszystkie sześć stron filarów — brak przepełnienia poziomego. Dłuższe akapity bez podziału na sekcje mogą zachowywać się inaczej niż poprzedni układ z nagłówkami; zmierz i podaj wynik dla każdej z siedmiu stron.
8. **Strona główna i blog nietknięte** — `git diff --stat` nie pokazuje żadnych zmian poza sześcioma wymienionymi plikami.

> Uwaga o budowaniu: trasy API tworzą klientów Resend i Anthropic na poziomie modułu. Podstaw atrapowe wartości zmiennych i **nie zmieniaj tych plików**.

---

## Po wykonaniu

Otwórz pull request na `main`, raport wklej w opisie. Nie scalaj — scalenie jest decyzją Adama.
