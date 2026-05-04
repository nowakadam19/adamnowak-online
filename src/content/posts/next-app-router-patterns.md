---
title: "Wzorce w Next.js App Router, których używam na co dzień"
date: "2026-03-15"
excerpt: "Server Components, loading states, error boundaries — kilka wzorców, które zmieniły sposób, w jaki buduję aplikacje."
tags: ["next.js", "react", "architektura"]
---

## Server Components jako domyślne

W App Routerze każdy komponent jest domyślnie Server Component. To fundamentalna zmiana myślenia — zamiast pytać "czy ten komponent potrzebuje być serwerowy?", pytam "czy ten komponent musi być kliencki?".

Komponent musi być kliencki (`"use client"`) tylko gdy:
- używa hooków (`useState`, `useEffect`, itp.)
- obsługuje zdarzenia (klik, input)
- potrzebuje dostępu do API przeglądarki

Wszystko inne — szczególnie komponenty pobierające dane — zostaje na serwerze.

## Wzorzec: pobieranie danych bezpośrednio w komponencie

```typescript
// app/posts/page.tsx — Server Component
export default async function PostsPage() {
  const posts = await getPosts(); // bezpośrednie async/await

  return (
    <ul>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </ul>
  );
}
```

Nie potrzebuję `useEffect`, `useState`, ani żadnego stanu ładowania na poziomie komponentu.

## loading.tsx i error.tsx

Pliki `loading.tsx` i `error.tsx` w App Routerze to wbudowane Suspense boundaries i Error boundaries.

```
app/
├── posts/
│   ├── page.tsx
│   ├── loading.tsx   ← pokazuje się podczas ładowania
│   └── error.tsx     ← pokazuje się przy błędzie
```

Proste i skuteczne. Nie musisz owijać niczego ręcznie w `<Suspense>`.

## generateStaticParams dla statycznych stron

Dla bloga — gdzie posty się nie zmieniają podczas budowania — `generateStaticParams` pozwala wygenerować wszystkie strony statycznie:

```typescript
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

Zero overhead w runtime. Czyste HTML-e na CDN.
