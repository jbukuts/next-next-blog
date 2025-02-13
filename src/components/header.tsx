'use client';

import Image from 'next/image';
import { Link } from './ui/link';
import CenterWrapper from './center-wrapper';
import NextLink from 'next/link';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger
} from './ui/select';
import { PaintBucket } from 'lucide-react';
import siteConfig from '../../site.config';
import { useEffect, useState } from 'react';

const {
  profile: { firstName, lastName }
} = siteConfig;

function ThemeSelect() {
  const { themes, theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(v) => setTheme(v)}>
      <SelectTrigger
        className='size-fit border-transparent p-1 focus:ring-0'
        showIcon={false}>
        <PaintBucket />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Theme</SelectLabel>
          {themes.map((t) => (
            <SelectItem className='capitalize' key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CenterWrapper asChild>
      <header className='flex flex-col'>
        <div className='my-4 flex items-start justify-between'>
          <h1>
            <NextLink href={'/'}>
              <Image
                id='header-name'
                src={'/name-chrome.webp'}
                width={200}
                height={100}
                className='w-[150px] sm:w-[200px]'
                alt={`${firstName} ${lastName}`}
              />
            </NextLink>
          </h1>
          {mounted && <ThemeSelect />}
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
