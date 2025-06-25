"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

interface Token {
  address: string
  decimals: number
  isNative?: boolean
}

export function useTokenBalance(token: Token | null) {
  const { address: account, isConnected, chainId } = useAccount()
  const [formattedBalance, setFormattedBalance] = useState<string>("0")

  // Native token balance
  const { data: nativeBalance, isLoading: isLoadingNative } = useBalance({
    address: account,
    query: {
      enabled: !!account && !!token?.isNative && isConnected,
      refetchInterval: 15000,
    }
  })

  // ERC20 token balance
  const { data: erc20Balance, isLoading: isLoadingErc20 } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: {
      enabled: !!account && !!token && !token.isNative && isConnected,
      refetchInterval: 15000,
    }
  })

  useEffect(() => {
    if (!token || !isConnected) {
      setFormattedBalance("0")
      return
    }

    if (token.isNative && nativeBalance) {
      setFormattedBalance(nativeBalance.formatted)
    } else if (!token.isNative && erc20Balance) {
      // Format ERC20 balance
      const balance = Number(erc20Balance) / Math.pow(10, token.decimals)
      setFormattedBalance(balance.toString())
    } else {
      setFormattedBalance("0")
    }
  }, [token, nativeBalance, erc20Balance, isConnected])

  const isLoading = token?.isNative ? isLoadingNative : isLoadingErc20

  return { 
    balance: formattedBalance, 
    formattedBalance, 
    isLoading 
  }
}