'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isAuthenticated: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Fetch user profile from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUserProfile({
                            uid: firebaseUser.uid,
                            ...userDoc.data()
                        } as UserProfile);
                    } else {
                        // User document doesn't exist, set basic profile
                        setUserProfile({
                            uid: firebaseUser.uid,
                            name: firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            defaultUnit: 'in',
                            defaultCurrency: 'NGN',
                            createdAt: { toDate: () => new Date() },
                            updatedAt: { toDate: () => new Date() }
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserProfile(null);
                }
                // Set loading to false only after user profile is handled
                setLoading(false);
            } else {
                setUserProfile(null);
                // Set loading to false for sign out case
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const isAuthenticated = !!user && !!userProfile;

    const contextValue = useMemo(() => ({
        user,
        userProfile,
        loading,
        isAuthenticated
    }), [user, userProfile, loading, isAuthenticated]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 