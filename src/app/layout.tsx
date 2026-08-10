import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

import { PageLoader } from '@/components/ui/PageLoader';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cafein Today | Artisanal Coffee Sanctuary',
  description: 'Experience the finest coffee in a cinematic, dual-state environment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased`}>
      <body>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
