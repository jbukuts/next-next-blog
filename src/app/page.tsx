import CenterWrapper from '#/components/center-wrapper';
import Headings from '#/components/ui/heading';
import { Link } from '#/components/ui/link';
import { POST_SORTED_DESC } from '#/lib/velite';
import { differenceInDays, formatDate } from 'date-fns';
import Image from 'next/image';
import React from 'react';
import siteConfig from '../../site.config';

export default async function Home() {
  return (
    <CenterWrapper>
      <aside className='mb-10 grid grid-cols-[auto_1fr] gap-3 md:gap-y-0'>
        <Image
          src={'/me.webp'}
          width={200}
          height={200}
          alt='me'
          fetchPriority='high'
          loading='eager'
          className='profile-image border-primary col-span-2 col-start-1 mx-auto size-[125px] rounded-md border-3 object-cover [image-rendering:pixelated] md:col-span-1 md:row-span-2 md:mx-0 md:size-[175px]'
        />
        <Headings.H2 className='col-span-2 col-start-1 text-center md:col-span-1 md:col-start-2 md:row-start-1 md:text-left'>
          Hi, I&apos;m Jake
        </Headings.H2>
        <p className='col-span-2 col-start-1 space-y-2 text-center md:col-span-1 md:col-start-2 md:text-left'>
          {siteConfig.profile.bio}
        </p>
      </aside>
      <main className='flex flex-col gap-10'>
        {POST_SORTED_DESC.map(async (p, idx) => {
          const { title, excerpt, readingTime, created, slug } = p;

          return (
            <article key={idx}>
              <header>
                <Headings.H2 className='text-3xl tracking-tight'>
                  <Link
                    href={`/posts/${slug}`}
                    className='text-foreground no-underline'>
                    {title}
                  </Link>
                </Headings.H2>
                <p className='text-accent mb-2 space-x-2 font-serif text-sm'>
                  <time dateTime={formatDate(created, 'yyyy-MM-dd')}>
                    {differenceInDays(Date.now(), created)} days ago
                  </time>
                  <time dateTime={`PT${readingTime}M`}>
                    {readingTime} min read
                  </time>
                </p>
              </header>
              <p className='tracking-tighter'>{excerpt}</p>
              <footer>
                <Link
                  href={`/posts/${slug}`}
                  className='font-serif text-sm font-normal italic'>
                  read the full post
                </Link>
              </footer>
            </article>
          );
        })}
      </main>
    </CenterWrapper>
  );
}
