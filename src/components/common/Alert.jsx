const variants = {
  success: {
    wrapper: 'bg-green-50 border border-green-200 text-green-800',
    icon: '✓',
    iconClass: 'text-green-600',
  },
  error: {
    wrapper: 'bg-red-50 border border-red-200 text-red-800',
    icon: '✕',
    iconClass: 'text-red-600',
  },
  warning: {
    wrapper: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    icon: '⚠',
    iconClass: 'text-yellow-600',
  },
  info: {
    wrapper: 'bg-blue-50 border border-blue-200 text-blue-800',
    icon: 'i',
    iconClass: 'text-blue-600',
  },
};

export default function Alert({ type = 'info', message, className = '' }) {
  if (!message) return null;

  const v = variants[type] || variants.info;

  return (
    <div className={`flex items-start gap-3 rounded-md px-4 py-3 text-sm ${v.wrapper} ${className}`}>
      <span className={`font-bold text-base leading-none mt-0.5 ${v.iconClass}`}>
        {v.icon}
      </span>
      <span>{message}</span>
    </div>
  );
}