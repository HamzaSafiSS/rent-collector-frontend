import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('am') ? 'am' : 'en';

  function toggle() {
    const next = currentLang === 'en' ? 'am' : 'en';
    i18n.changeLanguage(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border border-slate-700/50 hover:bg-slate-800/60 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400"
      title={currentLang === 'en' ? 'ወደ አማርኛ ቀይር' : 'Switch to English'}
      aria-label={currentLang === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <span className="text-sm" aria-hidden="true">
        {currentLang === 'en' ? '🇬🇧' : '🇪🇹'}
      </span>
      <span>{currentLang === 'en' ? 'EN' : 'አማ'}</span>
    </button>
  );
}
