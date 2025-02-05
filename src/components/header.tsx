'use client';

import Image from 'next/image';
import { Link } from './ui/link';
import CenterWrapper from './center-wrapper';
import Headings from './ui/heading';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

const SLUG_MAP: Record<string, string> = {
  '/': 'Blog',
  '/projects': 'Projects',
  '/work-history': 'Resume'
};

export default function Header() {
  const pathname = usePathname();

  return (
    <CenterWrapper asChild>
      <header className='flex flex-col'>
        <div className='my-4 flex items-end justify-between'>
          <NextLink href={'/'}>
            <Image
              src={'/name-chrome.webp'}
              width={250}
              height={100}
              className='invert'
              alt='jbukuts'
            />
          </NextLink>

          {SLUG_MAP[pathname] && (
            <Headings.H1 className='mb-4 text-blue-600'>
              {SLUG_MAP[pathname]}
            </Headings.H1>
          )}
        </div>
        <nav className='flex gap-2'>
          <Link href={'/'}>blog</Link>
          <Link href={'/projects'}>projects</Link>
          <Link href={'/work-history'}>resume</Link>
        </nav>
      </header>
    </CenterWrapper>
  );
}
