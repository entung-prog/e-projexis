import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Projexis - Manajemen Proyek",
  description: "Aplikasi SaaS Manajemen Proyek modern untuk tim Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
