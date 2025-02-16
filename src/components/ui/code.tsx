import { cn } from '#/lib/utils';

export default function Code(props: React.ComponentProps<'code'>) {
  const { children, className, ...rest } = props;

  if ('data-language' in props) return <code {...props} />;

  return (
    <code
      {...rest}
      className={cn('bg-foreground/15 rounded-sm px-1 py-0.5', className)}>
      {children}
    </code>
  );
}
