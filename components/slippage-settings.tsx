"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, AlertTriangle, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SlippageSettingsProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
  className?: string
}

export default function SlippageSettings({ slippage, onSlippageChange, className }: SlippageSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const presets = [0.1, 0.5, 1, 3]
    if (presets.includes(slippage)) {
      setIsCustom(false)
      setCustomSlippage("")
    } else {
      setIsCustom(true)
      setCustomSlippage(slippage.toString())
    }
  }, [slippage])

  const handlePresetClick = (preset: number) => {
    onSlippageChange(preset)
    setIsCustom(false)
    setCustomSlippage("")
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomSlippage(value)
      setIsCustom(true)
      if (value !== "" && !isNaN(Number.parseFloat(value))) {
        const numValue = Number.parseFloat(value)
        if (numValue <= 50) {
          onSlippageChange(numValue)
        }
      }
    }
  }

  const getSlippageWarning = () => {
    if (slippage < 0.05) {
      return {
        type: "warning",
        message: "Your transaction may fail due to low slippage tolerance",
      }
    } else if (slippage > 5) {
      return {
        type: "danger",
        message: "High slippage tolerance may result in unfavorable rates",
      }
    }
    return null
  }

  const warning = getSlippageWarning()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2 h-8 px-3 rounded-lg border-gray-200 dark:border-gray-700", className)}>
          <Settings className="h-3.5 w-3.5" />
          <span className="text-sm">Slippage: {slippage}%</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Slippage Tolerance</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
              onClick={() => {
                onSlippageChange(0.5)
                setIsCustom(false)
                setCustomSlippage("")
                setOpen(false)
              }}
            >
              Auto (0.5%)
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={!isCustom && slippage === 0.1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(0.1)}
              className="h-8 rounded-lg text-sm"
            >
              0.1%
            </Button>
            <Button
              variant={!isCustom && slippage === 0.5 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(0.5)}
              className="h-8 rounded-lg text-sm"
            >
              0.5%
            </Button>
            <Button
              variant={!isCustom && slippage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(1)}
              className="h-8 rounded-lg text-sm"
            >
              1%
            </Button>
            <Button
              variant={!isCustom && slippage === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(3)}
              className="h-8 rounded-lg text-sm"
            >
              3%
            </Button>
          </div>

          <div className="relative">
            <Input
              value={customSlippage}
              onChange={handleCustomChange}
              placeholder="Custom"
              className={cn("pr-8 h-9 rounded-lg border-gray-200 dark:border-gray-700", isCustom ? "border-primary" : "")}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>

          {warning && (
            <div
              className={cn(
                "p-3 rounded-lg text-sm flex items-start gap-2 animate-fade-in",
                warning.type === "warning"
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800",
              )}
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{warning.message}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-sm flex items-start gap-2 border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Your transaction will revert if the price changes unfavorably by more than this percentage.</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}