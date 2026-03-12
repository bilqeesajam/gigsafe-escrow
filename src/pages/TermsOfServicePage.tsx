import { THEME } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
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

      <Footer />
    </div>
  );
}
