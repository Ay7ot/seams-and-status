import './globals.css';
import { Metadata } from 'next';
import { Inter, Imperial_Script } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-family-sans' });
const imperialScript = Imperial_Script({ weight: '400', subsets: ['latin'], variable: '--font-family-display' });

export const metadata: Metadata = {
  title: "Seams & Status - Modernize Your Tailoring Business",
  description: "Manage customers, track measurements, and monitor orders and payments—all in one simple, beautiful app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                                    }
                                } catch (e) {
                                    document.documentElement.setAttribute('data-theme', 'light');
                                }
                            })();
                        `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${imperialScript.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
