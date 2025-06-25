"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, AlertCircle, Loader2, Check, X } from "lucide-react"
import Image from "next/image"
import tokenList from "@/data/tokens.json"
import networkConfig from "@/data/network.json"
import { useWeb3 } from "@/context/web3-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ethers } from "ethers"
import ERC20_ABI from "@/data/abis/erc20.json"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Token {
  address: string
  name: string
  symbol: string
  logoURI?: string
  decimals: number
  isNative?: boolean
  isCustom?: boolean
  chainId?: number
}

interface TokenBalance {
  balance: string
  isLoading: boolean
}

interface TokenSelectorProps {
  onSelect: (token: Token) => void
  selectedToken?: Token | null
  otherToken?: Token | null
  showBalance?: boolean
}

export default function TokenSelector({ onSelect, selectedToken, otherToken, showBalance = true }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoadingCustomToken, setIsLoadingCustomToken] = useState(false)
  const [customToken, setCustomToken] = useState<Token | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { isConnected, provider, signer, account, currentNetwork } = useWeb3()
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance>>({})

  useEffect(() => {
    if (!currentNetwork) return
    const allTokens = [
      {
        address: "ETH",
        name: currentNetwork.nativeCurrency.name,
        symbol: currentNetwork.nativeCurrency.symbol,
        decimals: currentNetwork.nativeCurrency.decimals,
        logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
        isNative: true,
        chainId: currentNetwork.chainId,
      },
      ...tokenList.tokens.filter(token => token.chainId === currentNetwork.chainId),
    ]
    setTokens(allTokens)
  }, [currentNetwork])

  useEffect(() => {
    if (!isConnected || !provider || !account || !tokens.length || !currentNetwork?.contracts?.WETH) {
      return
    }
    const fetchAllBalances = async () => {
      const balances: Record<string, TokenBalance> = {}
      tokens.forEach((token) => {
        balances[token.address] = { balance: "0", isLoading: true }
      })
      setTokenBalances(balances)
      for (const token of tokens) {
        try {
          let rawBalance: ethers.BigNumberish = "0"
          if (token.isNative) {
            rawBalance = await provider.getBalance(account)
          } else {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
            rawBalance = await tokenContract.balanceOf(account)
          }
          const formatted = ethers.formatUnits(rawBalance, token.decimals)
          setTokenBalances((prev) => ({
            ...prev,
            [token.address]: { balance: formatted, isLoading: false },
          }))
        } catch (error) {
          console.error(`Error fetching balance for token ${token.symbol} on chain ${currentNetwork?.chainId}:`, error)
          setTokenBalances((prev) => ({
            ...prev,
            [token.address]: { balance: "0", isLoading: false },
          }))
        }
      }
    }
    fetchAllBalances()
    const intervalId = setInterval(fetchAllBalances, 30000)
    return () => clearInterval(intervalId)
  }, [isConnected, provider, account, tokens, currentNetwork])

  const isValidAddress = (address: string): boolean => {
    try {
      if (typeof address !== "string" || address.length !== 42) {
        return false
      }
      if (!address.startsWith("0x")) {
        return false
      }
      const hexRegex = /^0x[0-9a-fA-F]{40}$/
      return hexRegex.test(address)
    } catch (error) {
      console.error("Error validating address:", error)
      return false
    }
  }

  const fetchTokenInfo = async (address: string) => {
    setIsLoadingCustomToken(true)
    setError(null)
    if (!provider && !window.ethereum) {
       setError("No web3 provider available.")
       setIsLoadingCustomToken(false)
       return null
    }
    try {
      console.log("Fetching token info for address:", address)
      let tokenContract
      if (signer) {
        tokenContract = new ethers.Contract(address, ERC20_ABI, signer)
      } else if (provider) {
        tokenContract = new ethers.Contract(address, ERC20_ABI, provider)
      } else if (typeof window !== "undefined" && window.ethereum) {
        const tempProvider = new ethers.BrowserProvider(window.ethereum)
        tokenContract = new ethers.Contract(address, ERC20_ABI, tempProvider)
      } else {
         throw new Error("No provider available")
      }
      const name = await tokenContract.name()
      const symbol = await tokenContract.symbol()
      const decimals = await tokenContract.decimals()
      console.log("Token info fetched:", { name, symbol, decimals })
      const tokenInfo = {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        isCustom: true,
        chainId: currentNetwork?.chainId,
      }
      setCustomToken(tokenInfo)
      if (isConnected && provider && account) {
        try {
          const rawBalance = await tokenContract.balanceOf(account)
          const formatted = ethers.formatUnits(rawBalance, decimals)
          setTokenBalances((prev) => ({
            ...prev,
            [address]: { balance: formatted, isLoading: false },
          }))
        } catch (error) {
          console.error(`Error fetching custom token balance for ${address}:`, error)
          setTokenBalances((prev) => ({
            ...prev,
            [address]: { balance: "0", isLoading: false },
          }))
        }
      }
      return tokenInfo
    } catch (error) {
      console.error("Error fetching token info:", error)
      setError("Invalid token address or not an ERC20 token on the current network.")
      setCustomToken(null)
      return null
    } finally {
      setIsLoadingCustomToken(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value !== searchQuery) {
      setError(null)
      if (!isValidAddress(value)) {
        setCustomToken(null)
      }
    }
    if (isValidAddress(value)) {
      console.log("Valid address detected:", value)
      fetchTokenInfo(value)
    }
  }

  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      (!token.isNative && token.address.toLowerCase().includes(query))
    )
    const matchesNetwork = token.chainId === currentNetwork?.chainId || (token.isCustom && !token.chainId)
    return matchesSearch && matchesNetwork
  })

  const displayTokens = customToken && (customToken.chainId === currentNetwork?.chainId || !customToken.chainId)
    ? [customToken, ...filteredTokens.filter((t) => t.address.toLowerCase() !== customToken.address.toLowerCase())]
    : filteredTokens

  displayTokens.sort((a, b) => {
    if (a.isNative) return -1
    if (b.isNative) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  const selectedTokenBalance = selectedToken ? tokenBalances[selectedToken.address]?.balance : "0"
  const isSelectedTokenBalanceLoading = selectedToken ? tokenBalances[selectedToken.address]?.isLoading : false

  const handleSelect = (token: Token) => {
    onSelect(token)
    setIsOpen(false)
    setSearchQuery("")
    setCustomToken(null)
    setError(null)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    if (!balance || balance === "0") return "0"
    const num = Number(balance);
    if (num < 0.0001 && num > 0) {
      return num.toExponential(2);
    }
    return num.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-0 max-w-[140px] sm:max-w-[160px] flex-shrink-0"
      >
        {selectedToken ? (
          <div className="flex items-center gap-2 min-w-0">
            {selectedToken.logoURI ? (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Image
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-xs flex-shrink-0">
                {selectedToken.symbol.charAt(0)}
              </div>
            )}
            <span className="font-medium text-sm truncate min-w-0">{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">Select Token</span>
        )}
        <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-md w-[95vw] sm:w-full" hideCloseButton={true}>
          <DialogTitle className="sr-only">Select Token Dialog</DialogTitle>
          
          {/* Custom Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Token</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search name or paste address"
                className="pl-10 h-12 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                value={searchQuery}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoadingCustomToken && (
            <div className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching token info...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mx-6 mb-4">
              <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Tokens Section */}
          <div className="max-h-80 overflow-y-auto px-6 pb-6">
            {!searchQuery && (
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Your Tokens
                </h3>
              </div>
            )}

            <div className="space-y-1">
              {displayTokens.length === 0 && !isLoadingCustomToken && !error ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No tokens found.</p>
                </div>
              ) : (
                displayTokens.map((token) => (
                  <div
                    key={token.address}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedToken?.address === token.address 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    } ${otherToken?.address === token.address ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => otherToken?.address !== token.address && handleSelect(token)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {token.logoURI ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                          <Image
                            src={token.logoURI}
                            alt={token.symbol}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{token.symbol}</h4>
                          {token.isCustom && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex-shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{token.name}</p>
                        {!token.isNative && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{truncateAddress(token.address)}</p>
                        )}
                      </div>
                    </div>
                    
                    {isConnected && showBalance && (
                      <div className="text-right flex-shrink-0 ml-2">
                        {tokenBalances[token.address]?.isLoading ? (
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                              {formatBalance(tokenBalances[token.address]?.balance || "0")}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              $0.00
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}