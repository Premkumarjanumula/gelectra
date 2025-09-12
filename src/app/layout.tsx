import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Inter, Audiowide } from 'next/font/google';
import { FloatingCTA } from '@/components/floating-cta';

export const metadata: Metadata = {
  title: {
    default: 'G-Electra | Electronics & Smart Systems Club at GITAM Hyderabad',
    template: '%s | G-Electra',
  },
  description:
    'G-Electra is the official Electronics & Smart Systems Club in GITAM Hyderabad. Explore our projects, innovation in electronics, student team, and upcoming events.',
  keywords: [
    'G-Electra',
    'Electronics Club',
    'Smart Systems Club',
    'GITAM Hyderabad',
    'Electronics Club in GITAM Hyderabad',
    'Engineering Innovation',
    'Student Club',
    'Tech Club Hyderabad',
    'G-Electra Hyderabad',
  ],
  authors: [{ name: 'G-Electra Web Team' }],
  creator: 'G-Electra Web Development Team',
  publisher: 'G-Electra',
  metadataBase: new URL('https://gelectra.tech'),
  alternates: {
    canonical: 'https://gelectra.tech',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gelectra.tech',
    siteName: 'G-Electra',
    title: 'G-Electra | Electronics & Smart Systems Club at GITAM Hyderabad',
    description:
      'G-Electra is the official Electronics & Smart Systems Club in GITAM Hyderabad. Explore our projects, student innovation in electronics, and upcoming events.',
    images: [
      {
        url: '/images/og-banner.png', // ✅ place the new banner here
        width: 1200,
        height: 630,
        alt: 'G-Electra - Electronics & Smart Systems Club at GITAM Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G-Electra | Electronics & Smart Systems Club at GITAM Hyderabad',
    description:
      'G-Electra is the official Electronics & Smart Systems Club in GITAM Hyderabad. Discover projects, innovation, and student activities.',
    images: ['/images/og-banner.png'],
    creator: '@gelectra', // optional if Twitter/X handle exists
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  category: 'technology',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const audiowide = Audiowide({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-audiowide',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, audiowide.variable)}>
      <body>
        <Header />
        {children}
        <Footer />
        <FloatingCTA />
        <Toaster />
      </body>
    </html>
  );
}
