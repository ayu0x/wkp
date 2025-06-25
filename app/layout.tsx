import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/context/web3-context";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Allswap - Professional DeFi Trading Platform",
  description:
    "Experience seamless token swaps and liquidity provision on Allswap - the next-generation decentralized exchange built for professionals",
  keywords: "DeFi, DEX, token swap, liquidity, Soneium, decentralized exchange",
  authors: [{ name: "Allswap Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Allswap - Professional DeFi Trading Platform",
    description: "Experience seamless token swaps and liquidity provision",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-gray-50 dark:bg-gray-950`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Provider>
            {/* Clean Header */}
            <Header />
            
            {/* Main Content */}
            <main className="min-h-screen">
              {children}
            </main>
            
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}