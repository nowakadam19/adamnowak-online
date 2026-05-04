import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <section className="mb-16">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Cześć, jestem Adam.
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Piszę o programowaniu, architekturze aplikacji webowych i rzemiośle inżynierskim.
          Znajdziesz tu notatki, przemyślenia i rzeczy, które uznaję za warte zapisania.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-6">
          Ostatnie wpisy
        </h2>
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        {posts.length > 0 && (
          <div className="mt-10">
            <Link
              href="/blog"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Wszystkie wpisy →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
