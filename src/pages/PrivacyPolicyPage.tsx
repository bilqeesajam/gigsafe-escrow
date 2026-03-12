import { THEME } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundImage: `linear-gradient(to bottom, ${THEME.primary.darkNavy}, ${THEME.primary.lightBlue})` }} className="min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16" style={{ color: THEME.text.white }}>
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-lg" style={{ color: THEME.text.primary }}>Last updated: March 4, 2026</p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.primary.gold }}>1. Information We Collect</h2>
              <div className="space-y-4" style={{ color: THEME.text.primary }}>
                <p>We collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>Financial information (bank account and payment card details)</li>
                  <li>Identity verification documents (ID, proof of address)</li>
                  <li>Transaction history and dispute resolution records</li>
                  <li>Device information and usage analytics</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.primary.gold }}>2. How We Use Your Information</h2>
              <div className="space-y-4" style={{ color: THEME.text.primary }}>
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To process and manage transactions and escrow payments</li>
                  <li>To verify user identity and prevent fraud</li>
                  <li>To provide customer support and resolve disputes</li>
                  <li>To comply with legal and regulatory requirements</li>
                  <li>To improve our services and user experience</li>
                  <li>To send important notifications about your account</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: THEME.primary.gold }}>3. Data Security</h2>
              <div className="space-y-4" style={{ color: THEME.text.primary }}>
                <p>
                  We implement comprehensive security measures to protect your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>256-bit SSL/TLS encryption for all data in transit</li>
                  <li>Encrypted storage for data at rest</li>
                  <li>Two-factor authentication (2FA) for account access</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Limited employee access to sensitive data</li>
                  <li>Secure data disposal procedures</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">4. Third-Party Disclosure</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We only share information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>With payment processors (PayFast) to complete transactions</li>
                  <li>With legal authorities when required by law</li>
                  <li>With dispute resolution specialists when needed</li>
                  <li>With service providers who assist in our operations (all under confidentiality agreements)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">5. Data Retention</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  We retain user data in accordance with legal requirements:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Transaction records and evidence: 7 years (regulatory requirement)</li>
                  <li>Account information: For the duration of your account plus 2 years</li>
                  <li>Communication logs: 2 years</li>
                  <li>Marketing data: Until you opt-out</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">6. Your Rights</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access your personal data</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Request deletion of your account (subject to legal holds)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Port your data to another service</li>
                  <li>Lodge a complaint with relevant authorities</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">7. Cookies and Tracking</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Remember your preferences and login information</li>
                  <li>Analyze website usage and performance</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Improve our user experience</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. Disabling cookies may affect functionality.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">8. Children's Privacy</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  GigHold is not intended for individuals under 18 years old. We do not knowingly collect information from children. If we become aware of such collection, we will delete the information immediately.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">9. Changes to This Policy</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes via email or by posting the updated policy on our website.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">10. Contact Us</h2>
              <div className="space-y-4 text-[#c0c0c0]">
                <p>
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p><span className="text-white font-semibold">Email:</span> privacy@gighold.com</p>
                  <p><span className="text-white font-semibold">Phone:</span> +27 777 7777</p>
                  <p><span className="text-white font-semibold">Address:</span> GigHold Support, South Africa</p>
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
