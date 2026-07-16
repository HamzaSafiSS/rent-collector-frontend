import { buttonVariants, buttonSizes } from './styles';
import Spinner from './Spinner';

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, className = '',
  disabled, type = 'button', ...props
}) {
  const variantClass = buttonVariants[variant] || buttonVariants.primary;
  const sizeClass    = buttonSizes[size]       || buttonSizes.md;
  const widthClass   = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <Spinner size="sm" aria-hidden="true" />
      )}
      {loading ? (
        <span className="sr-only">Loading...</span>
      ) : null}
      {children}
    </button>
  );
}