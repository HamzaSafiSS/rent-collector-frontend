import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';

// Props:
//   navItems — array of { label, to, icon }
//   portalLabel — e.g. "Super Admin", "Landlord"
//   children — page content

export default function PortalLayout({ navItems, portalLabel, children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const toast            = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Brand */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-800/50">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-tight">Rent Collector</p>
            <p className="text-blue-400 font-medium text-xs tracking-wide uppercase mt-0.5">{portalLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
              `}
            >
              <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${item.to === window.location.pathname ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold uppercase shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4 flex items-center gap-3 lg:px-8 sticky top-0 z-20 shadow-sm">
        {/* Hamburger — visible only on mobile */}
        <button className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title on mobile */}
        <span className="lg:hidden font-bold text-slate-800 text-lg tracking-tight flex-1">
          Rent Collector
        </span>

        <div className="hidden lg:flex flex-1" />

        <div className="hidden lg:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{portalLabel}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}