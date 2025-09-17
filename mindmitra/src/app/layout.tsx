import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MindMitra",
  description: "Student mental health companion and exam tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#F4F4F4]">
      <body className={`${inter.variable} antialiased min-h-screen text-[#1A1A1A]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
