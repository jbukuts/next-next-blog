import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import Header from '#/components/header';
import './globals.css';
import Footer from '#/components/footer';
import { baseMetadata } from '#/lib/create-metadata';
import { ThemeProvider } from 'next-themes';

const pixelSerif = localFont({
  variable: '--font-pixel-serif',
  src: '/pixel-sans.woff2',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin']
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${jetbrains.variable} ${pixelSerif.variable} min-h-screen w-full`}
      suppressHydrationWarning>
      <body className='font-jetbrains-mono min-h-screen w-full antialiased'>
        <ThemeProvider
          themes={['light', 'dark', 'sticky']}
          defaultTheme='sticky'>
          <div className='grid min-h-screen w-full grid-cols-[1fr_min(675px,100%)_1fr] grid-rows-[auto_1fr_auto] gap-y-5 md:gap-x-2'>
            <Header />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
