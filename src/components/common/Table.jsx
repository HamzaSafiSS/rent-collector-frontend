import Spinner from './Spinner';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  className = '',
}) {
  return (
    <div className={`relative overflow-x-auto rounded-lg border border-slate-200 ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <Spinner size="lg" />
        </div>
      )}
<div className={`relative w-full overflow-x-auto rounded-lg border border-slate-200 ${className}`}>
      <table className="w-full text-sm text-slate-700">
        {/* Header */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
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
                <td colSpan={columns.length} className="py-2">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-3xl mb-3">📭</p>
                    <p className="text-sm text-slate-400">{emptyMessage}</p>
                  </div>
                </td>
          </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-slate-50 transition-colors duration-75"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
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
    </div>
  );
}