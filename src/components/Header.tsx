import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl px-4 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
        >
          Adam Nowak
        </Link>
        <nav className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
