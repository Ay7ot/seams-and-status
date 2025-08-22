'use client';

import { useEffect } from 'react';

// Simple hook that registers the service worker (if not already) and
// prompts the user when a new version is available.
// It relies on Workbox's recommended pattern: calling SKIP_WAITING from the page.

export const usePWAUpdate = () => {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const registerSW = async () => {
            try {
                console.log('Registering service worker...');
                const reg = await navigator.serviceWorker.register('/sw.js');
                console.log('Service worker registered successfully:', reg);

                // Check right away for an update
                if (reg.waiting) {
                    promptUserToRefresh(reg);
                    return;
                }

                // Listen for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update ready
                            promptUserToRefresh(reg);
                        }
                    });
                });

                // Periodically check for updates every 30 min
                setInterval(() => {
                    reg.update();
                }, 30 * 60 * 1000);
            } catch (err) {
                console.error('Service worker registration failed:', err);
            }
        };

        const promptUserToRefresh = (registration: ServiceWorkerRegistration) => {
            if (confirm('A new version of the app is available. Reload now?')) {
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                // Reload once the new SW takes control
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            }
        };

        // Register immediately
        registerSW();
    }, []);
};