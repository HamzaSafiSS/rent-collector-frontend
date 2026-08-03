import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('common.appName');
  }, [t, i18n.language]);

  return <AppRoutes />;
}