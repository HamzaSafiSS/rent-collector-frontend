// Base skeleton pulse animation element
function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

// ── Table skeleton ─────────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full relative overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      {/* Header */}
      <div className="flex gap-6 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className="h-3 flex-1 rounded-full" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-6 px-6 py-5"
          >
            {Array.from({ length: cols }).map((_, colIdx) => (
              <SkeletonBox
                key={colIdx}
                className={`h-3 flex-1 rounded-full ${colIdx === 0 ? 'max-w-[120px]' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card grid skeleton ─────────────────────────────────────────────────────────
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <SkeletonBox className="w-12 h-12 rounded-xl" />
            <SkeletonBox className="w-16 h-6 rounded-full" />
          </div>
          <SkeletonBox className="h-5 w-3/4 mb-3 rounded-full" />
          <SkeletonBox className="h-3 w-1/2 mb-5 rounded-full" />
          <SkeletonBox className="h-3 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Stat cards skeleton ────────────────────────────────────────────────────────
export function StatCardsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SkeletonBox className="h-3 w-24 mb-4 rounded-full" />
              <SkeletonBox className="h-10 w-24 rounded-lg" />
            </div>
            <SkeletonBox className="w-14 h-14 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Form skeleton ─────────────────────────────────────────────────────────────
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <SkeletonBox className="h-3 w-28 mb-2.5 rounded-full" />
          <SkeletonBox className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <SkeletonBox className="h-12 w-32 rounded-xl mt-4" />
    </div>
  );
}

export default SkeletonBox;