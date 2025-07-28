import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    AuthError
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import Cookies from 'js-cookie';

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// Email/Password Authentication
export const signupWithEmail = async (data: SignupData): Promise<AuthResult> => {
    try {
        if (data.password !== data.confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        if (data.password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long' };
        }

        // Create user account
        const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

        // Store user data in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
            name: data.name.trim(),
            email: data.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const token = await result.user.getIdToken();
        Cookies.set('session', token, { expires: 7 }); // Expires in 7 days

        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

export const loginWithEmail = async (data: LoginData): Promise<AuthResult> => {
    try {
        const result = await signInWithEmailAndPassword(auth, data.email, data.password);
        const token = await result.user.getIdToken();
        Cookies.set('session', token, { expires: 7 }); // Expires in 7 days

        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

// Google Authentication
export const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Store/update user data in Firestore (for new users or updates)
        await setDoc(doc(db, 'users', result.user.uid), {
            name: result.user.displayName || '',
            email: result.user.email || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true }); // Use merge to not overwrite existing data

        const token = await result.user.getIdToken();
        Cookies.set('session', token, { expires: 7 }); // Expires in 7 days

        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

// Password Reset
export const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

// Sign Out
export const logout = async (): Promise<AuthResult> => {
    try {
        await signOut(auth);
        Cookies.remove('session');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: getAuthErrorMessage(error) };
    }
};

// Error Message Handler
const getAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in was cancelled. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled. Please try again.';
        default:
            return error.message || 'An unexpected error occurred. Please try again.';
    }
};

// Form Validation
export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
}; 