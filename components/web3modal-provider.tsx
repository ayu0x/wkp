"use client"

import { wagmiConfig } from '@/lib/web3modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ReactNode, useState } from 'react'

interface Web3ModalProviderProps {
  children: ReactNode
}

export function Web3ModalProvider({ children }: Web3ModalProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}