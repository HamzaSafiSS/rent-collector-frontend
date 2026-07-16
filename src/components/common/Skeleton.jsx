// Base skeleton pulse animation element
function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

// ── Table skeleton ─────────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-3.5 border-b border-slate-100"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonBox
              key={colIdx}
              className={`h-3 flex-1 ${colIdx === 0 ? 'max-w-[120px]' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Card grid skeleton ─────────────────────────────────────────────────────────
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <SkeletonBox className="w-10 h-10 rounded-lg" />
            <SkeletonBox className="w-16 h-6 rounded-full" />
          </div>
          <SkeletonBox className="h-4 w-3/4 mb-2" />
          <SkeletonBox className="h-3 w-1/2 mb-4" />
          <SkeletonBox className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

// ── Stat cards skeleton ────────────────────────────────────────────────────────
export function StatCardsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SkeletonBox className="h-2.5 w-24 mb-3" />
              <SkeletonBox className="h-8 w-20" />
            </div>
            <SkeletonBox className="w-12 h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Form skeleton ─────────────────────────────────────────────────────────────
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <SkeletonBox className="h-3 w-28 mb-2" />
          <SkeletonBox className="h-10 w-full rounded-md" />
        </div>
      ))}
      <SkeletonBox className="h-10 w-32 rounded-md mt-2" />
    </div>
  );
}

export default SkeletonBox;