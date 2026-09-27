import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8080"),
  title: "Vigil",
  description:
    "Vigil is a governed multi-agent care intelligence OS for families navigating illness. RAG, orchestration, and safety contracts — not a chatbot.",
  icons: { icon: "/favicon.svg" },
  openGraph: { images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#090b0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
        />
      </head>
      <body className="bg-bg font-sans text-fg">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#12161b",
              color: "#ececea",
              border: "1px solid rgba(236,236,234,0.12)",
            },
          }}
        />
      </body>
    </html>
  );
}
