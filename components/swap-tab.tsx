"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Settings, AlertTriangle, Loader2, Info } from "lucide-react"
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
import { useTokenBalance } from "@/hooks/use-token-balance"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SlippageSettings from "@/components/slippage-settings"

interface Token {
  address: string
  name: string
  symbol: string
  logoURI?: string
  decimals: number
  isNative?: boolean
}

interface PriceQuote {
  amountIn: string
  amountOut: string
  priceImpact: number
  fee: string
  route: string[]
  executionPrice: number
  minimumReceived: string
}

export default function SwapTab() {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const { isConnected, connect, signer, provider, account, isCorrectNetwork, switchNetwork, currentNetwork, isConnecting } = useWeb3()
  const { toast } = useToast()
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [allowance, setAllowance] = useState("0")
  const [isQuoting, setIsQuoting] = useState(false)
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSlippageSettings, setShowSlippageSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5) // Default slippage

  const { formattedBalance: fromTokenBalance, isLoading: isLoadingFromBalance } = useTokenBalance(fromToken)
  const { formattedBalance: toTokenBalance, isLoading: isLoadingToBalance } = useTokenBalance(toToken)

  const handleFromTokenSelect = useCallback((token: Token) => {
    setFromToken(token)
  }, [])

  const handleToTokenSelect = useCallback((token: Token) => {
    setToToken(token)
  }, [])

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    setPriceQuote(null)
  }

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
      setPriceQuote(null)
      if (value === "") {
        setToAmount("")
        return
      }
      if (fromToken && toToken) {
        getQuote(value, true)
      }
    }
  }

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      setPriceQuote(null)
      if (value === "") {
        setFromAmount("")
        return
      }
      if (fromToken && toToken) {
        getQuote(value, false)
      }
    }
  }

  const getQuote = async (amount: string, isExactIn: boolean) => {
    if (!provider || !fromToken || !toToken || !amount || Number(amount) <= 0 || !currentNetwork?.contracts?.ROUTER || !currentNetwork?.contracts?.FACTORY || !currentNetwork?.contracts?.WETH) return

    try {
      setIsQuoting(true)
      const routerContract = new ethers.Contract(currentNetwork.contracts.ROUTER.address, routerAbi, provider)
      const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)
      const fromTokenAddress = fromToken.isNative ? currentNetwork.contracts.WETH.address : fromToken.address
      const toTokenAddress = toToken.isNative ? currentNetwork.contracts.WETH.address : toToken.address
      const pairAddress = await factoryContract.getPair(fromTokenAddress, toTokenAddress)

      if (pairAddress === ethers.ZeroAddress) {
        toast({
          title: "No liquidity pool",
          description: `No liquidity pool exists for ${fromToken.symbol}/${toToken.symbol}`,
          variant: "destructive",
        })
        setToAmount("")
        setPriceQuote(null)
        return
      }

      const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)
      const reserves = await pairContract.getReserves()
      const token0 = await pairContract.token0()
      const isFromToken0 = fromTokenAddress.toLowerCase() === token0.toLowerCase()
      const reserveFrom = isFromToken0 ? reserves[0] : reserves[1]
      const reserveTo = isFromToken0 ? reserves[1] : reserves[0]

      let amountIn, amountOut, executionPrice

      if (isExactIn) {
        amountIn = ethers.parseUnits(amount, fromToken.decimals)
        amountOut = await routerContract.getAmountOut(amountIn, reserveFrom, reserveTo)
        const formattedAmountOut = ethers.formatUnits(amountOut, toToken.decimals)
        setToAmount(formattedAmountOut)
        executionPrice = Number(amount) / Number(formattedAmountOut)
      } else {
        amountOut = ethers.parseUnits(amount, toToken.decimals)
        amountIn = await routerContract.getAmountIn(amountOut, reserveFrom, reserveTo)
        const formattedAmountIn = ethers.formatUnits(amountIn, fromToken.decimals)
        setFromAmount(formattedAmountIn)
        executionPrice = Number(formattedAmountIn) / Number(amount)
      }

      const reserveFromFormatted = Number(ethers.formatUnits(reserveFrom, fromToken.decimals))
      const reserveToFormatted = Number(ethers.formatUnits(reserveTo, toToken.decimals))
      const spotPrice = reserveFromFormatted / reserveToFormatted
      const amountInFormatted = Number(ethers.formatUnits(amountIn, fromToken.decimals))
      const amountOutFormatted = Number(ethers.formatUnits(amountOut, toToken.decimals))
      const executionPriceCalc = amountInFormatted / amountOutFormatted
      const priceImpact = Math.abs(((executionPriceCalc - spotPrice) / spotPrice) * 100)
      const fee = ethers.formatUnits((amountIn * BigInt(3)) / BigInt(1000), fromToken.decimals)
      const minimumReceived = ethers.formatUnits((amountOut * BigInt(Math.round((100 - slippage) * 1000))) / BigInt(100000), toToken.decimals)

      const quote: PriceQuote = {
        amountIn: ethers.formatUnits(amountIn, fromToken.decimals),
        amountOut: ethers.formatUnits(amountOut, toToken.decimals),
        priceImpact,
        fee,
        route: [fromToken.symbol, toToken.symbol],
        executionPrice: executionPriceCalc,
        minimumReceived,
      }
      setPriceQuote(quote)
    } catch (error) {
      console.error("Error getting quote:", error)
      toast({
        title: "Error getting quote",
        description: "Failed to get price quote",
        variant: "destructive",
      })
      setToAmount("")
      setPriceQuote(null)
    } finally {
      setIsQuoting(false)
    }
  }

  const setMaxAmount = () => {
    if (fromToken && fromTokenBalance) {
      setFromAmount(fromTokenBalance)
      if (toToken) {
        getQuote(fromTokenBalance, true)
      }
    }
  }

  const checkAllowance = async () => {
    if (!signer || !fromToken || fromToken.isNative || !currentNetwork?.contracts?.ROUTER) return
    try {
      const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, signer)
      const allowanceAmount = await tokenContract.allowance(account, currentNetwork.contracts.ROUTER.address)
      setAllowance(allowanceAmount.toString())
    } catch (error) {
      console.error("Error checking allowance:", error)
    }
  }

  const approveToken = async () => {
    if (!signer || !fromToken || !fromAmount || fromToken.isNative || !currentNetwork?.contracts?.ROUTER) return
    try {
      setIsApproving(true)
      const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, signer)
      const amount = ethers.parseUnits(fromAmount, fromToken.decimals)
      const tx = await tokenContract.approve(currentNetwork.contracts.ROUTER.address, amount)
      await tx.wait()
      toast({
        title: "Approval successful",
        description: "Token approved for swapping",
      })
      await checkAllowance()
    } catch (error) {
      console.error("Error approving token:", error)
      toast({
        title: "Approval failed",
        description: "Failed to approve token",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const executeSwap = async () => {
    if (!signer || !fromToken || !toToken || !fromAmount || !toAmount || !priceQuote || !currentNetwork?.contracts?.ROUTER || !currentNetwork?.contracts?.WETH) return
    try {
      setIsLoading(true)
      const routerContract = new ethers.Contract(currentNetwork.contracts.ROUTER.address, routerAbi, signer)
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)
      const amountOutMin = ethers.parseUnits(priceQuote.amountOut, toToken.decimals) * BigInt(Math.round((100 - slippage) * 1000)) / BigInt(100000)

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      let tx
      if (fromToken.isNative) {
        const path = [currentNetwork.contracts.WETH.address, toToken.address]
        tx = await routerContract.swapExactETHForTokens(amountOutMin, path, account, deadline, { value: amountIn })
      } else if (toToken.isNative) {
        const path = [fromToken.address, currentNetwork.contracts.WETH.address]
        tx = await routerContract.swapExactTokensForETH(amountIn, amountOutMin, path, account, deadline)
      } else {
        const path = [fromToken.address, toToken.address]
        tx = await routerContract.swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline)
      }
      await tx.wait()
      toast({
        title: "Swap successful",
        description: `Swapped ${formatBalance(fromAmount, fromToken.decimals)} ${fromToken.symbol} for ${formatBalance(priceQuote.amountOut, toToken.decimals)} ${toToken.symbol}`,
      })
      setFromAmount("")
      setToAmount("")
      setPriceQuote(null)
      setShowConfirmation(false)
    } catch (error) {
      console.error("Error executing swap:", error)
      toast({
        title: "Swap failed",
        description: "Failed to execute swap",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fromToken && toToken && signer) {
      checkAllowances()
    }
  }, [fromToken, toToken, signer, account])

  const checkAllowances = async () => {
    if (!signer || !fromToken) return
    if (!fromToken.isNative) {
      await checkAllowance()
    }
  }

  useEffect(() => {
    setPriceQuote(null)
    setFromAmount("")
    setToAmount("")
  }, [fromToken, toToken])

  const needsApproval = () => {
    if (!fromToken || fromToken.isNative) return false
    if (!fromAmount) return false
    try {
      const amount = ethers.parseUnits(fromAmount, fromToken.decimals)
      return ethers.getBigInt(allowance) < amount
    } catch (error) {
      return false
    }
  }

  const formatBalance = (balance: string, decimals: number = 18) => {
    if (!balance || balance === "0") return "0";
    const num = Number(balance);
    if (num < 0.0001 && num > 0) {
      return num.toExponential(2);
    }
    return num.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet"
    if (!isCorrectNetwork) return `Switch to ${currentNetwork?.name || "Supported Network"}`
    if (!fromToken || !toToken) return "Select Tokens"
    if (!fromAmount || !toAmount) return "Enter Amount"
    if (needsApproval()) return "Approve"
    return "Swap"
  }

  const handleButtonClick = async () => {
    if (!isConnected) {
      connect()
    } else if (!isCorrectNetwork) {
      switchNetwork()
    } else if (needsApproval()) {
      approveToken()
    } else if (fromToken && toToken && fromAmount && toAmount) {
      setShowConfirmation(true)
    }
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return "text-green-600"
    if (impact < 3) return "text-yellow-600"
    if (impact < 5) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4">
      {/* Network Warning */}
      {isConnected && !isCorrectNetwork && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm animate-fade-in">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Switch to {currentNetwork?.name || "Supported Network"}</span>
        </div>
      )}

      {/* From Token */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
          <div className="flex items-center gap-2">
            {isLoadingFromBalance && isConnected ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : null}
            <span className="balance-text">
              Balance: {isConnected ? formatBalance(fromTokenBalance, fromToken?.decimals || 18) : "0"}
            </span>
            {fromToken && isConnected && (
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-primary hover:bg-primary/10" onClick={setMaxAmount}>
                MAX
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={fromAmount}
            onChange={handleFromAmountChange}
            placeholder="0.0"
            className="input-clean flex-1 min-w-0"
          />
          <TokenSelector onSelect={handleFromTokenSelect} selectedToken={fromToken} otherToken={toToken} />
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center">
        <div className="swap-arrow" onClick={switchTokens}>
          <ArrowDown className="h-4 w-4" />
        </div>
      </div>

      {/* To Token */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">To</span>
          <div className="flex items-center gap-2">
            {isLoadingToBalance && isConnected ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : null}
            <span className="balance-text">
              Balance: {isConnected ? formatBalance(toTokenBalance, toToken?.decimals || 18) : "0"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={toAmount}
            onChange={handleToAmountChange}
            placeholder="0.0"
            className="input-clean flex-1 min-w-0"
            disabled={true}
          />
          <TokenSelector onSelect={handleToTokenSelect} selectedToken={toToken} otherToken={fromToken} />
        </div>
      </div>

      {/* Price Quote */}
      {priceQuote && (
        <div className="card-clean p-4 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 w-full text-sm">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Price Quote</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                <span className="text-right font-medium">
                  1 {fromToken?.symbol} = {(1 / priceQuote.executionPrice).toFixed(4)} {toToken?.symbol}
                </span>
                <span className="text-gray-500 dark:text-gray-400">Price Impact:</span>
                <span className={`text-right font-medium ${getPriceImpactColor(priceQuote.priceImpact)}`}>
                  {priceQuote.priceImpact.toFixed(2)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                <span className="text-right font-medium">
                  {formatBalance(priceQuote.fee, fromToken?.decimals || 18)} {fromToken?.symbol}
                </span>
                <span className="text-gray-500 dark:text-gray-400">Min Received:</span>
                <span className="text-right font-medium">
                  {formatBalance(priceQuote.minimumReceived, toToken?.decimals || 18)} {toToken?.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        className="button-primary w-full h-12 text-base"
        onClick={handleButtonClick}
        disabled={
          isLoading ||
          isApproving ||
          isQuoting ||
          (!isConnected && !fromToken && !toToken && !fromAmount && !toAmount)
        }
      >
        {isLoading || isApproving || isQuoting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{isApproving ? "Approving..." : isQuoting ? "Getting Quote..." : "Swapping..."}</span>
          </div>
        ) : (
          getButtonText()
        )}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Swap</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">Review the swap details before confirming.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {fromToken?.logoURI ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={fromToken.logoURI || "/placeholder.svg"}
                      alt={fromToken.symbol}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-sm">
                    {fromToken?.symbol.charAt(0)}
                  </div>
                )}
                <span className="text-base font-medium">
                  {formatBalance(fromAmount, fromToken?.decimals || 18)} {fromToken?.symbol}
                </span>
              </div>
              <ArrowDown className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-3">
                {toToken?.logoURI ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={toToken.logoURI || "/placeholder.svg"}
                      alt={toToken.symbol}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-sm">
                    {toToken?.symbol.charAt(0)}
                  </div>
                )}
                <span className="text-base font-medium">
                  {formatBalance(toAmount, toToken?.decimals || 18)} {toToken?.symbol}
                </span>
              </div>
            </div>

            {priceQuote && (
              <div className="space-y-2 text-sm border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Rate</span>
                  <span className="font-medium">
                    1 {fromToken?.symbol} = {(1 / priceQuote.executionPrice).toFixed(4)} {toToken?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Price Impact</span>
                  <span className={`font-medium ${getPriceImpactColor(priceQuote.priceImpact)}`}>
                    {priceQuote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Min Received</span>
                  <span className="font-medium">
                    {formatBalance(priceQuote.minimumReceived, toToken?.decimals || 18)} {toToken?.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Fee</span>
                  <span className="font-medium">
                    {formatBalance(priceQuote.fee, fromToken?.decimals || 18)} {fromToken?.symbol}
                  </span>
                </div>
              </div>
            )}

            {priceQuote && priceQuote.priceImpact > 5 && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>High price impact! You may lose a significant amount due to slippage.</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={executeSwap} disabled={isLoading} className="button-primary rounded-lg">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Swapping...</span>
                </div>
              ) : (
                "Confirm Swap"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}