export const colors = {
  primary:   'emerald',
  success:   'emerald',
  danger:    'red',
  warning:   'amber',
  neutral:   'slate',
};

// Button variant classes — Dark Mode
export const buttonVariants = {
  primary: `
    bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:from-emerald-700 active:to-emerald-600
    text-white font-semibold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200
  `,
  secondary: `
    bg-slate-800 hover:bg-slate-700 active:bg-slate-600
    text-slate-200 font-medium
    border border-slate-600/50
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  danger: `
    bg-red-600/90 hover:bg-red-600 active:bg-red-700
    text-white font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  ghost: `
    bg-transparent hover:bg-slate-800 active:bg-slate-700
    text-slate-400 hover:text-slate-200 font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  success: `
    bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700
    text-white font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
};

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

// Badge variant classes — Dark Mode
export const badgeVariants = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  danger:  'bg-red-500/15 text-red-400 border border-red-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  info:    'bg-sky-500/15 text-sky-400 border border-sky-500/25',
  neutral: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
};

// Input shared classes — Dark Mode
export const inputBase = `
  w-full px-3 py-2 text-sm text-slate-100 bg-slate-800/60 backdrop-blur-sm
  border border-slate-600/50 rounded-xl shadow-sm [color-scheme:dark]
  placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-slate-800 focus:border-emerald-500/50
  disabled:bg-slate-800/30 disabled:text-slate-500 disabled:cursor-not-allowed
  transition-all duration-200
`;

export const inputError = `
  border-red-500/60 focus:ring-red-500/50 focus:border-red-500/60
`;