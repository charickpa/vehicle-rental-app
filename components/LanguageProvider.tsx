'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DRIVERENT_STORAGE_KEYS } from '@/types/database';

export type Language = 'th' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (th: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  setLang: () => {},
  toggleLang: () => {},
  t: (th) => th,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('th');

  useEffect(() => {
    const saved = (localStorage.getItem(DRIVERENT_STORAGE_KEYS.language) ||
      localStorage.getItem('charick_lang')) as Language | null;
    if (saved === 'th' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(DRIVERENT_STORAGE_KEYS.language, newLang);
  };

  const toggleLang = () => {
    const next = lang === 'th' ? 'en' : 'th';
    setLang(next);
  };

  const t = (th: string, en: string) => (lang === 'th' ? th : en);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
