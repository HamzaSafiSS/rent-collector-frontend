export default function StatCard({ label, value, icon, color = 'blue', subtitle, onClick }) {
  const textColors = {
    blue:   'text-slate-800',
    green:  'text-slate-800',
    red:    'text-slate-800',
    yellow: 'text-slate-800',
    purple: 'text-slate-800',
    slate:  'text-slate-800',
  };

  const iconColors = {
    blue:   'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
    green:  'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30',
    red:    'bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-red-500/30',
    yellow: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/30',
    purple: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    slate:  'bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-slate-500/30',
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 p-6 overflow-hidden relative group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent opacity-50 rounded-bl-full -z-10 transform group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-center justify-between z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`text-3xl font-extrabold mt-2 tracking-tight ${textColors[color] || textColors.blue}`}>{value ?? '—'}</p>
          {subtitle && (
            <p className="text-sm mt-2 font-medium text-slate-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300 ${iconColors[color] || iconColors.blue}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}