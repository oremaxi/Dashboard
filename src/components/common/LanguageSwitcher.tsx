import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const lang = languages.find(l => l.code === i18n.language) || languages[0];
    setCurrentLanguage(lang);
  }, [i18n.language]);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <GlobeIcon size="sm" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card 
            variant="glass" 
            className="absolute right-0 top-full mt-2 w-48 z-50 p-2"
          >
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentLanguage.code === lang.code
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-sm font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-slate-400">{lang.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};