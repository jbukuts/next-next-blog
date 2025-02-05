import Image from 'next/image';
import CenterWrapper from './center-wrapper';
import {
  Github,
  Linkedin,
  LucideIcon,
  Mail,
  Rss,
  SquareCode
} from 'lucide-react';
import { cn } from '#/lib/utils';
import { Link } from './ui/link';
import siteConfig from '../../site.config';

const { profile } = siteConfig;
const CURRENT_YEAR = new Date().getFullYear();

const LINKS = [
  {
    title: 'My email',
    href: `mail:${profile.emailAddress}`,
    icon: Mail
  },
  {
    title: 'Source code',
    href: `${profile.gitHubURL}/next-blog`,
    icon: SquareCode
  },
  {
    title: 'RSS feed',
    href: '/rss.xml',
    icon: Rss
  },
  {
    title: 'My GitHub',
    href: profile.gitHubURL,
    icon: Github,
    fill: true
  },
  {
    title: 'My LinkedIn',
    href: profile.linkedInURL,
    icon: Linkedin,
    fill: true
  }
];

const BUILT_WITH = [
  {
    href: 'https://nextjs.org/docs',
    text: 'Next.js'
  },
  {
    href: 'https://tailwindcss.com/',
    text: 'TailwindCSS'
  },
  {
    href: 'https://mdxjs.com/',
    text: 'MDX'
  },
  {
    href: 'https://docs.github.com/en/rest',
    text: 'GitHub API'
  }
];

function IconLink(
  props: Omit<React.ComponentProps<'a'>, 'children'> & {
    children: React.ReactElement<LucideIcon>;
  }
) {
  const { children, className, ...rest } = props;

  return (
    <a
      {...rest}
      className={cn(
        'box-content rounded-md border-2 border-transparent p-1.5 transition-all hover:cursor-pointer hover:border-blue-500/50 hover:text-blue-500 hover:drop-shadow-[0_0_10px_var(--color-blue-500)] [&>*]:opacity-85 hover:[&>*]:opacity-100',
        className
      )}>
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <CenterWrapper asChild>
      <footer className='my-4 flex h-fit flex-col gap-5 tracking-tight'>
        <div className='flex flex-col items-center justify-between gap-3 md:flex-row md:items-start'>
          <div className='flex flex-col items-center gap-3 md:flex-row md:items-start'>
            <Image
              src={'/me.webp'}
              width={100}
              height={100}
              alt='me'
              className='size-[100px] rounded-md border-2 border-white object-cover [image-rendering:pixelated]'
            />
            <div className='text-center md:text-left'>
              <p className='mb-1.5 font-semibold'>It&apos;s me again</p>
              <p className='text-sm'>
                Thanks for reading.
                <br />
                If you&apos;d like updates subscribe via RSS.
                <br />I try to create new posts <s>weekly</s> whenever.
              </p>
            </div>
          </div>
          <div className='flex flex-col text-center md:text-right'>
            <p className='mb-1.5 font-semibold'>Built using</p>
            {BUILT_WITH.map(({ href, text }, idx) => (
              <Link
                href={href}
                key={idx}
                className='text-sm'
                target='_blank'
                rel='noreferrer'>
                {text}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center md:flex-row md:justify-between'>
          <nav className='flex gap-0.5'>
            {LINKS.map(({ icon: Icon, fill, ...rest }, idx) => (
              <IconLink key={idx} {...rest} target='_blank' rel='noreferrer'>
                <Icon {...(fill ? { fill: 'currentColor' } : {})} />
              </IconLink>
            ))}
          </nav>
          <p className='text-sm'>
            © {CURRENT_YEAR} {profile.firstName} {profile.lastName} •
            Over-Engineered Blog
          </p>
        </div>
      </footer>
    </CenterWrapper>
  );
}
