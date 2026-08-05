const variants = {
  success: {
    wrapper: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
    icon: '✓',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    wrapper: 'bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300',
    icon: '✕',
    iconClass: 'text-red-600 dark:text-red-400',
  },
  warning: {
    wrapper: 'bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300',
    icon: '⚠',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    wrapper: 'bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300',
    icon: 'i',
    iconClass: 'text-sky-600 dark:text-sky-400',
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