import { cn } from '#/lib/utils';
import NextLink from 'next/link';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;

export function Link(props: React.ComponentProps<'a'> & { href: string }) {
  const { children, className, href, ...rest } = props;
  const isAbsolute = href.startsWith('#') || ABSOLUTE_URL_REGEX.test(href);

  const c = cn(
    'text-primary decoration-primary/50 hover:decoration-primary/100 font-semibold underline decoration-dashed transition-all hover:decoration-solid',
    className
  );

  if (!isAbsolute)
    <NextLink className={c} href={href} {...rest}>
      {children}
    </NextLink>;

  return (
    <a className={c} href={href} {...rest}>
      {children}
    </a>
  );
}
