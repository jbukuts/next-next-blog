import { cn } from '#/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md bg-gradient-to-tl from-black/45 to-transparent px-2 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-900',
        success: 'bg-green-500 text-gray-100',
        warning: 'bg-yellow-400 text-gray-100',
        error: 'bg-red-500 text-gray-100',
        info: 'bg-blue-500 text-gray-100'
      },
      type: {
        default: '',
        outline: 'border bg-transparent text-gray-100'
      }
    },
    defaultVariants: {
      type: 'default',
      variant: 'info'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export default function Badge(props: BadgeProps) {
  const { className, variant, type, children, ...rest } = props;

  return (
    <div className={cn(badgeVariants({ variant, type }), className)} {...rest}>
      {children}
    </div>
  );
}
