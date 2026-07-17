import Spinner from './Spinner';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  className = '',
}) {
  return (
    <div className={`relative w-full overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <Spinner size="lg" />
        </div>
      )}
      <table className="w-full text-sm text-slate-700">
        {/* Header */}
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 && !loading ? (
            <tr>
              <td colSpan={columns.length} className="py-4">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-blue-50/50 transition-colors duration-150 group"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                    {col.render
                      ? col.render(row)
                      : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}