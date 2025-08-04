import './globals.css';
import { Metadata } from 'next';
import { Providers } from './providers';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
        type: "website",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
    },
    icons: {
        icon: "/icons/favicon-32x32.png",
        shortcut: "/icons/favicon-16x16.png",
        apple: "/icons/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme) {
                                        document.documentElement.setAttribute('data-theme', theme);
                                    } else {
                                        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                        var systemTheme = prefersDark ? 'dark' : 'light';
                                        document.documentElement.setAttribute('data-theme', systemTheme);
                                        localStorage.setItem('theme', systemTheme);
                                    }
                                } catch (e) {
                                    // Fallback to light theme if there's any error
                                    document.documentElement.setAttribute('data-theme', 'light');
                                }
                            })();
                        `,
                    }}
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
                <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
            </head>
            <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
} 