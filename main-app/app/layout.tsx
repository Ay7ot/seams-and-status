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
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
} 