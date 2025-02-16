import { cn } from '#/lib/utils';

export default function Blockquote(props: React.ComponentProps<'blockquote'>) {
  const { children, className, ...rest } = props;

  return (
    <blockquote
      className={cn('border-foreground border-l-4 pl-2 italic', className)}
      {...rest}>
      {children}
    </blockquote>
  );
}
