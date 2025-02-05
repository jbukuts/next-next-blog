import { cn } from '#/lib/utils';

export function Table(props: React.ComponentProps<'table'>) {
  const { children, className, ...rest } = props;

  return (
    <table
      className={cn(
        'table-auto border-collapse border border-gray-300',
        className
      )}
      {...rest}>
      {children}
    </table>
  );
}

export function TableHead(props: React.ComponentProps<'thead'>) {
  const { children, className, ...rest } = props;

  return (
    <thead
      className={cn('border-b border-gray-300 bg-white/25', className)}
      {...rest}>
      {children}
    </thead>
  );
}

export function TableData(props: React.ComponentProps<'td'>) {
  const { children, className, ...rest } = props;

  return (
    <td className={cn('px-3 py-2', className)} {...rest}>
      {children}
    </td>
  );
}
