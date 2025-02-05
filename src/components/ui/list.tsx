import { cn } from '#/lib/utils';

const sharedListClass = 'list-outside space-y-1.5';

export function UnorderedList(props: React.ComponentProps<'ul'>) {
  const { children, className, ...rest } = props;

  return (
    <ul className={cn(sharedListClass, 'list-disc pl-4', className)} {...rest}>
      {children}
    </ul>
  );
}

export function OrderedList(props: React.ComponentProps<'ol'>) {
  const { children, className, ...rest } = props;

  return (
    <ol
      className={cn(sharedListClass, 'list-decimal pl-7', className)}
      {...rest}>
      {children}
    </ol>
  );
}

export function ListItem(props: React.ComponentProps<'li'>) {
  const { children, className, ...rest } = props;

  return (
    <li className={cn('[&>ul,&>ol]:pl-5', className)} {...rest}>
      {children}
    </li>
  );
}
