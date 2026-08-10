import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent-500 hover:bg-accent-600 active:bg-accent-600',
    'text-white',
    'shadow-accent-sm hover:shadow-accent-md',
    'border border-accent-400/20',
  ].join(' '),
  secondary: [
    'bg-white/[0.06] hover:bg-white/[0.10] active:bg-white/[0.08]',
    'text-white',
    'border border-white/[0.08]',
  ].join(' '),
  ghost: [
    'bg-transparent hover:bg-white/[0.05] active:bg-white/[0.03]',
    'text-white/70 hover:text-white',
  ].join(' '),
  gold: [
    'bg-gradient-gold hover:brightness-110 active:brightness-95',
    'text-cinema-950',
    'font-bold',
    'shadow-gold-sm hover:shadow-gold-md',
    'border border-gold-300/20',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'font-semibold tracking-wide',
          'transition-all duration-200 ease-out',
          'cursor-pointer select-none',
          'outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-900',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Disabled
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
