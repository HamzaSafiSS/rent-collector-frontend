import { useTranslation } from 'react-i18next';

function EthiopiaFlag({ className = "w-5 h-3.5 rounded-sm overflow-hidden shadow-sm inline-block shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="133.33" fill="#078930" />
      <rect y="133.33" width="600" height="133.33" fill="#FCD116" />
      <rect y="266.66" width="600" height="133.34" fill="#DA121A" />
      <circle cx="300" cy="200" r="75" fill="#0F47AF" />
      <polygon points="300,138 314,183 358,183 322,209 336,254 300,227 264,254 278,209 242,183 286,183" fill="#FCD116" />
    </svg>
  );
}

function UkFlag({ className = "w-5 h-3.5 rounded-sm overflow-hidden shadow-sm inline-block shrink-0" }) {
  return (
    <svg className={className} viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="300" fill="#012169" />
      <path d="M0 0L600 300M600 0L0 300" stroke="#FFFFFF" strokeWidth="60" />
      <path d="M0 0L600 300M600 0L0 300" stroke="#C8102E" strokeWidth="20" />
      <path d="M300 0V300M0 150H600" stroke="#FFFFFF" strokeWidth="100" />
      <path d="M300 0V300M0 150H600" stroke="#C8102E" strokeWidth="60" />
    </svg>
  );
}

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
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700/80 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-400 shadow-sm"
      title={currentLang === 'en' ? 'ወደ አማርኛ ቀይር' : 'Switch to English'}
      aria-label={currentLang === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <span className="flex items-center" aria-hidden="true">
        {currentLang === 'en' ? <UkFlag /> : <EthiopiaFlag />}
      </span>
      <span className="tracking-wider">{currentLang === 'en' ? 'EN' : 'አማ'}</span>
    </button>
  );
}
