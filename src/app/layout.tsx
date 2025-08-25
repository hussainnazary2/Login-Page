import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Optimize font loading with display swap for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
});

// Enhanced metadata for better SEO and social sharing
export const metadata: Metadata = {
  title: {
    default: "Authentication System",
    template: "%s | Authentication System",
  },
  description: "Simple client-side authentication system with Iranian mobile number validation built with Next.js and TypeScript",
  keywords: [
    "authentication",
    "login",
    "mobile",
    "Iranian",
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "client-side auth"
  ],
  authors: [{ name: "Authentication System", url: "https://github.com" }],
  creator: "Authentication System",
  publisher: "Authentication System",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Authentication System",
    description: "Simple client-side authentication system with Iranian mobile number validation",
    siteName: "Authentication System",
  },
  twitter: {
    card: "summary",
    title: "Authentication System",
    description: "Simple client-side authentication system with Iranian mobile number validation",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

// Enhanced viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://randomuser.me" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        {/* Skip link for keyboard navigation accessibility */}
        <a 
          href="#main-content" 
          className="skip-link focus:not-sr-only"
          tabIndex={1}
        >
          Skip to main content
        </a>
        
        {/* Main application wrapper with proper semantic structure */}
        <div id="root" className="min-h-screen flex flex-col">
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
        </div>
        
        {/* Screen reader announcements */}
        <div 
          id="announcements" 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        />
      </body>
    </html>
  );
}
