import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/sidebar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NPIAMS - National Polytechnic Institute Academic Management System",
  description: "Comprehensive academic management platform for courses, programs, assessments, and grades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {/* DIRECT DASHBOARD ACCESS - NO AUTHENTICATION */}
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
