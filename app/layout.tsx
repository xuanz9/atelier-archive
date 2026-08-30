import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', subsets: ['latin'], weight: ['500', '600'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://atelier-archive.bluepancake.chatgpt.site'),
  title: 'Atelier Archive — Contemporary Art Collection',
  description: 'A searchable digital archive of contemporary artworks, artists, provenance, and availability.',
  openGraph: {
    title: 'Atelier Archive',
    description: 'A living archive of contemporary art.',
    images: [{ url: '/og.png', width: 1730, height: 905, alt: 'Atelier Archive — A living archive of contemporary art.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atelier Archive',
    description: 'A living archive of contemporary art.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${cormorant.variable} antialiased`}>{children}</body></html>;
}
