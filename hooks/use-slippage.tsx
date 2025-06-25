"use client"

import { useState, useEffect } from "react"

// Default slippage is 0.5%
const DEFAULT_SLIPPAGE = 0.5

export function useSlippage() {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)

  // Load slippage from localStorage on mount
  useEffect(() => {
    const savedSlippage = localStorage.getItem("soneswap-slippage")
    if (savedSlippage) {
      try {
        const parsedSlippage = Number.parseFloat(savedSlippage)
        if (!isNaN(parsedSlippage) && parsedSlippage > 0) {
          setSlippage(parsedSlippage)
        }
      } catch (error) {
        console.error("Error parsing saved slippage:", error)
      }
    }
  }, [])

  // Save slippage to localStorage when it changes
  const updateSlippage = (newSlippage: number) => {
    setSlippage(newSlippage)
    localStorage.setItem("soneswap-slippage", newSlippage.toString())
  }

  // Calculate minimum amount based on slippage
  const calculateMinimumAmount = (amount: bigint): bigint => {
    return (amount * BigInt(Math.floor(10000 - slippage * 100))) / BigInt(10000)
  }

  return {
    slippage,
    updateSlippage,
    calculateMinimumAmount,
  }
}
