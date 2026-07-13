import Spinner from './Spinner';
import { buttonVariants, buttonSizes } from './styles';

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        ${buttonVariants[variant] || buttonVariants.primary}
        ${buttonSizes[size]       || buttonSizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}