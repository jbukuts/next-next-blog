import { cn } from '#/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { createElement, type FC } from 'react';

const headingVariants = cva('font-pixel-serif leading-none font-bold', {
  variants: {
    level: {
      H1: 'text-5xl',
      H2: 'text-4xl',
      H3: 'text-3xl',
      H4: 'text-2.5xl',
      H5: 'text-2xl',
      H6: 'text-xl'
    }
  }
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

function Heading(props: HeadingProps) {
  const { className, level = 'H1', children, ...rest } = props;

  return createElement(
    level!.toLowerCase(),
    { ...rest, className: cn(headingVariants({ level }), className) },
    children
  );
}

type Level = NonNullable<VariantProps<typeof headingVariants>['level']>;

const Headings = (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] as Level[]).reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: (props: Omit<HeadingProps, 'level'>) => (
      <Heading {...props} level={curr as Level} />
    )
  }),
  {} as Record<Level, FC<Omit<HeadingProps, 'level'>>>
);

export default Headings;
