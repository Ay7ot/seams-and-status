'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeReturn {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
    mounted: boolean;
}

export const useTheme = (): UseThemeReturn => {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Read the current theme from the DOM (already set by inline script)
        const currentTheme = document.documentElement.getAttribute('data-theme') as Theme;
        if (currentTheme) {
            setThemeState(currentTheme);
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't explicitly set a theme
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                const systemTheme: Theme = e.matches ? 'dark' : 'light';
                setThemeState(systemTheme);
                document.documentElement.setAttribute('data-theme', systemTheme);
                localStorage.setItem('theme', systemTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        mounted,
    };
}; 