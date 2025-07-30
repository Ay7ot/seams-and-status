'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Button, Select, SelectOption } from '@/components/ui';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import styles from '@/styles/components/auth.module.css';
import settingsStyles from '@/styles/components/settings.module.css';

const SettingsPage = () => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [settings, setSettings] = useState({
        defaultUnit: 'in' as 'in' | 'cm',
        defaultCurrency: 'NGN',
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
    });

    const { data: userData } = useFirestoreQuery<UserProfile>({
        path: 'users',
        constraints: user ? [{ type: 'where', field: '__name__', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const currentUser = userData?.[0];

    // Load user settings on mount
    useEffect(() => {
        if (currentUser) {
            setSettings({
                defaultUnit: currentUser.defaultUnit || 'in',
                defaultCurrency: currentUser.defaultCurrency || 'NGN',
                businessName: currentUser.name || '',
                businessAddress: currentUser.businessAddress || '',
                businessPhone: currentUser.businessPhone || '',
                businessEmail: currentUser.email || '',
            });
        }
    }, [currentUser]);

    const unitOptions: SelectOption[] = [
        { label: 'Inches (in)', value: 'in' },
        { label: 'Centimeters (cm)', value: 'cm' },
    ];

    const currencyOptions: SelectOption[] = [
        { label: 'Nigerian Naira (₦)', value: 'NGN' },
        { label: 'US Dollar ($)', value: 'USD' },
        { label: 'Euro (€)', value: 'EUR' },
        { label: 'British Pound (£)', value: 'GBP' },
        { label: 'Ghanaian Cedi (₵)', value: 'GHS' },
        { label: 'Kenyan Shilling (KSh)', value: 'KES' },
        { label: 'South African Rand (R)', value: 'ZAR' },
    ];

    const handleSettingChange = (key: string, value: string | 'in' | 'cm') => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!user || !currentUser) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                defaultUnit: settings.defaultUnit,
                defaultCurrency: settings.defaultCurrency,
                name: settings.businessName,
                businessAddress: settings.businessAddress,
                businessPhone: settings.businessPhone,
                businessEmail: settings.businessEmail,
                updatedAt: serverTimestamp(),
            });
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (currentUser) {
            setSettings({
                defaultUnit: currentUser.defaultUnit || 'in',
                defaultCurrency: currentUser.defaultCurrency || 'NGN',
                businessName: currentUser.name || '',
                businessAddress: currentUser.businessAddress || '',
                businessPhone: currentUser.businessPhone || '',
                businessEmail: currentUser.email || '',
            });
            setHasChanges(false);
        }
    };

    return (
        <DashboardLayout title="Settings" breadcrumb="Application Settings">
            {/* Responsive Header */}
            <div className={settingsStyles.header}>
                <h1 className={settingsStyles.title}>
                    Application Settings
                </h1>
                <div className={settingsStyles.buttonContainer}>
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={isSaving || !hasChanges}
                        className={settingsStyles.button}
                    >
                        Reset Changes
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={settingsStyles.button}
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            {/* Responsive Grid Container */}
            <div className={settingsStyles.gridContainer}>
                {/* Business Information */}
                <div className={settingsStyles.card}>
                    <h2 className={settingsStyles.cardTitle}>
                        Business Information
                    </h2>
                    <p className={settingsStyles.cardDescription}>
                        Update your business details that will be used throughout the application.
                    </p>

                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="businessName" className={styles.label}>Business Name</label>
                            <input
                                id="businessName"
                                type="text"
                                value={settings.businessName}
                                onChange={(e) => handleSettingChange('businessName', e.target.value)}
                                className={styles.input}
                                placeholder="Your business name"
                                disabled={isSaving}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="businessEmail" className={styles.label}>Business Email</label>
                            <input
                                id="businessEmail"
                                type="email"
                                value={settings.businessEmail}
                                onChange={(e) => handleSettingChange('businessEmail', e.target.value)}
                                className={styles.input}
                                placeholder="business@example.com"
                                disabled={isSaving}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="businessPhone" className={styles.label}>Business Phone</label>
                            <input
                                id="businessPhone"
                                type="tel"
                                value={settings.businessPhone}
                                onChange={(e) => handleSettingChange('businessPhone', e.target.value)}
                                className={styles.input}
                                placeholder="+234 123 456 7890"
                                disabled={isSaving}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="businessAddress" className={styles.label}>Business Address</label>
                            <textarea
                                id="businessAddress"
                                value={settings.businessAddress}
                                onChange={(e) => handleSettingChange('businessAddress', e.target.value)}
                                className={styles.input}
                                rows={3}
                                placeholder="Your business address"
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                {/* Default Preferences */}
                <div className={settingsStyles.card}>
                    <h2 className={settingsStyles.cardTitle}>
                        Default Preferences
                    </h2>
                    <p className={settingsStyles.cardDescription}>
                        Set your default preferences for measurements and currency.
                    </p>

                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Default Measurement Unit</label>
                            <Select
                                options={unitOptions}
                                value={settings.defaultUnit}
                                onChange={(value) => handleSettingChange('defaultUnit', value)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Default Currency</label>
                            <Select
                                options={currencyOptions}
                                value={settings.defaultCurrency}
                                onChange={(value) => handleSettingChange('defaultCurrency', value)}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage; 