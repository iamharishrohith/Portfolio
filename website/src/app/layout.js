import '../lib/polyfills'
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Polyfills are now handled via src/lib/polyfills.js
import { Analytics } from '../components/Analytics';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = "https://harishrohith.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Harish Rohith | System Architect & Full Stack Developer",
    template: "%s | Harish Rohith"
  },
  description: "System Architect & Full Stack Developer specializing in React, Next.js, React Native, and cloud infrastructure. Building high-performance digital systems.",
  keywords: [
    "Harish Rohith", "System Architect", "Full Stack Developer",
    "Next.js Developer", "React Developer", "React Native",
    "Web Developer", "Portfolio", "Software Engineer",
    "JavaScript", "TypeScript", "Node.js", "Supabase", "Firebase",
    "AI Engineer", "Machine Learning", "Mobile App Developer",
    "Frontend Architect", "Backend Developer", "AWS", "Cloud Engineering",
    "UI/UX Design", "Performance Optimization", "SEO Expert"
  ],
  authors: [{ name: "Harish Rohith", url: siteUrl }],
  creator: "Harish Rohith",
  publisher: "Harish Rohith",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Harish Rohith | System Architect & Full Stack Developer",
    description: "Building high-performance digital systems. React, Next.js, React Native specialist.",
    url: siteUrl,
    siteName: "Monarch System - Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Harish Rohith - System Architect Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harish Rohith | System Architect",
    description: "Full Stack Developer building high-performance digital systems.",
    images: ["/og-image.png"],
    creator: "@harishrohith",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harish Rohith",
  url: siteUrl,
  image: `${siteUrl}/og-image.png`,
  jobTitle: "System Architect & Full Stack Developer",
  description: "System Architect & Full Stack Developer specializing in React, Next.js, React Native, and cloud infrastructure.",
  sameAs: [
    "https://github.com/harishrohith",
    "https://linkedin.com/in/harishrohith",
  ],
  knowsAbout: [
    "JavaScript", "TypeScript", "React", "Next.js", "React Native",
    "Node.js", "Python", "Supabase", "Firebase", "AWS", "Docker"
  ],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "Your University" // Update this
  },
  worksFor: {
    "@type": "Organization",
    name: "Freelance"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
