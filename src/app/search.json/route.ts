import { posts } from '#velite';
import MiniSearch from 'minisearch';

export interface SearchItem {
  id: string;
  title: string;
  level: number;
  heading: string;
  content: string;
  link: string;
}

const REGEX =
  /^(#{1,6})\s+(.+?)(?:\r?\n((?:(?!^#{1,6}\s).*(?:\r?\n|$))*))?(?=^#{1,6}\s|$)/gm;

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const data: SearchItem[] = posts.flatMap((post) => {
    const { title, slug, content: markdown, tags } = post;

    const matches = [];

    let match;
    while ((match = REGEX.exec(markdown)) !== null) {
      const [, hashes, heading, content] = match;

      matches.push({
        id: crypto.randomUUID(),
        title,
        tags,
        heading,
        level: hashes.length,
        content,
        link: `/posts/${slug}`
      });
    }

    return matches;
  });

  const minisearch = new MiniSearch<SearchItem>({
    fields: ['title', 'content', 'heading'],
    storeFields: ['title', 'heading', 'link', 'tags']
  });

  minisearch.addAll(data);
  return Response.json(minisearch.toJSON());
}
