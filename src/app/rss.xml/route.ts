import { Feed } from 'feed';
import siteConfig from '../../../site.config';
import { baseMetadata } from '#/lib/create-metadata';
import { POST_SORTED_DESC } from '#/lib/velite';

const { profile, siteDescription, siteTitle } = siteConfig;
const { metadataBase } = baseMetadata;

export const dynamic = 'force-static';

export async function GET() {
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: metadataBase.toString(),
    link: metadataBase.toString(),
    language: 'en',
    image: new URL(siteConfig.image, metadataBase).toString(),
    favicon: new URL('/favicon.ico', metadataBase).toString(),
    copyright: `${new Date().getFullYear()} ${profile.firstName} ${profile.lastName}`,
    author: {
      name: `${profile.firstName} ${profile.lastName}`,
      email: siteConfig.profile.emailAddress,
      link: siteConfig.profile.linkedInURL
    }
  });

  POST_SORTED_DESC.forEach((post) => {
    const { title, desc, tags, created, slug } = post;

    feed.addItem({
      title,
      id: new URL(`/posts/${slug}`, metadataBase).toString(),
      link: new URL(`/posts/${slug}`, metadataBase).toString(),
      description: desc,
      date: new Date(created),
      category: tags.map((t) => ({ name: t }))
    });
  });

  feed.addCategory('Development');
  const xml = feed.rss2();

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' }
  });
}
