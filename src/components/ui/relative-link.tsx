'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '#/lib/utils';

export default function RelativeLink(props: React.ComponentProps<typeof Link>) {
  const { children, href, className, ...rest } = props;
  const path = usePathname();

  const c = cn(
    path === href
      ? 'decoration-solid'
      : 'hover:drop-shadow-[0_0_10px_var(--color-blue-500)]',
    className
  );

  return (
    <Link className={c} href={href} {...rest}>
      {children}
    </Link>
  );
}
