"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "@/context/web3-context"
import erc20Abi from "@/data/abis/erc20.json"

interface Token {
  address: string
  decimals: number
  isNative?: boolean
}

export function useTokenBalance(token: Token | null) {
  const { provider, account, isConnected, chainId } = useWeb3()
  const [balance, setBalance] = useState<string>("0")
  const [formattedBalance, setFormattedBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !account || !token || !isConnected) {
        setBalance("0")
        setFormattedBalance("0")
        return
      }

      try {
        setIsLoading(true)
        let rawBalance: ethers.BigNumberish = "0"

        if (token.isNative) {
          // Fetch native ETH balance
          rawBalance = await provider.getBalance(account)
        } else {
          // Fetch ERC20 token balance
          const tokenContract = new ethers.Contract(token.address, erc20Abi, provider)
          rawBalance = await tokenContract.balanceOf(account)
        }

        setBalance(rawBalance.toString())

        // Format the balance for display
        const formatted = ethers.formatUnits(rawBalance, token.decimals)

        // Don't apply additional formatting here - let the component handle display formatting
        setFormattedBalance(formatted)
      } catch (error) {
        console.error("Error fetching token balance:", error)
        setBalance("0")
        setFormattedBalance("0")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()

    // Set up an interval to refresh the balance every 15 seconds
    const intervalId = setInterval(fetchBalance, 15000)

    return () => clearInterval(intervalId)
  }, [provider, account, token, isConnected, chainId])

  return { balance, formattedBalance, isLoading }
}
