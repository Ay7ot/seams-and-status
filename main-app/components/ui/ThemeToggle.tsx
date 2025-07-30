'use client';

import { Button } from './button';
import { Sun, Moon } from 'react-feather';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
    const { isDark, toggleTheme, mounted } = useTheme();

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="small"
                disabled
                style={{
                    borderRadius: 'var(--radius-lg)',
                    width: '100%',
                    height: '48px',
                    padding: 'var(--space-3)',
                    justifyContent: 'flex-start',
                    gap: 'var(--space-3)',
                }}
            >
                <div style={{ width: '20px', height: '20px' }} />
                <span>Loading...</span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="small"
            onClick={toggleTheme}
            style={{
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                height: '48px',
                padding: 'var(--space-3)',
                justifyContent: 'flex-start',
                gap: 'var(--space-3)',
            }}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
    );
};

export default ThemeToggle; 