import { cn } from '#/lib/utils';
import NextLink from 'next/link';
import RelativeLink from './relative-link';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;

export const sharedClassName =
  'font-semibold text-blue-600 underline decoration-dashed drop-shadow-[0_0_10px_transparent] transition-all hover:decoration-solid';

export function Link(props: React.ComponentProps<'a'> & { href: string }) {
  const { children, className, href, ...rest } = props;
  const isAbsolute = href.startsWith('#') || ABSOLUTE_URL_REGEX.test(href);

  const c = cn(
    sharedClassName,
    'hover:drop-shadow-[0_0_10px_var(--color-blue-500)]',
    className
  );

  if (!isAbsolute)
    return <RelativeLink {...{ ...props, className: c }}></RelativeLink>;

  return (
    <NextLink className={c} href={href} {...rest}>
      {children}
    </NextLink>
  );
}
