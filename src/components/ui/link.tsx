'use client';

import { cn } from '#/lib/utils';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;

export function Link(props: React.ComponentProps<'a'> & { href: string }) {
  const { children, className, href, ...rest } = props;
  const path = usePathname();
  const isAbsolute = href.startsWith('#') || ABSOLUTE_URL_REGEX.test(href);

  const c = cn(
    'font-semibold text-blue-600 underline decoration-dashed drop-shadow-[0_0_10px_transparent] transition-all hover:decoration-solid',
    !isAbsolute && path === href
      ? 'decoration-solid'
      : 'hover:drop-shadow-[0_0_10px_var(--color-blue-500)]',
    className
  );

  if (isAbsolute)
    return (
      <a className={c} href={href} {...rest}>
        {children}
      </a>
    );

  return (
    <NextLink className={c} href={href} {...rest}>
      {children}
    </NextLink>
  );
}
