'use client';

import { usePWAUpdate } from '@/hooks/usePWAUpdate';

const PWAUpdateListener = () => {
    usePWAUpdate();
    return null;
};

export default PWAUpdateListener;