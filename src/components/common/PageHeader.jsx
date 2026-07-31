export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">{actions}</div>
      )}
    </div>
  );
}