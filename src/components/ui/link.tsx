import { cn } from '#/lib/utils';
import NextLink from 'next/link';
import { createElement } from 'react';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;

export function Link(props: React.ComponentProps<'a'> & { href: string }) {
  const { children, className, href, ...rest } = props;
  const isAbsolute = href.startsWith('#') || ABSOLUTE_URL_REGEX.test(href);

  const c = cn(
    'text-primary decoration-primary/50 hover:decoration-primary/100 font-semibold underline decoration-dashed transition-all hover:decoration-solid',
    className
  );

  return createElement(
    isAbsolute ? 'a' : NextLink,
    { className: c, href, ...rest },
    children
  );
}
