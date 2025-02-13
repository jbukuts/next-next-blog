import Headings from '../../../components/ui/heading';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export function SectionTitle(props: React.ComponentProps<'h3'>) {
  const { ...rest } = props;
  return <Headings.H2 className='border-accent mb-5 border-b' {...rest} />;
}

export function SectionWrapper(props: React.ComponentProps<'section'>) {
  const { children, ...rest } = props;

  return (
    <section className='grid grid-cols-[1fr_auto]' {...rest}>
      {children}
    </section>
  );
}

export function SectionHead(props: React.ComponentProps<'h3'>) {
  const { children, ...rest } = props;

  return (
    <Headings.H3 {...rest} className='col-span-2 col-start-1 md:col-span-1'>
      {children}
    </Headings.H3>
  );
}

export function SectionSubHead(props: React.ComponentProps<'p'>) {
  const { children, ...rest } = props;

  return (
    <p
      className='text-primary col-span-2 col-start-1 font-serif text-lg'
      {...rest}>
      {children}
    </p>
  );
}

export function SectionInfo(props: React.ComponentProps<'p'>) {
  const { children, ...rest } = props;

  return (
    <p
      className='text-accentitalic col-span-2 col-start-1 row-start-3 text-sm md:col-span-1 md:col-start-2 md:row-start-1 md:text-right'
      {...rest}>
      {children}
    </p>
  );
}

export function SectionContent(
  props: React.ComponentProps<'p'> & { asChild?: boolean }
) {
  const { children, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp className='col-span-2 col-start-1 mt-3' {...rest}>
      {children}
    </Comp>
  );
}
