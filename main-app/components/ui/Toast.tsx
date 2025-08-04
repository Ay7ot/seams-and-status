'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'react-feather';
import styles from '@/styles/components/toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 100);

        // Auto-dismiss
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match CSS transition duration
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'warning':
                return <AlertCircle size={20} />;
            case 'info':
                return <Info size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    return (
        <div
            className={`${styles.toast} ${styles[type]} ${isVisible ? styles.visible : ''} ${isExiting ? styles.exiting : ''}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className={styles.toastContent}>
                <div className={styles.toastIcon}>
                    {getIcon()}
                </div>
                <div className={styles.toastText}>
                    <h4 className={styles.toastTitle}>{title}</h4>
                    {message && <p className={styles.toastMessage}>{message}</p>}
                </div>
                <button
                    className={styles.toastClose}
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast; 