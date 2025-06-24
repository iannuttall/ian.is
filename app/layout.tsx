import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import Script from 'next/script'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  const title = "ian nuttall";
  const description = "tldr; serial internet biz builder, 100+ exits. always learning. usually from my mistakes.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://ian.is'),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{
        url: `/api/og?title=${encodeURIComponent(title)}`,
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && (
          <Script
            strategy="afterInteractive"
            data-id="101414716"
            src="//static.getclicky.com/js"
          />
        )}
      </body>
    </html>
  );
}
