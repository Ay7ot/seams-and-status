'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Home,
    Users,
    Briefcase,
    Clipboard,
    Settings,
    LogOut,
    Menu,
    X,
} from 'react-feather';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import BottomNavigation from './BottomNavigation'; // Import the new component
import { ThemeToggle } from '@/components/ui';
import styles from '@/styles/components/dashboard-layout.module.css';
import { User } from 'firebase/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumb?: string;
}

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
}

const DashboardLayout = ({ children, title = 'Dashboard', breadcrumb }: DashboardLayoutProps) => {
    const { user, loading } = useAuth(); // Destructure loading state
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const navigationItems: NavItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            icon: <Home size={20} className={styles.navIcon} />,
            active: pathname === '/dashboard',
        },
        {
            id: 'customers',
            label: 'Customers',
            href: '/customers',
            icon: <Users size={20} className={styles.navIcon} />,
            active: pathname.startsWith('/customers'),
        },
        {
            id: 'orders',
            label: 'Orders',
            href: '/orders',
            icon: <Briefcase size={20} className={styles.navIcon} />,
            active: pathname.startsWith('/orders'),
        },
        {
            id: 'measurements',
            label: 'Measurements',
            href: '/measurements',
            icon: <Clipboard size={20} className={styles.navIcon} />,
            active: pathname.startsWith('/measurements'),
        },
        {
            id: 'settings',
            label: 'Settings',
            href: '/settings',
            icon: <Settings size={20} className={styles.navIcon} />,
            active: pathname.startsWith('/settings'),
        },
    ];

    // Handle sidebar toggle
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking overlay
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const result = await logout();
            if (result.success) {
                router.push('/login');
            } else {
                console.error('Logout failed:', result.error);
                // You could add toast notification here
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSidebarOpen) {
                closeSidebar();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isSidebarOpen]);

    // Focus trap for mobile sidebar
    useEffect(() => {
        if (isSidebarOpen && sidebarRef.current) {
            const firstFocusable = sidebarRef.current.querySelector('a, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
            firstFocusable?.focus();
        }
    }, [isSidebarOpen]);

    // Get user initials for avatar
    const getUserInitials = (user: User | null) => {
        if (user?.displayName) {
            return user.displayName
                .split(' ')
                .map((name: string) => name[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    return (
        <div className={styles.dashboardContainer}>
            <a href="#main-content" className={styles.skipLink}>
                Skip to main content
            </a>

            <div
                ref={overlayRef}
                className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.active : ''
                    }`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}
                aria-label="Main navigation"
                role="navigation"
            >
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo} role="img" aria-label="Seams & Status">
                        Seams & Status
                    </div>
                </div>

                <nav className={styles.navigation} aria-label="Dashboard navigation">
                    <ul className={styles.navList} role="list">
                        {navigationItems.map((item) => (
                            <li key={item.id} className={styles.navItem} role="listitem">
                                <a
                                    href={item.href}
                                    className={`${styles.navLink} ${item.active ? styles.active : ''}`}
                                    aria-current={item.active ? 'page' : undefined}
                                    onClick={closeSidebar}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.sidebarActions}>
                        <div className={styles.desktopThemeToggle}>
                            <ThemeToggle />
                        </div>
                        <button
                            className={styles.logoutButton}
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="Sign out of your account"
                        >
                            <LogOut size={20} className={styles.navIcon} />
                            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className={styles.mainLayout}>
                <header className={styles.topNavbar} role="banner">
                    <div className={styles.headerContainer}>
                        <div className={styles.topNavbarLeft}>
                            <button
                                className={styles.mobileMenuButton}
                                onClick={toggleSidebar}
                                aria-label={
                                    isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
                                }
                                aria-expanded={isSidebarOpen}
                                aria-controls="sidebar-navigation"
                            >
                                {isSidebarOpen ? (
                                    <X size={20} className={styles.navIcon} />
                                ) : (
                                    <Menu size={20} className={styles.navIcon} />
                                )}
                            </button>
                            <h1 className={styles.breadcrumb}>{breadcrumb || title}</h1>
                        </div>

                        <div className={styles.topNavbarRight}>
                            <div className={styles.mobileThemeToggle}>
                                <ThemeToggle />
                            </div>
                            <div
                                className={styles.userProfile}
                                role="button"
                                tabIndex={0}
                                aria-label="User profile menu"
                            >
                                <div
                                    className={`${styles.userAvatar} ${loading ? styles.skeleton : ''
                                        }`}
                                    aria-hidden="true"
                                >
                                    {!loading && getUserInitials(user)}
                                </div>
                                <span className={styles.userName}>
                                    {loading ? (
                                        <div
                                            className={`${styles.skeleton} ${styles.skeletonText}`}
                                        />
                                    ) : (
                                        user?.displayName || user?.email || 'User'
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main
                    id="main-content"
                    className={styles.mainContent}
                    role="main"
                    aria-label="Main content"
                >
                    <div className={styles.contentContainer}>
                        {children}
                    </div>
                </main>
            </div>

            {/* Render Bottom Navigation on mobile */}
            <BottomNavigation />
        </div>
    );
};

export default DashboardLayout; 