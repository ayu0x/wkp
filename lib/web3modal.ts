import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { mainnet, sepolia } from 'wagmi/chains'
import networksConfig from '@/data/networks.json'
import type { Chain } from 'wagmi/chains'

// Project ID from WalletConnect Cloud
const projectId = '3635ab017cec91b3b179e5c8adf0cb17'

// App metadata
const metadata = {
  name: 'AllSwap',
  description: 'Decentralized Exchange - Multi-chain DEX',
  url: 'https://allswap.pro',
  icons: ['https://allswap.pro/icon1.png']
}

// Convert networks.json to Wagmi chain format
const customChains: Chain[] = networksConfig.networks.map((network) => ({
  id: network.chainId,
  name: network.name,
  network: network.name.toLowerCase().replace(/\s/g, '-'),
  nativeCurrency: {
    decimals: network.nativeCurrency.decimals,
    name: network.nativeCurrency.name,
    symbol: network.nativeCurrency.symbol,
  },
  rpcUrls: {
    default: { http: [network.rpcUrl] },
    public: { http: [network.rpcUrl] },
  },
  blockExplorers: {
    default: { 
      name: `${network.name} Explorer`, 
      url: network.explorerUrl 
    },
  },
  testnet: false, // Set to true if any of your networks are testnets
}))

// Combine with default chains (you can remove mainnet/sepolia if not needed)
const chains = [...customChains] as const

// Create wagmi config
const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

// Create Web3Modal instance
createWeb3Modal({ 
  wagmiConfig, 
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
})

export { wagmiConfig, customChains }