"use client"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddLiquidity from "@/components/add-liquidity"
import RemoveLiquidity from "@/components/remove-liquidity"
import SlippageSettings from "@/components/slippage-settings"
import { useSlippage } from "@/hooks/use-slippage"
import { useWeb3 } from "@/context/web3-context"

export default function LiquidityTab() {
  const { slippage, updateSlippage } = useSlippage()
  const { isConnected } = useWeb3()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Liquidity</h2>
        {isConnected && <SlippageSettings slippage={slippage} onSlippageChange={updateSlippage} />}
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 h-11">
          <TabsTrigger 
            value="add" 
            className="rounded-lg font-medium transition-all duration-150 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 py-2"
          >
            Add
          </TabsTrigger>
          <TabsTrigger 
            value="remove" 
            className="rounded-lg font-medium transition-all duration-150 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 py-2"
          >
            Remove
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="animate-fade-in pt-4">
          <AddLiquidity slippage={slippage} updateSlippage={updateSlippage} />
        </TabsContent>
        <TabsContent value="remove" className="animate-fade-in pt-4">
          <RemoveLiquidity slippage={slippage} updateSlippage={updateSlippage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}