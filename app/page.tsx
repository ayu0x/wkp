import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SwapTab from "@/components/swap-tab"
import LiquidityTab from "@/components/liquidity-tab"
import Footer from "@/components/footer"
import { ArrowUpDown, Droplets } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Clean Trading Interface - Centered */}
      <section className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="card-clean p-4 sm:p-6 animate-fade-in">
            <Tabs defaultValue="swap" className="w-full">
              {/* Enhanced Tab Header */}
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 h-12">
                <TabsTrigger 
                  value="swap" 
                  className="flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Swap</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="liquidity" 
                  className="flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400"
                >
                  <Droplets className="w-4 h-4" />
                  <span>Pool</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="swap" className="animate-fade-in">
                <SwapTab />
              </TabsContent>
              <TabsContent value="liquidity" className="animate-fade-in">
                <LiquidityTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <Footer />
    </div>
  )
}