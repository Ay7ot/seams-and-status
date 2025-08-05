'use client';

import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/ToastProvider";
import PWAUpdateListener from '@/components/PWAUpdateListener';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <PWAUpdateListener />
                {children}
            </ToastProvider>
        </AuthProvider>
    )
} 