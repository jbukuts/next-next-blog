import Headings from '#/components/ui/heading';
import { Link } from '#/components/ui/link';
import { formatDate } from 'date-fns';
import NextLink from 'next/link';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeSectionize from '#/lib/rehype-sectionize';
import rehypePrettyCode from 'rehype-pretty-code';
import CenterWrapper from '#/components/center-wrapper';
import { ListItem, OrderedList, UnorderedList } from '#/components/ui/list';
import remarkGfm from 'remark-gfm';
import { Table, TableData, TableHead } from '#/components/ui/table';
import { POST_SORTED_DESC, SLUG_MAP } from '#/lib/velite';
import { type Metadata } from 'next';
import siteConfig from '../../../../site.config';
import { BlogPosting, WithContext } from 'schema-dts';
import { baseMetadata } from '#/lib/create-metadata';

const { profile } = siteConfig;

export async function generateStaticParams() {
  return POST_SORTED_DESC.map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const idx = SLUG_MAP[slug];
  const { title, desc, tags } = POST_SORTED_DESC[idx];

  return {
    title,
    description: desc,
    keywords: tags,
    authors: [{ name: `${profile.firstName} ${profile.lastName}` }],
    creator: `${profile.firstName} ${profile.lastName}`,
    publisher: `${profile.firstName} ${profile.lastName}`,
    openGraph: {
      title,
      description: desc
    },
    twitter: {
      title,
      description: desc
    }
  };
}

export default async function PostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const idx = SLUG_MAP[slug];
  const post = POST_SORTED_DESC[idx];
  if (post.slug !== slug) throw new Error("Slugs don't match!");

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.desc,
    datePublished: post.created,
    dateModified: post.updated,
    timeRequired: `PT${post.readingTime}M`,
    author: {
      '@type': 'Person',
      name: `${siteConfig.profile.firstName} ${siteConfig.profile.lastName}`,
      url: baseMetadata.metadataBase.toString()
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': new URL(`/posts/${slug}`, baseMetadata.metadataBase).toString()
    },
    image: {
      '@type': 'ImageObject',
      url: new URL(siteConfig.image, baseMetadata.metadataBase).toString(),
      width: '300',
      height: '300'
    }
  };

  const element = await compileMDX({
    source: post.content,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrettyCode, { theme: 'github-dark-high-contrast' }],
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          rehypeSectionize
        ]
      }
    },
    components: {
      h1: () => null,
      h2: Headings.H2,
      h3: Headings.H3,
      h4: Headings.H4,
      h5: Headings.H5,
      h6: Headings.H6,
      a: Link,
      ul: UnorderedList,
      ol: OrderedList,
      li: ListItem,
      table: Table,
      thead: TableHead,
      td: TableData,
      th: TableData,
      FlexContainer: ({ children }: { children: React.ReactNode }) => (
        <div className='flex flex-col items-center gap-5 md:flex-row md:justify-center'>
          {children}
        </div>
      )
    }
  });

  return (
    <CenterWrapper asChild>
      <main className={`flex flex-col gap-5`}>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className='prose-headings:border-b-2 prose-h1:border-none prose-headings:border-accent prose-headings:[&>a]:hover:drop-shadow-none prose-headings:[&>a]:text-foreground prose-headings:[&>a]:no-underline prose-headings:[&>a]:hover:after:content-["#"] [&_pre]:border-accent space-y-6 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border-2 [&_pre]:py-4 [&_pre]:text-sm [&_pre_[data-line]]:px-4 [&_section]:space-y-6'>
          <Headings.H1 style={{ margin: 0 }}>{post.title}</Headings.H1>
          <p className='mb-5 font-serif'>
            <time dateTime={formatDate(post.created, 'yyyy-MM-dd')}>
              {formatDate(post.created, 'LLL d yyyy')}
            </time>
          </p>

          {element.content}
        </article>

        <nav className='grid grid-cols-2 gap-5'>
          {[idx + 1, idx - 1].map((i) => {
            const p = POST_SORTED_DESC[i];
            if (!p) return <span key={i} />;

            return (
              <NextLink
                key={p.slug}
                href={p.slug}
                className='group border-accent flex flex-col rounded-lg border p-4 leading-tight'>
                <span className='group-hover:underline'>
                  {i > idx ? 'Previous' : 'Next'} Post
                </span>
                <span className='text-accent text-sm group-hover:underline'>
                  {p.title}
                </span>
                <time
                  className='text-primary mt-1 text-xs tracking-tighter group-hover:underline'
                  dateTime={formatDate(p.created, 'yyyy-MM-dd')}>
                  {formatDate(p.created, 'MMM dd yy')}
                </time>
              </NextLink>
            );
          })}
        </nav>
      </main>
    </CenterWrapper>
  );
}
