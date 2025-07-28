'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

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

  return null;
}
