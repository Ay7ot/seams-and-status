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
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
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