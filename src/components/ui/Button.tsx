import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'luxury';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-[var(--color-brand-dark)] text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dark)]/90",
      outline: "border border-[var(--color-brand-dark)] bg-transparent hover:bg-[var(--color-brand-dark)] hover:text-[var(--color-brand-light)]",
      ghost: "hover:bg-[var(--color-brand-dark)]/10 text-[var(--color-brand-dark)]",
      luxury: "bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent-hover)] uppercase tracking-widest text-xs font-semibold shadow-lg shadow-[var(--color-brand-accent)]/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
    };
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
