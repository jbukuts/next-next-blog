import CenterWrapper from '#/components/center-wrapper';
import Headings from '#/components/ui/heading';
import { Link } from '#/components/ui/link';
import { POST_SORTED_DESC } from '#/lib/velite';
import { differenceInDays } from 'date-fns';
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
          className='col-span-2 col-start-1 mx-auto size-[125px] rounded-md border-3 border-blue-600 object-cover [image-rendering:pixelated] md:col-span-1 md:row-span-2 md:mx-0 md:size-[175px]'
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
            <section key={idx}>
              <Headings.H2 className='text-3xl tracking-tight'>
                <Link
                  href={`/posts/${slug}`}
                  className='text-foreground hover:decoration-foreground decoration-transparent decoration-solid hover:drop-shadow-[0_0_10px_var(--color-foreground)]'>
                  {title}
                </Link>
              </Headings.H2>
              <p className='mb-2 font-serif text-sm text-gray-300'>
                {differenceInDays(Date.now(), created)} days ago, {readingTime}{' '}
                min read
              </p>
              <p className='mb-1 tracking-tight md:border-l-4 md:border-blue-600/50 md:pl-2'>
                {excerpt}
              </p>
              <Link
                href={`/posts/${slug}`}
                className='font-serif text-sm font-normal italic'>
                read the full post
              </Link>
            </section>
          );
        })}
      </main>
    </CenterWrapper>
  );
}
