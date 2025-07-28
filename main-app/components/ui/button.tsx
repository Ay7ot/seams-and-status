import React from 'react';
import styles from '../../styles/components/button.module.css';
import { Loader } from './loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    iconOnly?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    iconOnly = false,
    className = '',
    disabled,
    children,
    ...props
}) => {
    const buttonClasses = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        iconOnly && styles.iconOnly,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || loading}
            aria-busy={loading}
            aria-live="polite"
            {...props}
        >
            {loading ? (
                <Loader 
                    size={size === 'large' ? 'medium' : size === 'medium' ? 'small' : 'small'} 
                />
            ) : (
                children
            )}
        </button>
    );
};

export default Button; 