import { badgeVariants } from './styles';

const STATUS_MAP = {
  // Payment status
  APPROVED:             'success',
  PENDING:              'warning',
  REJECTED:             'danger',
  UNPAID:               'danger',
  // User status
  Active:               'success',
  Suspended:            'danger',
  PendingPasswordChange:'warning',
  // Unit status
  AVAILABLE:            'success',
  OCCUPIED:             'info',
  MAINTENANCE:          'warning',
  // Lease status
  ACTIVE:               'success',
  TERMINATED:           'neutral',
};

export default function Badge({ label, variant, className = '' }) {
  const resolvedVariant = variant || STATUS_MAP[label] || 'neutral';

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${badgeVariants[resolvedVariant] || badgeVariants.neutral}
        ${className}
      `}
    >
      {label}
    </span>
  );
}