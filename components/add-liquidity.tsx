"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, AlertTriangle, Loader2, Info } from "lucide-react"
import TokenSelector from "@/components/token-selector"
import { useWeb3 } from "@/context/web3-context"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import contractsData from "@/data/contracts.json"
import routerAbi from "@/data/abis/router.json"
import factoryAbi from "@/data/abis/factory.json"
import erc20Abi from "@/data/abis/erc20.json"
import pairAbi from "@/data/abis/pair.json"
import networkConfig from "@/data/network.json"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useSlippage } from "@/hooks/use-slippage"

interface Token {
  address: string
  name: string
  symbol: string
  logoURI?: string
  decimals: number
  isNative?: boolean
}

interface PoolInfo {
  exists: boolean
  pairAddress: string | null
  reserveA: string
  reserveB: string
  ratio: number
}

export default function AddLiquidity({
  slippage,
  updateSlippage,
}: { slippage: number; updateSlippage: (newSlippage: number) => void }) {
  const [tokenA, setTokenA] = useState<Token | null>(null)
  const [tokenB, setTokenB] = useState<Token | null>(null)
  const { isConnected, connect, signer, provider, account, isCorrectNetwork, switchNetwork, currentNetwork } = useWeb3()
  const { toast } = useToast()
  const [amountA, setAmountA] = useState("")
  const [amountB, setAmountB] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [allowanceA, setAllowanceA] = useState("0")
  const [allowanceB, setAllowanceB] = useState("0")
  const [poolInfo, setPoolInfo] = useState<PoolInfo>({
    exists: false,
    pairAddress: null,
    reserveA: "0",
    reserveB: "0",
    ratio: 0,
  })
  const [isCheckingPool, setIsCheckingPool] = useState(false)
  const [activeInput, setActiveInput] = useState<"A" | "B" | null>(null)
  const { calculateMinimumAmount } = useSlippage()

  const { formattedBalance: tokenABalance, isLoading: isLoadingTokenABalance } = useTokenBalance(tokenA)
  const { formattedBalance: tokenBBalance, isLoading: isLoadingTokenBBalance } = useTokenBalance(tokenB)

  const handleTokenASelect = useCallback((token: Token) => {
    console.log("Token A selected:", token)
    setTokenA(token)
    setAmountA("")
    setActiveInput(null)
  }, [])

  const handleTokenBSelect = useCallback((token: Token) => {
    console.log("Token B selected:", token)
    setTokenB(token)
    setAmountB("")
    setActiveInput(null)
  }, [])

  const swapTokens = useCallback(() => {
    const tempToken = tokenA
    const tempAmount = amountA
    setTokenA(tokenB)
    setTokenB(tempToken)
    setAmountA(amountB)
    setAmountB(tempAmount)
    setActiveInput(null)
  }, [tokenA, tokenB, amountA, amountB])

  useEffect(() => {
    const checkPool = async () => {
      if (!tokenA || !tokenB || !provider || !currentNetwork?.contracts?.FACTORY) return

      try {
        setIsCheckingPool(true)
        const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)
        const tokenAAddress = tokenA.isNative ? currentNetwork.contracts.WETH.address : tokenA.address
        const tokenBAddress = tokenB.isNative ? currentNetwork.contracts.WETH.address : tokenB.address
        const pairAddress = await factoryContract.getPair(tokenAAddress, tokenBAddress)

        if (pairAddress && pairAddress !== ethers.ZeroAddress) {
          const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)
          const reserves = await pairContract.getReserves()
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
          })
          setAmountA("")
          setAmountB("")
        } else {
          setPoolInfo({
            exists: false,
            pairAddress: null,
            reserveA: "0",
            reserveB: "0",
            ratio: 0,
          })
        }
      } catch (error) {
        console.error("Error checking pool:", error)
        setPoolInfo({
          exists: false,
          pairAddress: null,
          reserveA: "0",
          reserveB: "0",
          ratio: 0,
        })
      } finally {
        setIsCheckingPool(false)
      }
    }

    checkPool()
  }, [tokenA, tokenB, provider, currentNetwork])

  const handleAmountAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountA(value)
      setActiveInput("A")
      if (poolInfo.exists && value !== "" && tokenA && tokenB) {
        try {
          const valueInWei = ethers.parseUnits(value, tokenA.decimals)
          if (poolInfo.ratio > 0) {
            const calculatedAmountB = Number(ethers.formatUnits(valueInWei, tokenA.decimals)) / poolInfo.ratio
            const formattedAmountB = calculatedAmountB.toFixed(tokenB.decimals > 6 ? 6 : tokenB.decimals)
            setAmountB(formattedAmountB)
          }
        } catch (error) {
          console.error("Error calculating token B amount:", error)
        }
      } else if (value === "") {
        setAmountB("")
      }
    }
  }

  const handleAmountBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountB(value)
      setActiveInput("B")
      if (poolInfo.exists && value !== "" && tokenA && tokenB) {
        try {
          const valueInWei = ethers.parseUnits(value, tokenB.decimals)
          if (poolInfo.ratio > 0) {
            const calculatedAmountA = Number(ethers.formatUnits(valueInWei, tokenB.decimals)) * poolInfo.ratio
            const formattedAmountA = calculatedAmountA.toFixed(tokenA.decimals > 6 ? 6 : tokenA.decimals)
            setAmountA(formattedAmountA)
          }
        } catch (error) {
          console.error("Error calculating token A amount:", error)
        }
      } else if (value === "") {
        setAmountA("")
      }
    }
  }

  const setMaxAmountA = () => {
    if (tokenA && tokenABalance) {
      setAmountA(tokenABalance)
      setActiveInput("A")
      if (poolInfo.exists && tokenB) {
        try {
          const valueInWei = ethers.parseUnits(tokenABalance, tokenA.decimals)
          if (poolInfo.ratio > 0) {
            const calculatedAmountB = Number(ethers.formatUnits(valueInWei, tokenA.decimals)) / poolInfo.ratio
            const formattedAmountB = calculatedAmountB.toFixed(tokenB.decimals > 6 ? 6 : tokenB.decimals)
            setAmountB(formattedAmountB)
          }
        } catch (error) {
          console.error("Error calculating token B amount:", error)
        }
      }
    }
  }

  const setMaxAmountB = () => {
    if (tokenB && tokenBBalance) {
      setAmountB(tokenBBalance)
      setActiveInput("B")
      if (poolInfo.exists && tokenA) {
        try {
          const valueInWei = ethers.parseUnits(tokenBBalance, tokenB.decimals)
          if (poolInfo.ratio > 0) {
            const calculatedAmountA = Number(ethers.formatUnits(valueInWei, tokenB.decimals)) * poolInfo.ratio
            const formattedAmountA = calculatedAmountA.toFixed(tokenA.decimals > 6 ? 6 : tokenA.decimals)
            setAmountA(formattedAmountA)
          }
        } catch (error) {
          console.error("Error calculating token A amount:", error)
        }
      }
    }
  }

  const checkAllowances = async () => {
    if (!signer || !tokenA || !tokenB || !currentNetwork?.contracts?.ROUTER) return

    try {
      if (!tokenA.isNative) {
        const tokenAContract = new ethers.Contract(tokenA.address, erc20Abi, signer)
        const allowanceAmountA = await tokenAContract.allowance(account, currentNetwork.contracts.ROUTER.address)
        setAllowanceA(allowanceAmountA.toString())
      } else {
        setAllowanceA(ethers.MaxUint256.toString())
      }

      if (!tokenB.isNative) {
        const tokenBContract = new ethers.Contract(tokenB.address, erc20Abi, signer)
        const allowanceAmountB = await tokenBContract.allowance(account, currentNetwork.contracts.ROUTER.address)
        setAllowanceB(allowanceAmountB.toString())
      } else {
        setAllowanceB(ethers.MaxUint256.toString())
      }
    } catch (error) {
      console.error("Error checking allowances:", error)
    }
  }

  const approveTokens = async () => {
    if (!signer || !tokenA || !tokenB || !amountA || !amountB || !currentNetwork?.contracts?.ROUTER) return

    try {
      setIsApproving(true)
      if (!tokenA.isNative && needsApprovalA()) {
        const tokenAContract = new ethers.Contract(tokenA.address, erc20Abi, signer)
        const amountAToApprove = ethers.parseUnits(amountA, tokenA.decimals)
        const txA = await tokenAContract.approve(currentNetwork.contracts.ROUTER.address, amountAToApprove)
        await txA.wait()
      }

      if (!tokenB.isNative && needsApprovalB()) {
        const tokenBContract = new ethers.Contract(tokenB.address, erc20Abi, signer)
        const amountBToApprove = ethers.parseUnits(amountB, tokenB.decimals)
        const txB = await tokenBContract.approve(currentNetwork.contracts.ROUTER.address, amountBToApprove)
        await txB.wait()
      }

      toast({
        title: "Approval successful",
        description: "Tokens approved for adding liquidity",
      })
      await checkAllowances()
    } catch (error) {
      console.error("Error approving tokens:", error)
      toast({
        title: "Approval failed",
        description: "Failed to approve tokens",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const addLiquidity = async () => {
    if (!signer || !tokenA || !tokenB || !amountA || !amountB || !currentNetwork?.contracts?.ROUTER || !currentNetwork?.contracts?.WETH || !currentNetwork?.contracts?.FACTORY) return

    try {
      setIsLoading(true)
      const routerContract = new ethers.Contract(currentNetwork.contracts.ROUTER.address, routerAbi, signer)
      const amountADesired = ethers.parseUnits(amountA, tokenA.decimals)
      const amountBDesired = ethers.parseUnits(amountB, tokenB.decimals)
      const amountAMin = calculateMinimumAmount(amountADesired)
      const amountBMin = calculateMinimumAmount(amountBDesired)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      console.log("Adding liquidity with params:", {
        tokenA: tokenA.address,
        tokenB: tokenB.address,
        amountADesired: amountADesired.toString(),
        amountBDesired: amountBDesired.toString(),
        amountAMin: amountAMin.toString(),
        amountBMin: amountBMin.toString(),
        slippage: slippage,
        account,
        deadline,
      })

      let tx
      if (tokenA.isNative || tokenB.isNative) {
        const token = tokenA.isNative ? tokenB : tokenA
        const tokenAmount = tokenA.isNative ? amountBDesired : amountADesired
        const tokenAmountMin = tokenA.isNative ? amountBMin : amountAMin
        const nativeAmount = tokenA.isNative ? amountADesired : amountBDesired
        const nativeAmountMin = tokenA.isNative ? amountAMin : amountBMin

        console.log("Adding native currency liquidity with params:", {
          token: token.address,
          tokenAmount: tokenAmount.toString(),
          tokenAmountMin: tokenAmountMin.toString(),
          nativeAmountMin: nativeAmountMin.toString(),
          account,
          deadline,
          value: nativeAmount.toString(),
        })

        tx = await routerContract.addLiquidityETH(
          token.address,
          tokenAmount,
          tokenAmountMin,
          nativeAmountMin,
          account,
          deadline,
          { value: nativeAmount },
        )
      } else {
        tx = await routerContract.addLiquidity(
          tokenA.address,
          tokenB.address,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          account,
          deadline,
        )
      }

      await tx.wait()

      toast({
        title: "Liquidity added",
        description: `Added ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} to the liquidity pool`,
      })

      setAmountA("")
      setAmountB("")
      setActiveInput(null)

      const factoryContract = new ethers.Contract(currentNetwork.contracts.FACTORY.address, factoryAbi, provider)
      const tokenAAddress = tokenA.isNative ? currentNetwork.contracts.WETH.address : tokenA.address
      const tokenBAddress = tokenB.isNative ? currentNetwork.contracts.WETH.address : tokenB.address
      const pairAddress = await factoryContract.getPair(tokenAAddress, tokenBAddress)

      if (pairAddress && pairAddress !== ethers.ZeroAddress) {
        const pairContract = new ethers.Contract(pairAddress, pairAbi, provider)
        const reserves = await pairContract.getReserves()
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
        })
      }
    } catch (error) {
      console.error("Error adding liquidity:", error)
      toast({
        title: "Failed to add liquidity",
        description: "An error occurred while adding liquidity. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tokenA && tokenB && signer) {
      checkAllowances()
    }
  }, [tokenA, tokenB, signer, account])

  useEffect(() => {
    console.log("Token states updated:", { tokenA, tokenB })
  }, [tokenA, tokenB])

  const needsApprovalA = () => {
    if (!tokenA || tokenA.isNative) return false
    if (!amountA) return false
    try {
      const amount = ethers.parseUnits(amountA, tokenA.decimals)
      return ethers.getBigInt(allowanceA) < amount
    } catch (error) {
      return false
    }
  }

  const needsApprovalB = () => {
    if (!tokenB || tokenB.isNative) return false
    if (!amountB) return false
    try {
      const amount = ethers.parseUnits(amountB, tokenB.decimals)
      return ethers.getBigInt(allowanceB) < amount
    } catch (error) {
      return false
    }
  }

  const hasInsufficientBalanceA = () => {
    if (!tokenA || !amountA || !tokenABalance) return false
    try {
      const amount = Number.parseFloat(amountA)
      const balance = Number.parseFloat(tokenABalance)
      return amount > balance
    } catch (error) {
      return false
    }
  }

  const hasInsufficientBalanceB = () => {
    if (!tokenB || !amountB || !tokenBBalance) return false
    try {
      const amount = Number.parseFloat(amountB)
      const balance = Number.parseFloat(tokenBBalance)
      return amount > balance
    } catch (error) {
      return false
    }
  }

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet"
    if (!isCorrectNetwork) return `Switch to ${currentNetwork?.name || "Supported Network"}`
    if (!tokenA || !tokenB) return "Select Tokens"
    if (!amountA || !amountB) return "Enter Amounts"
    if (hasInsufficientBalanceA()) return `Insufficient ${tokenA.symbol} Balance`
    if (hasInsufficientBalanceB()) return `Insufficient ${tokenB.symbol} Balance`
    if (needsApprovalA() || needsApprovalB()) return "Approve"
    return poolInfo.exists ? "Add Liquidity" : "Create Pool"
  }

  const isButtonDisabled = () => {
    return (
      isLoading ||
      isApproving ||
      (!isConnected && !tokenA && !tokenB && !amountA && !amountB) ||
      hasInsufficientBalanceA() ||
      hasInsufficientBalanceB()
    )
  }

  const handleButtonClick = async () => {
    if (!isConnected) {
      connect()
    } else if (!isCorrectNetwork) {
      switchNetwork()
    } else if (needsApprovalA() || needsApprovalB()) {
      approveTokens()
    } else if (tokenA && tokenB && amountA && amountB) {
      addLiquidity()
    }
  }

  const formatBalance = (balance: string) => {
    if (!balance || balance === "0") return "0";
    const num = Number(balance);
    if (num < 0.0001 && num > 0) return num.toExponential(2);
    return num.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  const formatReserve = (reserve: string, decimals = 18) => {
    if (!reserve || reserve === "0") return "0";
    const num = Number(ethers.formatUnits(reserve, decimals));
    if (num < 0.0001 && num > 0) return num.toExponential(2);
    return num.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  const formatRatio = (ratio: number, tokenASymbol: string, tokenBSymbol: string) => {
    if (ratio === 0) return "N/A";
    if (ratio > 1000000) return `1 ${tokenBSymbol} = ${ratio.toExponential(2)} ${tokenASymbol}`;
    if (ratio < 0.000001) {
      const invertedRatio = 1 / ratio;
      return `1 ${tokenASymbol} = ${invertedRatio.toFixed(4)} ${tokenBSymbol}`;
    }
    return `1 ${tokenBSymbol} = ${ratio.toFixed(4)} ${tokenASymbol}`;
  }

  return (
    <div className="space-y-3">
      {isConnected && !isCorrectNetwork && (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive flex items-center gap-1.5 text-destructive text-xs sm:text-sm animate-in">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Switch to {networkConfig.name}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Add Liquidity</h2>
      </div>

      {poolInfo.exists && (
        <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border animate-in">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Existing Pool</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This pool already exists. Your liquidity will be added at the current ratio.
              </p>
              {tokenA && tokenB && (
                <div className="text-xs sm:text-sm space-y-1 bg-muted/50 p-2 rounded-md">
                  <p className="flex justify-between">
                    <span className="font-medium">Reserves:</span>{" "}
                    {isCheckingPool ? (
                      <Loader2 className="inline h-3 w-3 animate-spin ml-1" />
                    ) : (
                      <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                        {formatReserve(poolInfo.reserveA, tokenA.decimals)} {tokenA.symbol} /{" "}
                        {formatReserve(poolInfo.reserveB, tokenB.decimals)} {tokenB.symbol}
                      </span>
                    )}
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Ratio:</span>{" "}
                    {isCheckingPool ? (
                      <Loader2 className="inline h-3 w-3 animate-spin ml-1" />
                    ) : (
                      <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                        {formatRatio(poolInfo.ratio, tokenA.symbol, tokenB.symbol)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div
          className={`p-3 sm:p-4 rounded-lg border ${hasInsufficientBalanceA() ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50" : "bg-card/50 hover:bg-card/80"} transition-colors card-hover`}
        >
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Token</span>
            <div className="flex items-center gap-1">
              {isLoadingTokenABalance && isConnected ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : null}
              <span className={`text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px] ${hasInsufficientBalanceA() ? "text-red-500" : "text-muted-foreground"}`}>
                Balance: {isConnected ? formatBalance(tokenABalance) : "0"}
              </span>
              {tokenA && isConnected && (
                <Button variant="ghost" size="sm" className="h-5 text-xs px-1.5 text-primary" onClick={setMaxAmountA}>
                  MAX
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              value={amountA}
              onChange={handleAmountAChange}
              placeholder="0.0"
              className={`token-amount-input text-base sm:text-lg truncate ${hasInsufficientBalanceA() ? "border-red-300 focus:border-red-500" : ""}`}
            />
            <TokenSelector onSelect={handleTokenASelect} selectedToken={tokenA} otherToken={tokenB} />
          </div>
          {hasInsufficientBalanceA() && <p className="text-xs text-red-500 mt-0.5">Insufficient balance</p>}
        </div>

        <div className="flex justify-center">
          <div className="swap-arrow-wrapper cursor-pointer hover:bg-muted/50 rounded-full p-1 transition-colors" onClick={swapTokens}>
            <ArrowDown className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          className={`p-3 sm:p-4 rounded-lg border ${hasInsufficientBalanceB() ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50" : "bg-card/50 hover:bg-card/80"} transition-colors card-hover`}
        >
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Token</span>
            <div className="flex items-center gap-1">
              {isLoadingTokenBBalance && isConnected ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : null}
              <span className={`text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px] ${hasInsufficientBalanceB() ? "text-red-500" : "text-muted-foreground"}`}>
                Balance: {isConnected ? formatBalance(tokenBBalance) : "0"}
              </span>
              {tokenB && isConnected && (
                <Button variant="ghost" size="sm" className="h-5 text-xs px-1.5 text-primary" onClick={setMaxAmountB}>
                  MAX
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              value={amountB}
              onChange={handleAmountBChange}
              placeholder="0.0"
              className={`token-amount-input text-base sm:text-lg truncate ${hasInsufficientBalanceB() ? "border-red-300 focus:border-red-500" : ""}`}
            />
            <TokenSelector onSelect={handleTokenBSelect} selectedToken={tokenB} otherToken={tokenA} />
          </div>
          {hasInsufficientBalanceB() && <p className="text-xs text-red-500 mt-0.5">Insufficient balance</p>}
        </div>

        <Button className="w-full h-10 sm:h-11 text-sm sm:text-base rounded-lg mt-2" onClick={handleButtonClick} disabled={isButtonDisabled()}>
          {isLoading || isApproving ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isApproving ? "Approving..." : "Adding Liquidity..."}</span>
            </div>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  )
}