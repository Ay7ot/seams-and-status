import './globals.css';
import { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: "Seams & Status",
    description: "A simple tool for tailors to manage their customers, measurements, and orders.",
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
            </head>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
} 