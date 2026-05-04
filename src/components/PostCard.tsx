import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  const date = new Date(post.date).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <time className="text-sm text-zinc-500 dark:text-zinc-500">{date}</time>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
