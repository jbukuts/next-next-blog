import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '#/lib/utils';

export interface CenterWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const CenterWrapper = React.forwardRef<HTMLDivElement, CenterWrapperProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn('col-start-2 px-5 md:p-0', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CenterWrapper.displayName = 'CenterWrapper';
export default CenterWrapper;
