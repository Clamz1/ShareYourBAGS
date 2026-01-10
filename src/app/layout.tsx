import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import { Header } from "@/components/Header";
import { PlasmaBackground } from "@/components/PlasmaBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Share Your BAGS | Token Launcher with Holder Rewards",
  description: "Launch Solana tokens with built-in holder dividends. Minimum 30% fees to token holders, automated airdrops, transparent fee sharing.",
  keywords: ["Solana", "token", "launch", "dividends", "holder rewards", "bags", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <PlasmaBackground />
        <WalletContextProvider>
          <Header />
          <main className="pt-20">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}

