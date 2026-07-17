export const colors = {
  primary:   'blue',
  success:   'green',
  danger:    'red',
  warning:   'yellow',
  neutral:   'slate',
};

// Button variant classes
export const buttonVariants = {
  primary: `
    bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600
    text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-200
  `,
  secondary: `
    bg-white hover:bg-slate-50 active:bg-slate-100
    text-slate-700 font-medium
    border border-slate-300
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  danger: `
    bg-red-600 hover:bg-red-700 active:bg-red-800
    text-white font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  ghost: `
    bg-transparent hover:bg-slate-100 active:bg-slate-200
    text-slate-600 font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
  success: `
    bg-green-600 hover:bg-green-700 active:bg-green-800
    text-white font-medium
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  `,
};

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

// Badge variant classes
export const badgeVariants = {
  success: 'bg-green-100 text-green-800 border border-green-200',
  danger:  'bg-red-100  text-red-800  border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info:    'bg-blue-100 text-blue-800 border border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
};

// Input shared classes
export const inputBase = `
  w-full px-4 py-3 text-sm text-slate-900 bg-white/80 backdrop-blur-sm
  border border-slate-300/80 rounded-xl shadow-sm
  placeholder-slate-400
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent
  disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
  transition-all duration-200
`;

export const inputError = `
  border-red-400 focus:ring-red-500 focus:border-red-500
`;