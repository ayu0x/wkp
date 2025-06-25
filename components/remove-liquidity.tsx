"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Info, ExternalLink } from "lucide-react"
import TokenSelector from "@/components/token-selector"
import { useWeb3 } from "@/context/web3-context"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import contractsData from "@/data/contracts.json"
import routerAbi from "@/data/abis/router.json"
import factoryAbi from "@/data/abis/factory.json"
import pairAbi from "@/data/abis/pair.json"
import erc20Abi from "@/data/abis/erc20.json"
import networkConfig from "@/data/network.json"
import tokensData from "@/data/tokens.json"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import SlippageSettings from "@/components/slippage-settings"
import { useSlippage } from "@/hooks/use-slippage"

interface Token {
  address: string
  name: string
  symbol: string
  logoURI?: string
  decimals: number
  isNative?: boolean
  chainId?: number
}

interface PoolInfo {
  exists: boolean
  pairAddress: string | null
  reserveA: string
  reserveB: string
  ratio: number
  lpBalance: string
  lpTotalSupply: string
}

interface LiquidityPosition {
  pairAddress: string
  tokenA: Token
  tokenB: Token
  lpBalance: string
  reserveA: string
  reserveB: string
  lpTotalSupply: string
  valueUSD?: string
}

export default function RemoveLiquidity({
  slippage,
  updateSlippage,
}: { slippage: number; updateSlippage: (newSlippage: number) => void }) {
  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const { isConnected, connect, signer, provider, account, isCorrectNetwork, switchNetwork, currentNetwork } = useWeb3()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [allowance, setAllowance] = useState("0")
  const [poolInfo, setPoolInfo] = useState<PoolInfo>({
    exists: false,
    pairAddress: null,
    reserveA: "0",
    reserveB: "0",
    ratio: 0,
    lpBalance: "0",
    lpTotalSupply: "0",
  })
  const [isCheckingPool, setIsCheckingPool] = useState(false)
  const [percentToRemove, setPercentToRemove] = useState(50)
  const [amountA, setAmountA] = useState("0")
  const [amountB, setAmountB] = useState("0")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([])
  const [isLoadingPositions, setIsLoadingPositions] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null)
  const [showManualSelection, setShowManualSelection] = useState(false)
  const { calculateMinimumAmount } = useSlippage()

  // Use useCallback for token selection handlers
  const handleTokenASelect = useCallback((token: Token) => {
    console.log("Token A selected:", token)
    setTokenA(token)
  }, [])

  const handleTokenBSelect = useCallback((token: Token) => {
    console.log("Token B selected:", token)
    setTokenB(token)
  }, [])

  // Fetch all user's liquidity positions when wallet is connected
  useEffect(() => {
    const fetchLiquidityPositions = async () => {
      if (!isConnected || !provider || !account || !currentNetwork?.contracts?.FACTORY || !currentNetwork?.contracts?.WETH) {
        setLiquidityPositions([])
        return
      }

      try {
        setIsLoadingPositions(true)
        // Use factory address from current network
        const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)

        // Get total number of pairs
        const pairsLength = await factoryContract.allPairsLength()
        const positions: LiquidityPosition[] = []

        // We'll check the most recent 100 pairs to find user's positions
        // In a production app, you'd use events or a subgraph for better performance
        const maxPairsToCheck = Math.min(100, Number(pairsLength))

        for (let i = Number(pairsLength) - 1; i >= Number(pairsLength) - maxPairsToCheck && i >= 0; i--) {
          try {
            const pairAddress = await factoryContract.allPairs(i)
            const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)

            // Check if user has LP tokens
            const lpBalance = await pairContract.balanceOf(account)

            if (lpBalance > 0) {
              // Get pair tokens
              const token0Address = await pairContract.token0()
              const token1Address = await pairContract.token1()
              const reserves = await pairContract.getReserves()
              const totalSupply = await pairContract.totalSupply()

              // Get token info
              let token0: Token
              let token1: Token

              // Use WETH address and native currency info from current network
              if (token0Address.toLowerCase() === currentNetwork.contracts.WETH.address.toLowerCase()) {
                token0 = {
                  address: "ETH", // Represent native ETH with a placeholder address
                  name: currentNetwork.nativeCurrency.name,
                  symbol: currentNetwork.nativeCurrency.symbol,
                  decimals: currentNetwork.nativeCurrency.decimals,
                  logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
                  isNative: true,
                }
              } else {
                const tokenContract = new ethers.Contract(token0Address, erc20Abi, provider)
                const symbol = await tokenContract.symbol()
                const name = await tokenContract.name()
                const decimals = await tokenContract.decimals()

                // Find token in our token list
                const tokenConfig = tokensData.tokens.find((t: Token) => t.address.toLowerCase() === token0Address.toLowerCase() && t.chainId === currentNetwork.chainId)

                token0 = {
                  address: token0Address,
                  name,
                  symbol,
                  decimals,
                  logoURI: tokenConfig?.logoURI || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token0Address}/logo.png`,
                }
              }

              // Use WETH address and native currency info from current network
              if (token1Address.toLowerCase() === currentNetwork.contracts.WETH.address.toLowerCase()) {
                token1 = {
                  address: "ETH", // Represent native ETH with a placeholder address
                  name: currentNetwork.nativeCurrency.name,
                  symbol: currentNetwork.nativeCurrency.symbol,
                  decimals: currentNetwork.nativeCurrency.decimals,
                  logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
                  isNative: true,
                }
              } else {
                const tokenContract = new ethers.Contract(token1Address, erc20Abi, provider)
                const symbol = await tokenContract.symbol()
                const name = await tokenContract.name()
                const decimals = await tokenContract.decimals()

                // Find token in our token list
                const tokenConfig = tokensData.tokens.find((t: Token) => t.address.toLowerCase() === token1Address.toLowerCase() && t.chainId === currentNetwork.chainId)

                token1 = {
                  address: token1Address,
                  name,
                  symbol,
                  decimals,
                  logoURI: tokenConfig?.logoURI || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token1Address}/logo.png`,
                }
              }

              positions.push({
                pairAddress,
                tokenA: token0,
                tokenB: token1,
                lpBalance: lpBalance.toString(),
                reserveA: reserves[0].toString(),
                reserveB: reserves[1].toString(),
                lpTotalSupply: totalSupply.toString(),
              })
            }
          } catch (error) {
            console.error(`Error checking pair ${i}:`, error)
            continue
          }
        }

        setLiquidityPositions(positions)
      } catch (error) {
        console.error("Error fetching liquidity positions:", error)
        toast({
          title: "Error fetching positions",
          description: "Failed to load your liquidity positions",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPositions(false)
      }
    }

    fetchLiquidityPositions()
  }, [isConnected, provider, account, toast, currentNetwork])

  // Select a position
  const handleSelectPosition = (position: LiquidityPosition) => {
    setSelectedPosition(position)
    setTokenA(position.tokenA)
    setTokenB(position.tokenB)

    setPoolInfo({
      exists: true,
      pairAddress: position.pairAddress,
      reserveA: position.reserveA,
      reserveB: position.reserveB,
      ratio: Number(position.reserveA) / Number(position.reserveB),
      lpBalance: position.lpBalance,
      lpTotalSupply: position.lpTotalSupply,
    })

    // Calculate initial amounts based on 50% removal
    calculateAmountsToReceive(position.lpBalance, 50, position.reserveA, position.reserveB, position.lpTotalSupply)
  }

  // Check if pool exists and get LP balance when tokens are selected
  useEffect(() => {
    const checkPool = async () => {
      if (!tokenA || !tokenB || !provider || !account || selectedPosition || !currentNetwork?.contracts?.FACTORY || !currentNetwork?.contracts?.WETH) return

      try {
        setIsCheckingPool(true)
        // Use factory address from current network
        const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)

        // Get token addresses, handling native ETH
        const tokenAAddress = tokenA.isNative ? currentNetwork.contracts.WETH.address : tokenA.address
        const tokenBAddress = tokenB.isNative ? currentNetwork.contracts.WETH.address : tokenB.address

        // Check if pair exists
        const pairAddress = await factoryContract.getPair(tokenAAddress, tokenBAddress)

        if (pairAddress && pairAddress !== ethers.ZeroAddress) {
          // Pool exists, get reserves
          const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)
          const reserves = await pairContract.getReserves()
          const totalSupply = await pairContract.totalSupply()
          const lpBalance = await pairContract.balanceOf(account)

          // Determine token order (token0, token1)
          const token0 = await pairContract.token0()
          const isTokenAToken0 = tokenAAddress.toLowerCase() === token0.toLowerCase()

          const reserveA = isTokenAToken0 ? reserves[0] : reserves[1]
          const reserveB = isTokenAToken0 ? reserves[1] : reserves[0]

          // Calculate ratio
          const ratio = reserveB > 0 ? Number(reserveA) / Number(reserveB) : 0

          setPoolInfo({
            exists: true,
            pairAddress,
            reserveA: reserveA.toString(),
            reserveB: reserveB.toString(),
            ratio,
            lpBalance: lpBalance.toString(),
            lpTotalSupply: totalSupply.toString(),
          })

          // Calculate initial amounts based on 50% removal
          calculateAmountsToReceive(
            lpBalance.toString(),
            50,
            reserveA.toString(),
            reserveB.toString(),
            totalSupply.toString(),
          )
        } else {
          // No pool
          setPoolInfo({
            exists: false,
            pairAddress: null,
            reserveA: "0",
            reserveB: "0",
            ratio: 0,
            lpBalance: "0",
            lpTotalSupply: "0",
          })
          setAmountA("0")
          setAmountB("0")
        }
      } catch (error) {
        console.error("Error checking pool:", error)
        setPoolInfo({
          exists: false,
          pairAddress: null,
          reserveA: "0",
          reserveB: "0",
          ratio: 0,
          lpBalance: "0",
          lpTotalSupply: "0",
        })
        setAmountA("0")
        setAmountB("0")
      } finally {
        setIsCheckingPool(false)
      }
    }

    checkPool()
  }, [tokenA, tokenB, provider, account, selectedPosition, currentNetwork])

  // Calculate amounts to receive based on percentage
  const calculateAmountsToReceive = (
    lpBalance: string,
    percent: number,
    reserveA: string,
    reserveB: string,
    totalSupply: string,
  ) => {
    if (
      !lpBalance ||
      lpBalance === "0" ||
      !reserveA ||
      !reserveB ||
      !totalSupply ||
      totalSupply === "0" ||
      !tokenA ||
      !tokenB
    ) {
      setAmountA("0")
      setAmountB("0")
      return
    }

    try {
      // Calculate LP tokens to burn based on percentage
      const lpTokensToBurn = (BigInt(lpBalance) * BigInt(percent)) / BigInt(100)

      // Calculate token amounts to receive
      const amountAToReceive = (BigInt(reserveA) * lpTokensToBurn) / BigInt(totalSupply)
      const amountBToReceive = (BigInt(reserveB) * lpTokensToBurn) / BigInt(totalSupply)

      // Format amounts
      setAmountA(ethers.formatUnits(amountAToReceive, tokenA.decimals))
      setAmountB(ethers.formatUnits(amountBToReceive, tokenB.decimals))
    } catch (error) {
      console.error("Error calculating amounts:", error)
      setAmountA("0")
      setAmountB("0")
    }
  }

  // Handle slider change
  const handlePercentChange = (value: number[]) => {
    const percent = value[0]
    setPercentToRemove(percent)

    // Recalculate amounts based on new percentage
    calculateAmountsToReceive(poolInfo.lpBalance, percent, poolInfo.reserveA, poolInfo.reserveB, poolInfo.lpTotalSupply)
  }

  const checkAllowance = async () => {
    if (!signer || !poolInfo.pairAddress || !currentNetwork?.contracts?.ROUTER) return

    try {
      const pairContract = new ethers.Contract(poolInfo.pairAddress, pairAbi, signer)
      // Use router address from current network
      const allowanceAmount = await pairContract.allowance(account, currentNetwork.contracts.ROUTER.address)
      setAllowance(allowanceAmount.toString())
    } catch (error) {
      console.error("Error checking allowance:", error)
    }
  }

  const approveLPTokens = async () => {
    if (!signer || !poolInfo.pairAddress || !currentNetwork?.contracts?.ROUTER) return

    try {
      setIsApproving(true)
      const pairContract = new ethers.Contract(poolInfo.pairAddress, pairAbi, signer)

      // Calculate LP tokens to burn
      const lpTokensToBurn = (BigInt(poolInfo.lpBalance) * BigInt(percentToRemove)) / BigInt(100)

      // Use router address from current network
      const tx = await pairContract.approve(currentNetwork.contracts.ROUTER.address, lpTokensToBurn)
      await tx.wait()

      toast({
        title: "Approval successful",
        description: "LP tokens approved for removal",
      })

      await checkAllowance()
    } catch (error) {
      console.error("Error approving LP tokens:", error)
      toast({
        title: "Approval failed",
        description: "Failed to approve LP tokens",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const removeLiquidity = async () => {
    if (!signer || !tokenA || !tokenB || !poolInfo.pairAddress || !currentNetwork?.contracts?.ROUTER || !currentNetwork?.contracts?.WETH || !currentNetwork?.contracts?.FACTORY) return

    try {
      setIsLoading(true)
      // Use router address from current network
      const routerContract = new ethers.Contract(currentNetwork.contracts.ROUTER.address, routerAbi, signer)

      // Calculate LP tokens to burn
      const lpTokensToBurn = (BigInt(poolInfo.lpBalance) * BigInt(percentToRemove)) / BigInt(100)

      // Calculate minimum amounts using custom slippage
      const amountABigInt = ethers.parseUnits(amountA, tokenA.decimals)
      const amountBBigInt = ethers.parseUnits(amountB, tokenB.decimals)

      const amountAMin = calculateMinimumAmount(amountABigInt)
      const amountBMin = calculateMinimumAmount(amountBBigInt)

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

      let tx

      if (tokenA.isNative || tokenB.isNative) {
        // ETH + Token
        const token = tokenA.isNative ? tokenB : tokenA
        const tokenAmountMin = tokenA.isNative ? amountBMin : amountAMin
        const ethAmountMin = tokenA.isNative ? amountAMin : amountBMin

        // Use router address from current network
        tx = await routerContract.removeLiquidityETH(
          token.address,
          lpTokensToBurn,
          tokenAmountMin,
          ethAmountMin,
          account,
          deadline,
        )
      } else {
        // Token + Token
        // Use router address from current network
        tx = await routerContract.removeLiquidity(
          tokenA.address,
          tokenB.address,
          lpTokensToBurn,
          amountAMin,
          amountBMin,
          account,
          deadline,
        )
      }

      await tx.wait()

      toast({
        title: "Liquidity removed",
        description: `Removed ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} from the liquidity pool`,
      })

      // Reset state
      setPercentToRemove(50)
      setAmountA("0")
      setAmountB("0")
      setShowConfirmation(false)
      setSelectedPosition(null)

      // Refresh pool info after removing liquidity
      // Use factory address from current network
      const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)
      // Use WETH address from current network
      const tokenAAddress = tokenA.isNative ? currentNetwork.contracts.WETH.address : tokenA.address
      const tokenBAddress = tokenB.isNative ? currentNetwork.contracts.WETH.address : tokenB.address
      const pairAddress = await factoryContract.getPair(tokenAAddress, tokenBAddress)

      if (pairAddress && pairAddress !== ethers.ZeroAddress) {
        const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)
        const reserves = await pairContract.getReserves()
        const totalSupply = await pairContract.totalSupply()
        const lpBalance = await pairContract.balanceOf(account)

        const token0 = await pairContract.token0()
        const isTokenAToken0 = tokenAAddress.toLowerCase() === token0.toLowerCase()

        const reserveA = isTokenAToken0 ? reserves[0] : reserves[1]
        const reserveB = isTokenAToken0 ? reserves[1] : reserves[0]
        const ratio = reserveB > 0 ? Number(reserveA) / Number(reserveB) : 0

        setPoolInfo({
          exists: true,
          pairAddress,
          reserveA: reserveA.toString(),
          reserveB: reserveB.toString(),
          ratio,
          lpBalance: lpBalance.toString(),
          lpTotalSupply: totalSupply.toString(),
        })

        // Recalculate amounts
        calculateAmountsToReceive(
          lpBalance.toString(),
          50,
          reserveA.toString(),
          reserveB.toString(),
          totalSupply.toString(),
        )
      }

      // Refresh all positions
      // Use factory address from current network
      const factoryContractForPositions = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)
      // Use WETH address and native currency info from current network

      const positions = [...liquidityPositions]
      const positionIndex = positions.findIndex((p) => p.pairAddress === pairAddress)
      if (positionIndex !== -1) {
        const lpBalance = await new ethers.Contract(pairAddress, pairAbi, provider).balanceOf(account)
        const reserves = await new ethers.Contract(pairAddress, pairAbi, provider).getReserves()
        const totalSupply = await new ethers.Contract(pairAddress, pairAbi, provider).totalSupply()

        if (lpBalance.toString() === "0") {
          // Remove position if no more liquidity
          positions.splice(positionIndex, 1)
        } else {
          // Update position
          positions[positionIndex] = {
            ...positions[positionIndex],
            lpBalance: lpBalance.toString(),
            reserveA: reserves[0].toString(),
            reserveB: reserves[1].toString(),
            lpTotalSupply: totalSupply.toString(),
          }
        }
        setLiquidityPositions(positions)
      }
    } catch (error) {
      console.error("Error removing liquidity:", error)
      toast({
        title: "Failed to remove liquidity",
        description: "An error occurred while removing liquidity. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (poolInfo.pairAddress && signer) {
      checkAllowance()
    }
  }, [poolInfo.pairAddress, signer, account, currentNetwork])

  const needsApproval = () => {
    if (!poolInfo.pairAddress || !currentNetwork?.contracts?.ROUTER) return false

    try {
      // Calculate LP tokens to burn
      const lpTokensToBurn = (BigInt(poolInfo.lpBalance) * BigInt(percentToRemove)) / BigInt(100)
      return BigInt(allowance) < lpTokensToBurn
    } catch (error) {
      return false
    }
  }

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet"
    if (!isCorrectNetwork) return `Switch to ${currentNetwork?.name || "Supported Network"}`
    if (selectedPosition || (tokenA && tokenB)) {
      if (!poolInfo.exists) return "Pool Not Found"
      if (poolInfo.lpBalance === "0") return "No Liquidity Found"
      if (needsApproval()) return "Approve"
      return "Remove Liquidity"
    }
    return "Select Position"
  }

  const handleButtonClick = async () => {
    if (!isConnected) {
      connect()
    } else if (!isCorrectNetwork) {
      switchNetwork()
    } else if (needsApproval()) {
      approveLPTokens()
    } else if ((selectedPosition || (tokenA && tokenB)) && poolInfo.exists && poolInfo.lpBalance !== "0") {
      setShowConfirmation(true)
    }
  }

  const formatBalance = (balance: string, decimals = 18) => {
    if (!balance || balance === "0") return "0"
    return Number(ethers.formatUnits(balance, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })
  }

  const resetSelection = () => {
    setSelectedPosition(null)
    setTokenA(null)
    setTokenB(null)
    setPoolInfo({
      exists: false,
      pairAddress: null,
      reserveA: "0",
      reserveB: "0",
      ratio: 0,
      lpBalance: "0",
      lpTotalSupply: "0",
    })
    setAmountA("0")
    setAmountB("0")
  }

  // Calculate user's share of the pool
  const calculatePoolShare = (lpBalance: string, totalSupply: string) => {
    if (!lpBalance || lpBalance === "0" || !totalSupply || totalSupply === "0") return "0"

    try {
      const share = (Number(lpBalance) / Number(totalSupply)) * 100
      return share.toFixed(2)
    } catch (error) {
      return "0"
    }
  }

  return (
    <div className="space-y-4 mt-4">
      {isConnected && !isCorrectNetwork && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Please switch to the {currentNetwork?.name || "Supported Network"} network</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Remove Liquidity</h2>
      </div>

      {!isConnected ? (
        <div className="p-4 rounded-lg border text-center">
          <p className="mb-4 text-muted-foreground">Connect your wallet to view your liquidity positions</p>
          <Button onClick={connect}>Connect Wallet</Button>
        </div>
      ) : isLoadingPositions ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading your liquidity positions...</p>
        </div>
      ) : (
        <>
          {!selectedPosition && !showManualSelection ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your Liquidity Positions</h3>
                <Button variant="outline" size="sm" onClick={() => setShowManualSelection(true)}>
                  Select Manually
                </Button>
              </div>

              {liquidityPositions.length === 0 ? (
                <div className="p-6 rounded-lg border text-center bg-card/50">
                  <p className="text-muted-foreground mb-4">You don't have any liquidity positions</p>
                  <Button variant="outline" onClick={() => setShowManualSelection(true)}>
                    Select Tokens Manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {liquidityPositions.map((position, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:border-primary cursor-pointer transition-colors position-card"
                      onClick={() => handleSelectPosition(position)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background z-10 token-badge">
                                {position.tokenA.logoURI ? (
                                  <img
                                    src={position.tokenA.logoURI || "/placeholder.svg"}
                                    alt={position.tokenA.symbol}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                    {position.tokenA.symbol.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background token-badge">
                                {position.tokenB.logoURI ? (
                                  <img
                                    src={position.tokenB.logoURI || "/placeholder.svg"}
                                    alt={position.tokenB.symbol}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                    {position.tokenB.symbol.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-base">
                                {position.tokenA.symbol}/{position.tokenB.symbol}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                  {calculatePoolShare(position.lpBalance, position.lpTotalSupply)}% Pool Share
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatBalance(position.lpBalance)} LP</p>
                            <div className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                              <span>View on Explorer</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {showManualSelection && !selectedPosition && (
                <div className="p-4 rounded-lg border mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Select Pair</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setShowManualSelection(false)
                        resetSelection()
                      }}
                    >
                      Back to Positions
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <TokenSelector onSelect={handleTokenASelect} selectedToken={tokenA} otherToken={tokenB} />
                    <span className="text-sm text-muted-foreground">/</span>
                    <TokenSelector onSelect={handleTokenBSelect} selectedToken={tokenB} otherToken={tokenA} />
                  </div>
                </div>
              )}

              {selectedPosition && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedPosition.tokenA.symbol}/{selectedPosition.tokenB.symbol} Pool
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetSelection}>
                    Back to Positions
                  </Button>
                </div>
              )}

              {isCheckingPool ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {(selectedPosition || (tokenA && tokenB)) && (
                    <>
                      {!poolInfo.exists ? (
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-yellow-700 dark:text-yellow-400">Pool Not Found</h3>
                              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                No liquidity pool exists for {tokenA?.symbol}/{tokenB?.symbol}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : poolInfo.lpBalance === "0" ? (
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-yellow-700 dark:text-yellow-400">No Liquidity Found</h3>
                              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                You don't have any liquidity in this pool
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border space-y-4 bg-card/50">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Your Liquidity:</span>
                            <span className="text-sm font-medium">{formatBalance(poolInfo.lpBalance)} LP Tokens</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Amount to Remove:</span>
                              <span className="text-sm font-medium text-primary">{percentToRemove}%</span>
                            </div>
                            <div className="slider-enhanced">
                              <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                value={[percentToRemove]}
                                onValueChange={handlePercentChange}
                                className="my-4"
                              />
                            </div>
                            <div className="flex justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePercentChange([25])}
                                className="text-xs flex-1"
                              >
                                25%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePercentChange([50])}
                                className="text-xs flex-1"
                              >
                                50%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePercentChange([75])}
                                className="text-xs flex-1"
                              >
                                75%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePercentChange([100])}
                                className="text-xs flex-1"
                              >
                                Max
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50">
                            <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">You Will Receive:</h3>
                            <div className="space-y-2 bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded-md">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {tokenA?.logoURI ? (
                                    <div className="w-5 h-5 rounded-full overflow-hidden">
                                      <img
                                        src={tokenA.logoURI || "/placeholder.svg"}
                                        alt={tokenA.symbol}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                      {tokenA?.symbol.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm text-blue-600 dark:text-blue-500">{tokenA?.symbol}:</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {Number(amountA).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {tokenB?.logoURI ? (
                                    <div className="w-5 h-5 rounded-full overflow-hidden">
                                      <img
                                        src={tokenB.logoURI || "/placeholder.svg"}
                                        alt={tokenB.symbol}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                      {tokenB?.symbol.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm text-blue-600 dark:text-blue-500">{tokenB?.symbol}:</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {Number(amountB).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Remove Liquidity Button */}
              <Button
                className="w-full h-12 text-base shadow-sm mt-4"
                onClick={handleButtonClick}
                disabled={
                  isLoading ||
                  isApproving ||
                  isCheckingPool ||
                  !isConnected ||
                  (!selectedPosition && !tokenA && !tokenB) ||
                  !poolInfo.exists ||
                  poolInfo.lpBalance === "0"
                }
              >
                {isLoading || isApproving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{isApproving ? "Approving..." : "Removing Liquidity..."}</span>
                  </div>
                ) : (
                  getButtonText()
                )}
              </Button>
            </>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Liquidity Removal</DialogTitle>
            <DialogDescription>Please review the details before removing liquidity.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-900">
              <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">You Will Receive:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-500">{tokenA?.symbol}:</span>
                  <span className="text-sm font-medium">
                    {Number(amountA).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-500">{tokenB?.symbol}:</span>
                  <span className="text-sm font-medium">
                    {Number(amountB).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Removing:</span>
                <span className="text-sm font-medium">{percentToRemove}% of your liquidity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">LP Tokens:</span>
                <span className="text-sm font-medium">
                  {formatBalance(((BigInt(poolInfo.lpBalance) * BigInt(percentToRemove)) / BigInt(100)).toString())}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={removeLiquidity} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Removing...</span>
                </div>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
