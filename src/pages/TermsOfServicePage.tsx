import { THEME } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function TermsOfServicePage() {
    const navLinkStyle = "relative hover:text-primary transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-primary before:transition-[width] before:duration-300 hover:before:w-full";
  return (
    <div style={{ backgroundImage: `linear-gradient(to bottom, ${THEME.primary.darkNavy}, ${THEME.primary.lightBlue})` }} className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16" style={{ color: THEME.text.white }}>
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Legal & Compliance</h1>
            <p className="text-lg" style={{ color: THEME.text.primary }}>Last updated: March 4, 2026</p>
          </div>

          {/* Terms of Service Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: THEME.primary.gold }}>Terms of Service</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Neutral Third Party</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    "GigHold" acts as a neutral intermediary. Funds are secured via escrow and only released upon fulfillment of agreed contract terms. Both parties must adhere to the specified terms and conditions of their agreement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Transaction Finality</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    Once the Buyer selects "Release Funds," the transaction is considered complete and irreversible. This ensures finality and prevents disputes regarding payment after completion.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Dispute Mediation</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    In the event of a disagreement, "GigHold" will review uploaded evidence to provide an impartial resolution or refund. Our resolution team operates with strict neutrality to ensure fairness.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>User Accountability</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    Users must maintain verified profiles and utilize 2FA to ensure account security. Account holders are responsible for all activities conducted under their credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Policy Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: THEME.primary.gold }}>Privacy Policy</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Data Collection</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    We collect essential financial and identity verification data to comply with global standards for financial security and anti-money laundering regulations. Only the minimum required information is collected.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Encryption</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    All personal and financial data is protected with industry-leading SSL/TLS encryption. Data in transit and at rest is secured using modern cryptography standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Third-Party Sharing</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    Financial transactions are processed through PayFast. We do not sell your personal data to third parties. Any sharing is limited to payment processors and compliance authorities as required by law.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Cookie Policy</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    We use tracking (Google Analytics/Plausible) to improve user experience and perform A/B testing on our service flow. You may opt-out through your browser settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: THEME.primary.gold }}>Data Retention & Compliance</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Seven-Year Policy</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    In accordance with financial regulations, all transaction records and evidence are retained for a period of 7 years. This ensures compliance with tax and regulatory authorities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Unmodifiable Records</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    Historical transaction data cannot be modified or deleted once a deal is finalized. This ensures transparency and prevents tampering with evidence.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text.white }}>Audit Trails</h3>
                  <p className="leading-relaxed" style={{ color: THEME.text.primary }}>
                    Every report generated includes an encrypted audit trail for tax and accounting purposes. This provides complete transaction history and accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border rounded-xl p-6 text-center" style={{
            backgroundColor: THEME.primary.cardBlue,
            borderColor: THEME.primary.borderGray,
          }}>
            <p className="text-sm" style={{ color: THEME.text.primary }}>
              Last Updated: March 4, 2026 | Current Version: v2.4.0
            </p>
          </div>
        </div>
      </main>

            <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-foreground">
                  Gig<span className="text-primary">Hold</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Secure escrow for every gig transaction.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link to="/#features" className="hover:text-primary transition-colors">Features</Link>
                <Link to="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
                <Link to="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
                <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} GigHold. All rights reserved.</span>
            <Link 
              to="/signup" 
              className={navLinkStyle}
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
