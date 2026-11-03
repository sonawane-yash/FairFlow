import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light';
export type FontSizeScale = 'standard' | 'medium' | 'large' | 'xlarge';
export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'gu';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', region: 'Pan-India / IRCTC Standard' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', region: 'National Official / राजभाषा' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', region: 'Eastern / South Eastern Railway' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', region: 'Central & Western Railway' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', region: 'Southern Railway' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', region: 'South Central Railway' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', region: 'Western Railway' }
];

interface AccessibilityContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  resetDefaults: () => void;
  currentLanguageObj: LanguageOption;
  t: (key: string, defaultText: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Core translation strings for Indian Railways interface
const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    home: 'Home',
    book: 'Book Ticket',
    tatkalPools: 'Tatkal Pools',
    myBookings: 'My PNR & E-Tickets',
    simulationLab: 'Simulation Lab',
    liveMonitor: 'CRIS Live',
    methodology: 'Methodology',
    tatkalQuota: 'Tatkal Quota',
    generalQuota: 'General Quota',
    happyJourney: 'Happy Journey',
    indianRailways: 'INDIAN RAILWAYS',
    services: 'Services',
    glossary: 'Glossary of IRCTC',
    accessibility: 'Accessibility Options',
    fontSize: 'Font Size',
    selectLanguage: 'Choose Language',
    contrast: 'High Contrast Mode',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode'
  },
  hi: {
    home: 'मुख्य पृष्ठ',
    book: 'आरक्षण करें',
    tatkalPools: 'तत्काल पूल',
    myBookings: 'मेरे पीएनआर एवं ई-टिकट',
    simulationLab: 'सिमुलेशन लैब',
    liveMonitor: 'क्रिस लाइव मॉनिटर',
    methodology: 'कार्यप्रणाली',
    tatkalQuota: 'तत्काल कोटा',
    generalQuota: 'सामान्य कोटा',
    happyJourney: 'शुभयात्रा',
    indianRailways: 'भारतीय रेल',
    services: 'रेल सेवाएँ',
    glossary: 'आईआरसीटीसी शब्दावली',
    accessibility: 'सुगमता विकल्प (Accessibility)',
    fontSize: 'फ़ॉन्ट आकार',
    selectLanguage: 'भाषा चुनें',
    contrast: 'उच्च कंट्रास्ट मोड',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड'
  },
  bn: {
    home: 'প্রধান পাতা',
    book: 'সংরক্ষণ করুন',
    tatkalPools: 'তৎকাল পুল',
    myBookings: 'আমার পিএনআর ও ই-টিকিট',
    simulationLab: 'সিমুলেশন ল্যাব',
    liveMonitor: 'লাইভ মনিটর',
    methodology: 'পদ্ধতি',
    tatkalQuota: 'তৎকাল কোটা',
    generalQuota: 'সাধারণ কোটা',
    happyJourney: 'শুভ যাত্রা',
    indianRailways: 'ভারতীয় রেল',
    glossary: 'আইআরসিটিসি শব্দকোষ',
    accessibility: 'অভিগম্যতা বিকল্প',
    fontSize: 'ফন্ট সাইজ',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    contrast: 'উচ্চ বৈসাদৃশ্য মোড',
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড'
  },
  mr: {
    home: 'मुख्य पृष्ठ',
    book: 'तिकीट आरक्षण',
    tatkalPools: 'तत्काळ पूल',
    myBookings: 'माझे पीएनआर व ई-तिकीट',
    simulationLab: 'सिम्युलेशन लॅब',
    liveMonitor: 'थेट मॉनिटर',
    methodology: 'पद्धती',
    tatkalQuota: 'तत्काळ कोटा',
    generalQuota: 'सामान्य कोटा',
    happyJourney: 'सुखकर प्रवास',
    indianRailways: 'भारतीय रेल्वे',
    accessibility: 'सुलभता पर्याय',
    fontSize: 'फॉन्ट आकार',
    selectLanguage: 'भाषा निवडा',
    contrast: 'हाय कॉन्ट्रास्ट मोड',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड'
  },
  ta: {
    home: 'முகப்பு',
    book: 'டிக்கெட் பதிவு',
    tatkalPools: 'தட்கல் பூல்',
    myBookings: 'எனது பிஎன்ஆர் & இ-டிக்கெட்',
    simulationLab: 'உருவகப்படுத்துதல்',
    liveMonitor: 'நேரலை கண்காணிப்பு',
    methodology: 'செயல்முறை',
    tatkalQuota: 'தட்கல் ஒதுக்கீடு',
    generalQuota: 'பொது ஒதுக்கீடு',
    happyJourney: 'இனிய பயணம்',
    indianRailways: 'இந்திய இரயில்வே',
    accessibility: 'அணுகல்தன்மை விருப்பங்கள்',
    fontSize: 'எழுத்துரு அளவு',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    contrast: 'உயர் மாறுபட்ட பயன்முறை',
    lightMode: 'வெளிச்சப் பயன்முறை',
    darkMode: 'இருண்ட பயன்முறை'
  },
  te: {
    home: 'హోమ్',
    book: 'టికెట్ బుకింగ్',
    tatkalPools: 'తత్కాల్ పూల్',
    myBookings: 'నా పిఎన్ఆర్ & టిక్కెట్లు',
    simulationLab: 'సిమ్యులేషన్ ల్యాబ్',
    liveMonitor: 'లైవ్ మానిటర్',
    methodology: 'పద్ధతి',
    tatkalQuota: 'తత్కాల్ కోటా',
    generalQuota: 'సాధారణ కోటా',
    happyJourney: 'శుభ ప్రయాణం',
    indianRailways: 'భారతీయ రైల్వే',
    accessibility: 'ప్రాప్యత ఎంపికలు',
    fontSize: 'ఫాంట్ పరిమాణం',
    selectLanguage: 'భాషను ఎంచుకోండి',
    contrast: 'హై కాంట్రాస్ట్ మోడ్',
    lightMode: 'లైట్ మోడ్',
    darkMode: 'డార్క్ మోడ్'
  },
  gu: {
    home: 'મુખ્ય પૃષ્ઠ',
    book: 'ટિકિટ બુકિંગ',
    tatkalPools: 'તત્કાલ પૂલ',
    myBookings: 'મારી પી.એન.આર. ટિકિટો',
    simulationLab: 'સિમ્યુલેશન લેબ',
    liveMonitor: 'લાઇવ મોનિટર',
    methodology: 'પદ્ધતિ',
    tatkalQuota: 'તત્કાલ ક્વોટા',
    generalQuota: 'જનરલ ક્વોટા',
    happyJourney: 'શુભ યાત્રા',
    indianRailways: 'ભારતીય રેલવે',
    accessibility: 'સુલભતા વિકલ્પો',
    fontSize: 'ફોન્ટ કદ',
    selectLanguage: 'ભાષા પસંદ કરો',
    contrast: 'હાઇ કોન્ટ્રાસ્ટ મોડ',
    lightMode: 'લાઇટ મોડ',
    darkMode: 'ડાર્ક મોડ'
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('fairflow_railway_theme');
    return (saved as AppTheme) || 'light';
  });

  const [fontSize, setFontSizeState] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('fairflow_railway_fontsize');
    return (saved as FontSizeScale) || 'standard';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('fairflow_railway_lang');
    return (saved as LanguageCode) || 'en';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('fairflow_railway_contrast') === 'true';
  });

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('fairflow_railway_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#05101E';
      document.body.style.color = '#F8FAFC';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#F4F6F9';
      document.body.style.color = '#1E293B';
    }
  }, [theme]);

  // Apply font size scaling to document
  useEffect(() => {
    localStorage.setItem('fairflow_railway_fontsize', fontSize);
    const root = document.documentElement;
    switch (fontSize) {
      case 'standard':
        root.style.fontSize = '16px';
        break;
      case 'medium':
        root.style.fontSize = '18px';
        break;
      case 'large':
        root.style.fontSize = '20px';
        break;
      case 'xlarge':
        root.style.fontSize = '22px';
        break;
    }
  }, [fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    localStorage.setItem('fairflow_railway_contrast', String(highContrast));
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Apply language
  useEffect(() => {
    localStorage.setItem('fairflow_railway_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const setFontSize = (size: FontSizeScale) => {
    setFontSizeState(size);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const resetDefaults = () => {
    setThemeState('light');
    setFontSizeState('standard');
    setLanguageState('en');
    setHighContrast(false);
  };

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: string, defaultText: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return defaultText;
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        fontSize,
        setFontSize,
        language,
        setLanguage,
        highContrast,
        toggleHighContrast,
        resetDefaults,
        currentLanguageObj,
        t
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
