'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword, validateEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import styles from '../../styles/components/auth.module.css';

interface FormData {
    email: string;
}

interface FormErrors {
    email?: string;
    general?: string;
}

export default function ResetPasswordPage() {
    const [formData, setFormData] = useState<FormData>({
        email: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        setSuccess(false);

        try {
            const result = await resetPassword(formData.email);

            if (result.success) {
                setSuccess(true);
                setFormData({ email: '' });
            } else {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            {/* Desktop Layout */}
            <div className={styles.authWrapper}>
                {/* Brand Side - Desktop Only */}
                <div className={styles.authBrandSide}>
                    <div className={styles.brandContent}>
                        <h1 className={styles.brandLogo}>Seams & Status</h1>
                        <p className={styles.brandTagline}>Professional Tailoring Management</p>
                        <p className={styles.brandDescription}>
                            Don't worry, we'll help you get back into your account.
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className={styles.authFormSide}>
                    <div className={styles.authCard}>
                        {loading && (
                            <div className={styles.loadingOverlay}>
                                <div className={styles.spinner}></div>
                            </div>
                        )}

                        <div className={styles.authHeader}>
                            <h1 className={styles.logo}>Seams & Status</h1>
                            <p className={styles.tagline}>Professional tailoring management</p>
                            <h2 className={styles.title}>Reset your password</h2>
                            <p className={styles.subtitle}>
                                Enter your email address and we'll send you a link to reset your password
                            </p>
                        </div>

                        {success && (
                            <div className={styles.successMessage}>
                                Password reset email sent! Check your inbox and follow the instructions to reset your password.
                            </div>
                        )}

                        {errors.general && (
                            <div className={styles.errorMessage}>
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <span className={styles.errorMessage}>{errors.email}</span>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>

                        <div className={styles.authFooter}>
                            <p>
                                Remember your password?{' '}
                                <Link href="/login" className={styles.authLink}>
                                    Sign in
                                </Link>
                            </p>
                            <p style={{ marginTop: 'var(--space-2)' }}>
                                Don't have an account?{' '}
                                <Link href="/signup" className={styles.authLink}>
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 