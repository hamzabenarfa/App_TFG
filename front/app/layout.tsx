import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toaster-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
