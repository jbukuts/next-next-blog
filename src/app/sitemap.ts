import type { MetadataRoute } from 'next';
import { posts } from '#velite';
import { baseMetadata } from '#/lib/create-metadata';

const { metadataBase } = baseMetadata;

export const dynamic = 'error';
export const revalidate = false;

/**
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  return [
    {
      url: new URL('/', metadataBase).toString(),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 1,
      images: [new URL('/me.webp', metadataBase).toString()]
    },
    {
      url: new URL('/projects', metadataBase).toString(),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: new URL('/work-history', metadataBase).toString(),
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    ...posts.map((post) => ({
      url: new URL(`/posts/${post.slug}`, metadataBase).toString(),
      lastModified: new Date(post.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];
}
