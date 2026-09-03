import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content/ebooks");

export interface PostMeta {
  slug: string;
  title: string;
  category: string;
  date: string;
}
export interface Post extends PostMeta {
  content: string;
}

export function getAllEbooks(): PostMeta[] {
  const files = fs.readdirSync(DOCS_DIR);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return { slug, ...data } as PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEbookBySlug(slug: string): Post {
  const raw = fs.readFileSync(path.join(DOCS_DIR, `${slug}.mdx`), "utf-8");
  const { data, content } = matter(raw);
  return { slug, ...data, content } as Post;
}
