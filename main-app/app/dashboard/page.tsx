'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            router.push('/login');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="animate-spin" style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid var(--neutral-200)',
                    borderTop: '3px solid var(--primary-600)',
                    borderRadius: '50%'
                }}></div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container" style={{
            padding: 'var(--space-8)',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-8)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--neutral-0)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h1 style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'var(--text-3xl)',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                }}>
                    Seams & Status
                </h1>
                <Button variant="outline" onClick={handleLogout}>
                    Sign Out
                </Button>
            </header>

            <main>
                <div style={{
                    backgroundColor: 'var(--neutral-0)',
                    padding: 'var(--space-8)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--neutral-900)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        Welcome to your dashboard!
                    </h2>
                    <p style={{
                        color: 'var(--neutral-600)',
                        fontSize: 'var(--text-lg)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        Hello {user.displayName || user.email}! Your tailoring management system is ready.
                    </p>
                    <p style={{
                        color: 'var(--neutral-500)',
                        fontSize: 'var(--text-base)'
                    }}>
                        We're still building the core features. Stay tuned for customer management,
                        measurements, orders, and payment tracking!
                    </p>
                </div>
            </main>
        </div>
    );
} 