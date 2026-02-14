import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ClawCoach — Your AI Coach, On-Chain",
  description:
    "AI coaching agent with on-chain identity, move-to-earn $CLAWC rewards, and personalized coaching powered by ERC-8004 on Base.",
  keywords: ["AI coach", "fitness", "Web3", "ERC-8004", "Base", "move-to-earn"],
  other: {
    "base:app_id": "698cc32e289e9e19f580444f",
  },
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
        <WalletProvider>
          <div className="flex min-h-screen flex-col overflow-x-clip">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
