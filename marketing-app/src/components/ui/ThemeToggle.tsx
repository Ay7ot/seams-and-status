'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'react-feather';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
    const { isDark, toggleTheme, mounted } = useTheme();

    if (!mounted) {
        return <div style={{ width: '40px', height: '40px' }} />;
    }

    return (
        <button
            className={className}
            onClick={toggleTheme}
            aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
            title={isDark ? 'Activate light mode' : 'Activate dark mode'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--neutral-100)',
                color: 'var(--neutral-600)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-all)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default ThemeToggle; 