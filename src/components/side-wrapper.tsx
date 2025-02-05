import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '#/lib/utils';

export interface SideWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  side: 'left' | 'right';
}

const SideWrapper = React.forwardRef<HTMLDivElement, SideWrapperProps>(
  ({ className, asChild = false, side, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn(
          'px-5 md:p-0',
          side === 'left' ? 'col-start-1' : 'col-start-3',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

SideWrapper.displayName = 'CenterWrapper';
export default SideWrapper;
