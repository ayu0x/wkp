"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useToast } from "@/hooks/use-toast"
import networksConfig from "@/data/networks.json"
import { customChains } from "@/lib/web3modal"

interface Web3ContextType {
  account: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  isCorrectNetwork: boolean
  currentNetwork: any
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (targetChainId?: number) => Promise<void>
  // Legacy properties for backward compatibility
  provider: null
  signer: null
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  isCorrectNetwork: false,
  currentNetwork: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  provider: null,
  signer: null,
})

export const useWeb3 = () => useContext(Web3Context)

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const { address, isConnecting, isConnected } = useAccount()
  const chainId = useChainId()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { open } = useWeb3Modal()
  const { toast } = useToast()

  const getNetworkConfig = (chainId: number) => {
    return networksConfig.networks.find(network => network.chainId === chainId)
  }

  const currentNetwork = chainId ? getNetworkConfig(chainId) : null
  const isCorrectNetwork = !!currentNetwork

  const connect = async () => {
    try {
      await open()
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    try {
      wagmiDisconnect()
      toast({
        title: "Disconnected",
        description: "Wallet disconnected",
      })
    } catch (error) {
      console.error("Disconnect error:", error)
    }
  }

  const switchNetwork = async (targetChainId?: number) => {
    try {
      const chainIdToSwitch = targetChainId || networksConfig.networks[0].chainId
      const networkConfig = getNetworkConfig(chainIdToSwitch)

      if (!networkConfig) {
        throw new Error("Network not supported")
      }

      await switchChain({ chainId: chainIdToSwitch })
      
      toast({
        title: "Network switched",
        description: `Switched to ${networkConfig.name}`,
      })
    } catch (error) {
      console.error("Error switching network:", error)
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch network",
        variant: "destructive",
      })
    }
  }

  // Show connection success toast
  useEffect(() => {
    if (isConnected && address) {
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      })
    }
  }, [isConnected, address, toast])

  // Show network warning
  useEffect(() => {
    if (isConnected && !isCorrectNetwork && chainId) {
      toast({
        title: "Unsupported Network",
        description: "Please switch to a supported network",
        variant: "destructive",
      })
    }
  }, [isConnected, isCorrectNetwork, chainId, toast])

  return (
    <Web3Context.Provider
      value={{
        account: address || null,
        chainId: chainId || null,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        currentNetwork,
        connect,
        disconnect,
        switchNetwork,
        // Legacy properties for backward compatibility
        provider: null,
        signer: null,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}