import Headings from '../../../components/ui/heading';
import * as React from 'react';
import { cn } from '#/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export function SectionTitle(props: React.ComponentProps<'h3'>) {
  const { className, ...rest } = props;
  return (
    <Headings.H2
      className={cn('mb-5 border-b border-gray-500', className)}
      {...rest}
    />
  );
}

export function SectionWrapper(props: React.ComponentProps<'section'>) {
  const { className, children, ...rest } = props;

  return (
    <section className={cn('grid grid-cols-[1fr_auto]', className)} {...rest}>
      {children}
    </section>
  );
}

export function SectionHead(props: React.ComponentProps<'h3'>) {
  const { className, children, ...rest } = props;

  return (
    <Headings.H3
      className={cn('col-span-2 col-start-1 md:col-span-1', className)}
      {...rest}>
      {children}
    </Headings.H3>
  );
}

export function SectionSubHead(props: React.ComponentProps<'p'>) {
  const { className, children, ...rest } = props;

  return (
    <p
      className={cn(
        'col-span-2 col-start-1 font-serif text-lg text-blue-600',
        className
      )}
      {...rest}>
      {children}
    </p>
  );
}

export function SectionInfo(props: React.ComponentProps<'p'>) {
  const { className, children, ...rest } = props;

  return (
    <p
      className={cn(
        'col-span-2 col-start-1 row-start-3 text-sm text-gray-300 italic md:col-span-1 md:col-start-2 md:row-start-1 md:text-right',
        className
      )}
      {...rest}>
      {children}
    </p>
  );
}

export function SectionContent(
  props: React.ComponentProps<'p'> & { asChild?: boolean }
) {
  const { className, children, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp className={cn('col-span-2 col-start-1 mt-3', className)} {...rest}>
      {children}
    </Comp>
  );
}
