import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1a2b] to-[#1a2235]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1a2b] border-b border-[#232c40]">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-transparent border border-[#f5b800]">
              <Shield className="h-5 w-5 text-[#f5b800]" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GigHold</span>
          </Link>

                    {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#c0c0c0]">
            <Link to="/" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              Home
            </Link>
            <a href="/#how-it-works" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              How it works
            </a>
            <a href="/#features" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              Features
            </a>
            <a href="/#faq" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              FAQ
            </a>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[#c0c0c0] hover:text-white hover:bg-[#232c40]">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-[#f5b800] text-[#0f1a2b] hover:bg-yellow-400">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16 text-white">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Legal & Compliance</h1>
            <p className="text-[#c0c0c0] text-lg">Last updated: March 4, 2026</p>
          </div>

          {/* Terms of Service Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#f5b800] mb-6">Terms of Service</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Neutral Third Party</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    "GigHold" acts as a neutral intermediary. Funds are secured via escrow and only released upon fulfillment of agreed contract terms. Both parties must adhere to the specified terms and conditions of their agreement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Transaction Finality</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    Once the Buyer selects "Release Funds," the transaction is considered complete and irreversible. This ensures finality and prevents disputes regarding payment after completion.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Dispute Mediation</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    In the event of a disagreement, "GigHold" will review uploaded evidence to provide an impartial resolution or refund. Our resolution team operates with strict neutrality to ensure fairness.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">User Accountability</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    Users must maintain verified profiles and utilize 2FA to ensure account security. Account holders are responsible for all activities conducted under their credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Policy Section */}
            <div>
              <h2 className="text-3xl font-bold text-[#f5b800] mb-6">Privacy Policy</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Data Collection</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    We collect essential financial and identity verification data to comply with global standards for financial security and anti-money laundering regulations. Only the minimum required information is collected.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Encryption</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    All personal and financial data is protected with industry-leading SSL/TLS encryption. Data in transit and at rest is secured using modern cryptography standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Third-Party Sharing</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    Financial transactions are processed through PayFast. We do not sell your personal data to third parties. Any sharing is limited to payment processors and compliance authorities as required by law.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Cookie Policy</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    We use tracking (Google Analytics/Plausible) to improve user experience and perform A/B testing on our service flow. You may opt-out through your browser settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention Section */}
            <div>
              <h2 className="text-3xl font-bold text-[#f5b800] mb-6">Data Retention & Compliance</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Seven-Year Policy</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    In accordance with financial regulations, all transaction records and evidence are retained for a period of 7 years. This ensures compliance with tax and regulatory authorities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Unmodifiable Records</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    Historical transaction data cannot be modified or deleted once a deal is finalized. This ensures transparency and prevents tampering with evidence.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Audit Trails</h3>
                  <p className="text-[#c0c0c0] leading-relaxed">
                    Every report generated includes an encrypted audit trail for tax and accounting purposes. This provides complete transaction history and accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 text-center">
            <p className="text-[#c0c0c0] text-sm">
              Last Updated: March 4, 2026 | Current Version: v2.4.0
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#232c40] bg-[#0f1a2b] mt-20">
        <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#c0c0c0]">
          <span>© {new Date().getFullYear()} GigHold. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="/#how-it-works" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">How it works</a>
            <a href="/#features" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">Features</a>
            <a href="/#faq" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">FAQ</a>
            <Link to="/signup" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
