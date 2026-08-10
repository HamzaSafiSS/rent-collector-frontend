import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfileModal from './ProfileModal';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

// Props:
//   navItems — array of { label, to, icon }
//   portalLabel — e.g. "Super Admin", "Landlord"
//   children — page content

export default function PortalLayout({ navItems, portalLabel, children }) {
  const { t }            = useTranslation();
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const toast            = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success(t('common.loggedOutSuccess'));
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen bg-[#F8FAFB] dark:bg-[#0b1120] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#0a0f1e] flex flex-col shadow-lg dark:shadow-2xl border-r border-slate-200 dark:border-slate-800/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Brand */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-200 dark:border-slate-800/50">
          <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21V7L10 3V21" fill="#10b981" />
            <path d="M10 21V9L21 9V21" stroke="currentColor" className="text-[#1A2B3C] dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 21V15H17V21" stroke="currentColor" className="text-[#1A2B3C] dark:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[#1A2B3C] dark:text-white font-bold text-base tracking-tight">{t('common.appName')}</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm tracking-wide capitalize mt-0.5">{portalLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#E6F4EA] dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-500/5 hover:text-slate-800 dark:hover:text-slate-200 border-l-2 border-transparent'}
              `}
            >
              <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${item.to === window.location.pathname ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#080d1a]">
          <div 
            className="flex items-center gap-3 px-2 py-2 mb-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
            onClick={() => setProfileOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase shrink-0 border border-emerald-500/30">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-white transition-all duration-200 border border-slate-200 dark:border-slate-700/50"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">🚪</span>
            {t('common.signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 dark:bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

      <header className="bg-white/90 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 px-4 py-4 flex items-center gap-3 lg:px-8 sticky top-0 z-20">
        {/* Hamburger — visible only on mobile */}
        <button className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title on mobile */}
        <span className="lg:hidden font-bold text-[#1A2B3C] dark:text-white text-lg tracking-tight flex-1">
          {t('common.appName')}
        </span>

        <div className="hidden lg:flex flex-1" />

        {/* Language Toggle + Theme Toggle in header */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />

          <div 
            className="hidden lg:flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
            onClick={() => setProfileOpen(true)}
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{portalLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}