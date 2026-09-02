import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/lib/accessibility-context";
import { AccessibilityStatusRail } from "@/components/app/accessibility-status-rail";

export const metadata: Metadata = {
  title: "StudyPilot AI — Your Academic Copilot",
  description:
    "StudyPilot AI reads your lectures and past assessments, finds what you're actually struggling with, and builds a study plan around your real exam dates.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AccessibilityProvider>
          <AccessibilityStatusRail />
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
