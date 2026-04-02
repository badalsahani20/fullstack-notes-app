import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notesify — AI-Powered Notes App",
  description:
    "Capture, organize, and supercharge your notes with a built-in AI assistant. Smart folders, rich text editing, and instant sync — all in one beautiful workspace.",
  keywords: [
    "notes app",
    "AI notes",
    "note taking",
    "productivity",
    "smart notes",
    "AI assistant",
    "rich text editor",
  ],
  openGraph: {
    title: "Notesify — AI-Powered Notes App",
    description:
      "Capture, organize, and supercharge your notes with a built-in AI assistant.",
    url: "https://notesify.app",
    siteName: "Notesify",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notesify — AI-Powered Notes App",
    description:
      "Capture, organize, and supercharge your notes with a built-in AI assistant.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Notesify",
              applicationCategory: "ProductivityApplication",
              description:
                "AI-powered notes app with smart folders, rich text editing, and instant sync.",
              operatingSystem: "Web, Windows",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
