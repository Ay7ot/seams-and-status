import './globals.css';
import { Metadata } from 'next';
import { Inter, Imperial_Script } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-family-sans' });
const imperialScript = Imperial_Script({ weight: '400', subsets: ['latin'], variable: '--font-family-display' });

const siteConfig = {
  name: "Seams & Status",
  description: "The simple, modern way for tailors to manage customers, measurements, orders, and payments. All in one place.",
  url: "https://seams-and-status.xyz",
  ogImage: "https://seams-and-status.xyz/header.png",
};

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
    icon: "/favicon.ico",
  },
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
