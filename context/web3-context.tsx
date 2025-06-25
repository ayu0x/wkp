"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"
import networksConfig from "@/data/networks.json"

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (eventName: string, handler: (...args: any[]) => void) => void
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void
      send: (method: string, params?: any[]) => Promise<any>
    }
  }
}

interface Web3ContextType {
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnecting: boolean
  isConnected: boolean
  isCorrectNetwork: boolean
  currentNetwork: any
  connect: (isAutoConnect?: boolean) => Promise<void>
  disconnect: () => void
  switchNetwork: (targetChainId?: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  isConnecting: false,
  isConnected: false,
  isCorrectNetwork: false,
  currentNetwork: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
})

export const useWeb3 = () => useContext(Web3Context)

interface Web3ProviderProps {
  children: ReactNode
}

// Local storage key for connection state
const CONNECTION_KEY = "soneswap_connected"

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<any>(null)
  const { toast } = useToast()

  const getNetworkConfig = (chainId: number) => {
    return networksConfig.networks.find(network => network.chainId === chainId)
  }

  const connect = async (isAutoConnect = false) => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send("eth_requestAccounts", [])
      const network = await browserProvider.getNetwork()
      const userSigner = await browserProvider.getSigner()
      const currentChainId = Number(network.chainId)
      const networkConfig = getNetworkConfig(currentChainId)

      setProvider(browserProvider)
      setAccount(accounts[0])
      setChainId(currentChainId)
      setSigner(userSigner)
      setIsConnected(true)
      setCurrentNetwork(networkConfig)
      setIsCorrectNetwork(!!networkConfig)

      // Save connection state to localStorage
      localStorage.setItem(CONNECTION_KEY, "true")

      if (!isAutoConnect) {
        toast({
          title: "Connected",
          description: "Wallet connected successfully",
        })
      }

      if (!networkConfig) {
        toast({
          title: "Unsupported Network",
          description: "Please switch to a supported network",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const switchNetwork = async (targetChainId?: number) => {
    if (!window.ethereum) return

    try {
      const chainIdToSwitch = targetChainId || networksConfig.networks[0].chainId
      const networkConfig = getNetworkConfig(chainIdToSwitch)

      if (!networkConfig) {
        throw new Error("Network not supported")
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainIdToSwitch.toString(16)}` }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainIdToSwitch.toString(16)}`,
                chainName: networkConfig.name,
                rpcUrls: [networkConfig.rpcUrl],
                nativeCurrency: networkConfig.nativeCurrency,
                blockExplorerUrls: [networkConfig.explorerUrl],
              },
            ],
          })
        } else {
          throw switchError
        }
      }
    } catch (error) {
      console.error("Error switching network:", error)
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch network",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    setIsCorrectNetwork(false)
    setCurrentNetwork(null)

    // Clear connection state from localStorage on explicit disconnect
    localStorage.removeItem(CONNECTION_KEY)

    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    })
  }

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined") return

      const wasConnected = localStorage.getItem(CONNECTION_KEY) === "true"

      if (wasConnected && window.ethereum) {
        try {
          // Check if already connected to avoid unnecessary prompts
          const browserProvider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await browserProvider.send("eth_accounts", [])

          if (accounts.length > 0) {
            // User is still connected to MetaMask, reconnect silently
            await connect(true)
          } else {
            // User disconnected from MetaMask side, clear our state
            localStorage.removeItem(CONNECTION_KEY)
          }
        } catch (error) {
          console.error("Auto-connect error:", error)
          localStorage.removeItem(CONNECTION_KEY)
        }
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number(chainIdHex)
      const networkConfig = getNetworkConfig(newChainId)
      setChainId(newChainId)
      setCurrentNetwork(networkConfig)
      setIsCorrectNetwork(!!networkConfig)
      window.location.reload()
    }

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [account])

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        currentNetwork,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}