export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 text-sm text-zinc-500 dark:text-zinc-500">
        © {new Date().getFullYear()} Adam Nowak
      </div>
    </footer>
  );
}
