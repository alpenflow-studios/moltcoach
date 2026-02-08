import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/components/providers/WalletProvider";
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
  title: "moltcoach — Your AI Coach, On-Chain",
  description:
    "AI coaching agent with on-chain identity, move-to-earn $FIT rewards, and personalized coaching powered by ERC-8004 on Base.",
  keywords: ["AI coach", "fitness", "Web3", "ERC-8004", "Base", "move-to-earn"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
