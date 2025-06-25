"use client"; // Keep this directive at the very top of the file

// import { Metadata } from "next" // Removed as metadata cannot be exported from a client component
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState } from "react" // Import useState for copy feedback

// The 'metadata' export has been removed from this client component.
// For page-specific metadata in Next.js 13+ App Router, it should typically
// be defined in a 'layout.tsx' file (either a root layout or a nested layout
// for the specific route segment) or directly in a Server Component page file.

export default function DocsPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
  };

  return (
    <div className="min-h-screen hero-gradient">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl py-8 sm:py-12 lg:py-16 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <span className="text-primary font-semibold text-xs sm:text-sm">📚 Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight">
            <span className="gradient-text">AllSwap</span> Documentation
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4">
            Master the art of decentralized trading with our comprehensive guide to AllSwap DEX
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 sm:mb-12">
          <Card className="p-4 sm:p-6 card-hover border border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Quick Navigation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {[
                { title: "Getting Started", href: "#getting-started" },
                { title: "Features", href: "#features" },
                { title: "Contracts", href: "#contracts" },
                { title: "How to Use", href: "#how-to-use" },
                { title: "Security", href: "#security" },
                { title: "Support", href: "#support" }
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-xs sm:text-sm text-center p-2 sm:p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Getting Started */}
          <Card id="getting-started" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  1
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Getting Started</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Your journey into decentralized finance begins here</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                    Welcome to AllSwap, where trading meets innovation. Our platform provides seamless access to decentralized trading across multiple blockchain networks.
                  </p>

                  <div className="bg-muted/30 p-4 sm:p-6 rounded-xl border border-border/50">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      What You'll Need
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { icon: "🔒", text: "A Web3 wallet (MetaMask, WalletConnect, etc.)" },
                        { icon: "💰", text: "Cryptocurrency for trading and gas fees" },
                        { icon: "🧠", text: "Basic understanding of DeFi concepts" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 text-muted-foreground">
                          <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                          <span className="text-sm sm:text-base">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:p-6 rounded-xl border border-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">💡 Pro Tips</h4>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                    <p>• Start with small amounts to familiarize yourself with the platform</p>
                    <p>• Always verify contract addresses before transactions</p>
                    <p>• Keep some native tokens for gas fees on each network</p>
                    <p>• Join our community for real-time support and updates</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Features */}
          <Card id="features" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Features</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Powerful tools for modern DeFi trading</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: "⚡",
                    title: "Instant Token Swaps",
                    description: "Execute trades instantly with our advanced routing algorithm that finds the best prices across multiple liquidity sources."
                  },
                  {
                    icon: "🌊",
                    title: "Liquidity Pools",
                    description: "Earn passive income by providing liquidity. Our pools offer competitive APY rates with real-time fee tracking."
                  },
                  {
                    icon: "🔗",
                    title: "Multi-Chain Support",
                    description: "Trade seamlessly across Soneium, B3, and Unichain networks with unified liquidity management."
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200">
                    <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Supported Networks</h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { name: "Soneium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "https://soneium.org/favicon.ico" },
                    { name: "B3", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "https://pbs.twimg.com/profile_images/1799953955151060992/ckgfRgvZ_400x400.jpg" },
                    { name: "Unichain", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: "https://pbs.twimg.com/profile_images/1844360745649057798/iwEWAS02_400x400.jpg" },
                    { name: "Inkonchain", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: "https://pbs.twimg.com/profile_images/1851260672354480128/K6ZudYbl_400x400.jpg" },
                    { name: "Abstract", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300", icon: "https://pbs.twimg.com/profile_images/1925544324525150208/26svZowu_400x400.jpg" }
                  ].map((network, index) => (
                    <Badge key={index} className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold border-0 ${network.color} flex items-center gap-2`}>
                      {network.icon && <img src={network.icon} alt={network.name} className="w-4 h-4 rounded-full" />}
                      {network.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Contract Addresses */}
          <Card id="contracts" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Contract Addresses</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Verified smart contract addresses for each network</p>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {[
                  {
                    name: "Soneium Network",
                    icon: "https://soneium.org/favicon.ico",
                    contracts: {
                      WETH: "0x4200000000000000000000000000000000000006",
                      Factory: "0xa7F62B3D43dFa54CcAAF4a15BCB6719D501Da300",
                      Router: "0xc5b000D203546bFEA078c1C39bDEe4A70259BBb3"
                    }
                  },
                  {
                    name: "B3 Network",
                    icon: "https://pbs.twimg.com/profile_images/1799953955151060992/ckgfRgvZ_400x400.jpg",
                    contracts: {
                      WETH: "0x55577e04DAe968f6A1c06C6D74De834c294D2B3E",
                      Factory: "0x3f6D80eB7518A4eB28c0Eb7d36c9Fa9B7b1b5b8F",
                      Router: "0x52A889D97a5DF4C1D5190d936Fe756f0E2Cd975f"
                    }
                  },
                  {
                    name: "Unichain Network",
                    icon: "https://pbs.twimg.com/profile_images/1844360745649057798/iwEWAS02_400x400.jpg",
                    contracts: {
                      WETH: "0x4200000000000000000000000000000000000006",
                      Factory: "0x5Fc51f0269cfC47F048c1f5c4DcA077999e60020",
                      Router: "0xB573b2D9Bf771490De698799ab3E4f726de78994"
                    }
                  },
                  {
                    name: "Inkonchain Network",
                    icon: "https://pbs.twimg.com/profile_images/1851260672354480128/K6ZudYbl_400x400.jpg",
                    contracts: {
                      WETH: "0x4200000000000000000000000000000000000006",
                      Factory: "0x820BD6Bc3164b65437D2dE3Bd28E2c485fE45B70",
                      Router: "0x5C33f4a1FE649128e875132f3e719506019a0162"
                    }
                  },
                  {
                    name: "Abstract Network",
                    icon: "https://pbs.twimg.com/profile_images/1925544324525150208/26svZowu_400x400.jpg",
                    contracts: {
                      WETH: "0x3439153eb7af838ad19d56e1571fbd09333c2809",
                      Factory: "0x6e09A0e03C0011ecbd096E808d8Ea7Bf56B277d8",
                      Router: "0x950D74DcfE9E2afB70804828778112A08b362fA3"
                    }
                  }
                ].map((network, index) => (
                  <div key={index} className="bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-border/50">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center">
                        <img src={network.icon} alt={network.name} className="w-6 h-6 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="truncate">{network.name}</span>
                      </h3>
                    </div>
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {Object.entries(network.contracts).map(([type, address]) => (
                        <div key={type} className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold text-foreground bg-muted px-2 py-1 sm:px-3 sm:py-1 rounded-md">
                              {type}
                            </span>
                            <button
                              onClick={() => copyToClipboard(address)}
                              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              {copiedAddress === address ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <code className="font-mono text-xs sm:text-sm bg-muted/50 px-2 py-2 sm:px-3 sm:py-2 rounded-lg border border-border/30 text-muted-foreground break-all">
                            {address}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* How to Use */}
          <Card id="how-to-use" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  4
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">How to Use</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Step-by-step guides for all platform features</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {[
                  {
                    title: "🔐 Connecting Your Wallet",
                    steps: [
                      "Click the 'Connect Wallet' button in the top right corner",
                      "Select your preferred wallet provider from the modal",
                      "Approve the connection request in your wallet extension",
                      "Select the appropriate network from the dropdown"
                    ]
                  },
                  {
                    title: "💱 Making a Swap",
                    steps: [
                      "Select the token you want to swap from using the dropdown",
                      "Choose your destination token from the second dropdown",
                      "Enter the amount you wish to trade",
                      "Review swap details including price impact and fees",
                      "Click 'Swap' and confirm the transaction in your wallet"
                    ]
                  },
                  {
                    title: "🌊 Adding Liquidity",
                    steps: [
                      "Navigate to the 'Pool' section in the main menu",
                      "Select the token pair for liquidity provision",
                      "Enter amounts for both tokens in the pair",
                      "Review pool details, fees, and estimated returns",
                      "Click 'Add Liquidity' and confirm both approval and deposit transactions"
                    ]
                  },
                  {
                    title: "📊 Managing Positions",
                    steps: [
                      "Visit the 'Portfolio' section to view your positions",
                      "Click on any position to see detailed analytics",
                      "Use the 'Remove Liquidity' option to withdraw funds",
                      "Track your earnings and fee accumulation over time"
                    ]
                  }
                ].map((guide, index) => (
                  <div key={index} className="bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 rounded-xl border border-border/50">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">{guide.title}</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {guide.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                            {stepIndex + 1}
                          </div>
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card id="security" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  5
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Security</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Your safety is our highest priority</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4 sm:p-6 rounded-xl border border-red-200/50 dark:border-red-800/30">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-800 dark:text-red-300 flex items-center">
                      🛡️ Security Best Practices
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-red-700 dark:text-red-300">
                      {[
                        "Always verify contract addresses before any transaction",
                        "Never share your private keys or seed phrases with anyone",
                        "Be cautious of phishing attempts and fake websites",
                        "Use hardware wallets for storing large amounts",
                        "Enable two-factor authentication where possible"
                      ].map((practice, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{practice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 sm:p-6 rounded-xl border border-green-200/50 dark:border-green-800/30">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-800 dark:text-green-300 flex items-center">
                      🔒 Platform Security
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700 dark:text-green-300">
                      {[
                        "All smart contracts are audited by leading security firms",
                        "Multi-signature wallet protection for protocol funds",
                        "Regular security assessments and bug bounty programs",
                        "Decentralized architecture reduces single points of failure",
                        "Real-time monitoring for suspicious activities"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Support */}
          <Card id="support" className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="flex items-start mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold mr-4 sm:mr-6 shadow-lg flex-shrink-0">
                  6
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Support & Community</h2>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Get help when you need it, connect with fellow traders</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  {
                    icon: "💬",
                    title: "Discord Community",
                    description: "Join our active community for real-time support and discussions",
                    action: "Join Discord"
                  },
                  {
                    icon: "🐦",
                    title: "Twitter Updates",
                    description: "Follow us for the latest news, updates, and announcements",
                    action: "Follow Twitter"
                  },
                  {
                    icon: "📚",
                    title: "Knowledge Base",
                    description: "Browse our comprehensive FAQ and troubleshooting guides",
                    action: "Browse FAQ"
                  },
                  {
                    icon: "📧",
                    title: "Direct Support",
                    description: "Contact our support team directly for personalized assistance",
                    action: "Contact Support"
                  }
                ].map((support, index) => (
                  <div key={index} className="bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 text-center">
                    <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{support.icon}</div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground">{support.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{support.description}</p>
                    <button className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium transition-colors">
                      {support.action} →
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 text-center">
                <h4 className="text-base sm:text-lg font-semibold mb-2 text-foreground">Need Immediate Help?</h4>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                  Our support team typically responds within 2-4 hours during business hours
                </p>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base">
                  Start Live Chat
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 sm:p-8 rounded-2xl border border-primary/20">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">Ready to Start Trading?</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              Join thousands of traders who trust AllSwap for their DeFi trading needs. Experience seamless, secure, and efficient trading today.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Launch AllSwap DEX →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}