import type { MetadataRoute } from 'next';
import { baseMetadata } from '#/lib/create-metadata';

export const dynamic = 'error';
export const revalidate = false;

/**
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: new URL('/sitemap.xml', baseMetadata.metadataBase).toString()
  };
}
