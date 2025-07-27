import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitTracker Pro - Your Ultimate Fitness Companion",
  description: "Transform your fitness journey with FitTracker Pro - the all-in-one app for workouts, nutrition tracking, and achieving your health goals.",
  keywords: "fitness, workout, nutrition, health, gym, exercise, tracking, AI coaching, mobile app",
  openGraph: {
    title: "FitTracker Pro - Your Ultimate Fitness Companion",
    description: "Transform your fitness journey with FitTracker Pro - the all-in-one app for workouts, nutrition tracking, and achieving your health goals.",
    url: "https://fittrackerpro.com",
    siteName: "FitTracker Pro",
    images: [
      {
        url: "/images/fittracker-hero.jpg",
        width: 1200,
        height: 630,
        alt: "FitTracker Pro App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitTracker Pro - Your Ultimate Fitness Companion",
    description: "Transform your fitness journey with FitTracker Pro - the all-in-one app for workouts, nutrition tracking, and achieving your health goals.",
    images: ["/images/fittracker-hero.jpg"],
  },
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
