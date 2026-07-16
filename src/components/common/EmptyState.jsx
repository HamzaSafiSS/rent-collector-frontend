import Button from './Button';

const PRESETS = {
  properties: { icon: '🏗️', title: 'No properties yet',    subtitle: 'Add your first property to get started.' },
  units:      { icon: '🚪', title: 'No units yet',         subtitle: 'Add units to this property.' },
  tenants:    { icon: '👥', title: 'No tenants yet',       subtitle: 'Tenants are created when you assign a lease.' },
  leases:     { icon: '📄', title: 'No leases found',      subtitle: 'Create a new lease to onboard a tenant.' },
  payments:   { icon: '💳', title: 'No payments found',    subtitle: 'Payments will appear here once tenants upload them.' },
  admins:     { icon: '👤', title: 'No admins yet',        subtitle: 'Create the first admin account.' },
  audit:      { icon: '📋', title: 'No audit entries',     subtitle: 'Actions will be recorded here as users interact with the platform.' },
  search:     { icon: '🔍', title: 'No results found',     subtitle: 'Try adjusting your filters or search terms.' },
  generic:    { icon: '📭', title: 'Nothing here yet',     subtitle: 'Data will appear here once available.' },
};

export default function EmptyState({
  type = 'generic',
  title,
  subtitle,
  action,
  actionLabel,
}) {
  const preset = PRESETS[type] || PRESETS.generic;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-5xl mb-4" role="img" aria-label={preset.title}>
        {preset.icon}
      </p>
      <h3 className="text-base font-semibold text-slate-700 mb-1">
        {title || preset.title}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {subtitle || preset.subtitle}
      </p>
      {action && actionLabel && (
        <Button className="mt-5" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
export { default as EmptyState } from './EmptyState';