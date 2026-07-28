export default function StatCard({ label, value, icon, color = 'emerald', subtitle, onClick }) {
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

  const iconColors = {
    blue:    'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/25',
    green:   'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/25',
    emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/25',
    red:     'bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-red-500/25',
    yellow:  'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/25',
    purple:  'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/25',
    slate:   'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-slate-500/25',
    indigo:  'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-indigo-500/25',
    orange:  'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/25',
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#111827] to-[#1e293b] shadow-sm hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 p-6 overflow-hidden relative group ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50 rounded-bl-full -z-10 transform group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-center justify-between z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className={`text-2xl font-extrabold mt-2 tracking-tight ${textColors[color] || textColors.emerald}`}>{value ?? '—'}</p>
          {subtitle && (
            <p className="text-sm mt-2 font-medium text-slate-500">{subtitle}</p>
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