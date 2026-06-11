import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { marked } from "marked";

// Blog posts are markdown files committed by the Blog-Blast auto-blog pipeline
// (see teddyk28/Blog-Blast → AUTOBLOG.md). Filenames: YYYY-MM-DD-slug.md
const rawPosts = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

interface BlogPostData {
  slug: string;
  date: string;
  title: string;
  description: string;
  body: string;
}

function parseFrontmatterValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) {
    try {
      return JSON.parse(trimmed) as string;
    } catch {
      return trimmed.replace(/^"|"$/g, "");
    }
  }
  return trimmed;
}

function parsePost(path: string, raw: string): BlogPostData | null {
  const file = path.split("/").pop() ?? "";
  const m = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(file);
  if (!m) return null;
  const [, date, slug] = m;

  const fm: Record<string, string> = {};
  let body = raw;
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (fmMatch) {
    body = raw.slice(fmMatch[0].length);
    for (const line of fmMatch[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx > 0) fm[line.slice(0, idx).trim()] = parseFrontmatterValue(line.slice(idx + 1));
    }
  }

  return {
    slug,
    date: fm.date || date,
    title: fm.title || slug.replace(/-/g, " "),
    description: fm.description || "",
    body,
  };
}

const posts: BlogPostData[] = Object.entries(rawPosts)
  .map(([path, raw]) => parsePost(path, raw))
  .filter((p): p is BlogPostData => p !== null)
  .sort((a, b) => b.date.localeCompare(a.date));

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content;
    if (meta && description) meta.content = description;
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== undefined) meta.content = prevDesc;
    };
  }, [title, description]);
}

export function BlogIndex() {
  usePageMeta("Blog", "Tips, guides, and news from our team.");
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">Tips, guides, and news from our team.</p>
      {posts.length === 0 && <p className="text-muted-foreground">No posts yet — check back soon.</p>}
      <div className="space-y-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <a className="block rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">{formatDate(post.date)}</p>
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              {post.description && <p className="text-muted-foreground">{post.description}</p>}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const post = posts.find((p) => p.slug === params?.slug);
  usePageMeta(post ? post.title : "Post not found", post?.description ?? "");

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <Link href="/blog">
          <a className="underline">← Back to the blog</a>
        </Link>
      </div>
    );
  }

  const html = marked.parse(post.body, { async: false }) as string;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/blog">
        <a className="text-sm text-muted-foreground underline">← Back to the blog</a>
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">{formatDate(post.date)}</p>
      <article
        className="mt-2 leading-relaxed [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:underline [&_strong]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
