import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link" // Import Link for the CTA button

export const metadata: Metadata = {
  title: "Privacy Policy | AllSwap",
  description: "Privacy Policy for AllSwap DEX",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen hero-gradient"> {/* Added hero-gradient for consistent background */}
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl py-8 sm:py-12 lg:py-16 mx-auto"> {/* Adjusted padding-top */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16"> {/* Adjusted margin-bottom */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <span className="text-primary font-semibold text-xs sm:text-sm">🔒 Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight">
            <span className="gradient-text">Privacy Policy</span>
          </h1> {/* Changed to gradient-text for consistency */}
          <p className="text-muted-foreground text-base sm:text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="p-6 sm:p-10 shadow-lg border border-border/50 bg-card/50 backdrop-blur-sm"> {/* Added explicit border and backdrop-blur */}
          <div className="space-y-8 sm:space-y-10">
            <section className="pb-6 sm:pb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">1</span>
                Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-4">When you use AllSwap, we may collect the following types of information:</p>
              <ul className="list-disc list-outside pl-8 space-y-2 text-muted-foreground text-base sm:text-lg">
                <li>Wallet addresses and transaction data</li>
                <li>Network information and blockchain data</li>
                <li>Usage statistics and analytics</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">2</span>
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-4">We use the collected information for various purposes:</p>
              <ul className="list-disc list-outside pl-8 space-y-2 text-muted-foreground text-base sm:text-lg">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">3</span>
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">4</span>
                Blockchain Data
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 sm:p-6 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30"> {/* Highlighted this section */}
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed text-base sm:text-lg">Please note that blockchain transactions are public and immutable. Any information stored on the blockchain cannot be deleted or modified. This includes transaction data, wallet addresses, and other on-chain information.</p>
              </div>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">5</span>
                Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">6</span>
                Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">7</span>
                Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">Our service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18.</p>
            </section>

            <Separator />

            <section className="py-6 sm:py-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">8</span>
                Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.</p>
            </section>

            <Separator />

            <section className="pt-6 sm:pt-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground flex items-start">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm sm:text-base font-semibold mr-4 flex-shrink-0 mt-1">9</span>
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">If you have any questions about this Privacy Policy, please contact us.</p>
            </section>
          </div>
        </Card>

        {/* Footer CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 sm:p-8 rounded-2xl border border-primary/20">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">Questions About Our Privacy Policy?</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              If you have any questions about this Privacy Policy, please don't hesitate to contact our support team.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base mr-4"
            >
              Back to AllSwap →
            </Link>
            <button className="inline-flex items-center px-6 py-2.5 sm:px-8 sm:py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-colors text-sm sm:text-base">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}