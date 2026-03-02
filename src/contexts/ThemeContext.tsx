import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'kids' | 'youth' | 'girls' | 'classic' | 'modern';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  preview: string[];
}

export const themes: ThemeConfig[] = [
  {
    id: 'kids',
    name: 'أطفال',
    nameEn: 'Kids',
    emoji: '🧸',
    description: 'ألوان مرحة ومشرقة للصغار',
    preview: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'],
  },
  {
    id: 'youth',
    name: 'شباب',
    nameEn: 'Youth',
    emoji: '🔥',
    description: 'طاقة وحيوية مع ألوان نيون',
    preview: ['#00F5FF', '#7B2FFF', '#FF2E63', '#08D9D6'],
  },
  {
    id: 'girls',
    name: 'بنات',
    nameEn: 'Girls',
    emoji: '🌸',
    description: 'ألوان ناعمة وأنثوية راقية',
    preview: ['#FF6B9D', '#C44569', '#F8B4D9', '#A855F7'],
  },
  {
    id: 'classic',
    name: 'كلاسيك',
    nameEn: 'Classic',
    emoji: '📜',
    description: 'أناقة كلاسيكية خالدة',
    preview: ['#D4AF37', '#1B2A4A', '#8B7355', '#C9A96E'],
  },
  {
    id: 'modern',
    name: 'عصري',
    nameEn: 'Modern',
    emoji: '✨',
    description: 'تصميم حديث ومينيمال',
    preview: ['#06B6D4', '#8B5CF6', '#10B981', '#F43F5E'],
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'modern',
  setTheme: () => {},
  config: themes[4],
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('tm_theme');
    return (saved as ThemeId) || 'modern';
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem('tm_theme', t);
  };

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const config = themes.find(t => t.id === theme) || themes[4];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
