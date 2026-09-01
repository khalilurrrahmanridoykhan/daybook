import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Spectral } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display — Fraunces, an opinionated "old-style" serif with optical sizing.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Text — Spectral, a screen-tuned serif with a bookish, semi-legal tone.
const text = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-text",
  display: "swap",
});

// Figures & labels — a monospace, because a ledger is mostly columns of numbers.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Daybook — the account book for your days",
    template: "%s · Daybook",
  },
  description:
    "A bookkeeper's daybook for ordinary life: enter the day's tasks, notes and spending; Daybook posts them to your calendar and your envelope budget.",
  applicationName: "Daybook",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1a16" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${text.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
