'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupWithEmail, signInWithGoogle, validateEmail, validatePassword, validateConfirmPassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/ToastProvider';
import styles from '../../styles/components/auth.module.css';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export default function SignupPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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

    const validateName = (name: string): string | null => {
        if (!name.trim()) return 'Name is required';
        if (name.trim().length < 2) return 'Name must be at least 2 characters';
        if (name.trim().length > 50) return 'Name must be less than 50 characters';
        return null;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        const nameError = validateName(formData.name);
        if (nameError) newErrors.name = nameError;

        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;

        const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const result = await signupWithEmail(formData);

            if (result.success) {
                showSuccess('Account created!', 'Welcome to Seams & Status. Your account has been created successfully.');
                router.push('/dashboard');
            } else {
                showError('Account creation failed', result.error);
            }
        } catch {
            showError('Account creation failed', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        setErrors({});

        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            setGoogleLoading(false);
            showError('Google sign up failed', 'Request timed out. Please try again.');
        }, 30000); // 30 seconds timeout

        try {
            const result = await signInWithGoogle();

            clearTimeout(timeoutId);

            if (result.success) {
                showSuccess('Account created!', 'Welcome to Seams & Status. Your account has been created with Google.');
                router.push('/dashboard');
            } else {
                showError('Google sign up failed', result.error || 'Sign up was cancelled or failed.');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Google sign-up error:', error);
            showError('Google sign up failed', 'An unexpected error occurred. Please try again.');
        } finally {
            setGoogleLoading(false);
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
                            Join thousands of professional tailors who trust our platform to manage
                            their business efficiently and grow their customer base.
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className={styles.authFormSide}>
                    <div className={styles.authCard}>


                        <div className={styles.authHeader}>
                            <h1 className={styles.logo}>Seams & Status</h1>
                            <p className={styles.tagline}>Professional tailoring management</p>
                            <h2 className={styles.title}>Create your account</h2>
                            <p className={styles.subtitle}>Start managing your tailoring business</p>
                        </div>



                        <form onSubmit={handleEmailSignup} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                    placeholder="Enter your full name"
                                    disabled={loading || googleLoading}
                                />
                                {errors.name && (
                                    <span className={styles.errorMessage}>{errors.name}</span>
                                )}
                            </div>

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
                                    disabled={loading || googleLoading}
                                />
                                {errors.email && (
                                    <span className={styles.errorMessage}>{errors.email}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password" className={styles.label}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                                    placeholder="Create a password (min. 6 characters)"
                                    disabled={loading || googleLoading}
                                />
                                {errors.password && (
                                    <span className={styles.errorMessage}>{errors.password}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword" className={styles.label}>
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                                    placeholder="Confirm your password"
                                    disabled={loading || googleLoading}
                                />
                                {errors.confirmPassword && (
                                    <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                loading={loading}
                                disabled={loading || googleLoading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>or</span>
                            <div className={styles.dividerLine}></div>
                        </div>

                        <Button
                            onClick={handleGoogleSignup}
                            variant="secondary"
                            size="large"
                            fullWidth
                            loading={googleLoading}
                            disabled={loading || googleLoading}
                            className={styles.socialButton}
                        >
                            <svg className={styles.googleIcon} viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {googleLoading ? 'Creating account...' : 'Continue with Google'}
                        </Button>

                        <div className={styles.authFooter}>
                            <p>
                                Already have an account?{' '}
                                <Link href="/login" className={styles.authLink}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 