export default function StatCard({ label, value, icon, color = 'emerald', subtitle, onClick, isSelected = false }) {
  const textColors = {
    blue:    'text-white',
    green:   'text-white',
    emerald: 'text-white',
    red:     'text-white',
    yellow:  'text-white',
    purple:  'text-white',
    slate:   'text-white',
    indigo:  'text-white',
    orange:  'text-white',
  };

  const selectedBorders = {
    blue:    'border-sky-500 ring-2 ring-sky-500/50 shadow-lg shadow-sky-500/10',
    green:   'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10',
    emerald: 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10',
    red:     'border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-500/10',
    yellow:  'border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10',
    purple:  'border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10',
    slate:   'border-slate-400 ring-2 ring-slate-400/50 shadow-lg shadow-slate-400/10',
    indigo:  'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10',
    orange:  'border-orange-500 ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10',
  };

  const iconColors = {
    blue:    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    green:   'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    red:     'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    yellow:  'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    purple:  'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    slate:   'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    indigo:  'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    orange:  'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
  };

  const borderClass = isSelected
    ? (selectedBorders[color] || 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10')
    : 'border-slate-700/50 hover:border-slate-500/50';

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl border bg-gradient-to-br from-[#111827] to-[#1e293b] shadow-sm hover:shadow-md transition-all duration-300 p-6 overflow-hidden relative group ${borderClass} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50 rounded-bl-full -z-10 transform group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-semibold text-slate-300 tracking-wide">{label}</p>
          <p className={`text-2xl font-extrabold mt-2 tracking-tight ${textColors[color] || textColors.emerald}`}>{value ?? '—'}</p>
          {subtitle && (
            <p className="text-sm mt-2 font-medium text-slate-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300 ${iconColors[color] || iconColors.emerald}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}