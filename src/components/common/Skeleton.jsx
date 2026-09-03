import Spinner from './Spinner';

// Base spinner wrapper for consistency
export function SkeletonBox({ className = '' }) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Spinner size="md" />
    </div>
  );
}

// ── Table skeleton (fallback to circular spinner) ───────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full flex items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
      <Spinner size="lg" />
    </div>
  );
}

// ── Card grid skeleton (fallback to circular spinner) ───────────────────────
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="w-full flex items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
      <Spinner size="lg" />
    </div>
  );
}

// ── Stat cards skeleton (fallback to circular spinner) ──────────────────────
export function StatCardsSkeleton({ count = 6 }) {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

// ── Form skeleton (fallback to circular spinner) ────────────────────────────
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="w-full flex items-center justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}

export default SkeletonBox;