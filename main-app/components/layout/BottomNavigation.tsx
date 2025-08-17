'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Clipboard, Settings } from 'react-feather';
import styles from '@/styles/components/bottom-navigation.module.css';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

const BottomNavigation = () => {
  const pathname = usePathname();

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      href: '/dashboard',
      icon: <Home size={24} className={styles.navIcon} />,
      active: pathname === '/dashboard',
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/customers',
      icon: <Users size={24} className={styles.navIcon} />,
      active: pathname.startsWith('/customers'),
    },

    {
      id: 'measurements',
      label: 'Measurements',
      href: '/measurements',
      icon: <Clipboard size={24} className={styles.navIcon} />,
      active: pathname.startsWith('/measurements'),
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: <Settings size={24} className={styles.navIcon} />,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Main mobile navigation">
      {navigationItems.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className={`${styles.navItem} ${item.active ? styles.active : ''}`}
          aria-current={item.active ? 'page' : undefined}
        >
          {item.icon}
          <span className={styles.navLabel}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNavigation; 