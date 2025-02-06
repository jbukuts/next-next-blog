import type { MetadataRoute } from 'next';
import { baseMetadata } from '#/lib/create-metadata';

export const dynamic = 'error';
export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: new URL('/sitemap.xml', baseMetadata.metadataBase).toString()
  };
}
