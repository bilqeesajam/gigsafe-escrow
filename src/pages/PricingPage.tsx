import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { THEME } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const pricingTiers = [
    { from: "R0.00", to: "R20,000.00", percentage: "1.5%" },
    { from: "R20,001.00", to: "R50,000.00", percentage: "1.25%" },
    { from: "R50,001.00", to: "R100,000.00", percentage: "1%" },
    { from: "R100,001.00", to: "R500,000.00", percentage: "0.75%" },
    { from: "R500,001.00", to: "R1,000,000.00", percentage: "0.5%" },
  ];

  return (
    <div style={{ backgroundImage: `linear-gradient(to bottom, ${THEME.primary.darkNavy}, ${THEME.primary.lightBlue})` }} className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16" style={{ color: THEME.text.white }}>
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Fees</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: THEME.text.primary }}>
              Transparent, tiered pricing that rewards higher-value transactions. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="bg-[#232c40] border border-[#3a4456] rounded-2xl overflow-hidden">
            <div className="bg-[#1a2235] px-6 md:px-8 py-6 border-b border-[#3a4456]">
              <h2 className="text-2xl font-bold text-white">Pricing</h2>
              <p className="text-[#c0c0c0] mt-2">GigHold platform fee structure based on transaction value</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3a4456]">
                    <th className="px-6 md:px-8 py-4 text-left text-[#f5b800] font-semibold bg-[#1a2235]">FROM</th>
                    <th className="px-6 md:px-8 py-4 text-left text-[#f5b800] font-semibold bg-[#1a2235]">TO</th>
                    <th className="px-6 md:px-8 py-4 text-left text-[#f5b800] font-semibold bg-[#1a2235]">PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier, idx) => (
                    <tr key={idx} className="border-b border-[#3a4456] hover:bg-[#2a3650] transition-colors">
                      <td className="px-6 md:px-8 py-5 text-[#c0c0c0]">{tier.from}</td>
                      <td className="px-6 md:px-8 py-5 text-[#c0c0c0]">{tier.to}</td>
                      <td className="px-6 md:px-8 py-5 text-[#f5b800] font-semibold">{tier.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 md:px-8 py-6 bg-[#1a2235] border-t border-[#3a4456]">
              <p className="text-[#c0c0c0] text-sm">
                <span className="font-semibold text-white">💡 Tip:</span> The higher your transaction value, the lower the percentage fee. This encourages larger, more confident deals.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#f5b800]">Pricing FAQ</h2>

            <div className="space-y-4">
              <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800]/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">Who pays the fee?</h3>
                <p className="text-[#c0c0c0]">The fee is charged to the service provider (hustler) upon successful completion and release of funds. Clients pay the full agreed amount upfront, and it's held in escrow.</p>
              </div>

              <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800]/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">Are there additional fees?</h3>
                <p className="text-[#c0c0c0]">No. The platform fee shown above is the only charge. There are no hidden fees, processing fees, or surprise charges. What you see is what you pay.</p>
              </div>

              <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800]/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">How is the fee calculated?</h3>
                <p className="text-[#c0c0c0]">The fee is calculated as a percentage of the agreed transaction amount. For example, a R50,000 transaction would be charged 1.25%, which equals R625.00.</p>
              </div>

              <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800]/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">When is the fee deducted?</h3>
                <p className="text-[#c0c0c0]">The fee is deducted when you release the funds after confirming the work is complete. If the deal doesn't complete, no fee is charged.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[#1a2235]/50 border border-[#3a4456] rounded-2xl p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold text-[#f5b800]">Ready to start earning with transparent fees?</h2>
            <p className="text-[#c0c0c0] max-w-2xl mx-auto">
              Join GigHold today and experience a platform where fees are fair, transparent, and rewarding for all parties.
            </p>
            <Button asChild size="lg" className="bg-[#f5b800] text-[#0f1a2b] hover:bg-yellow-400 px-8 h-12">
              <Link to="/signup">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
