import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-[#c0c0c0] text-lg">Last updated: March 4, 2026</p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">1. Information We Collect</h2>
              <div className="space-y-4 text-[#c0c0c0]">
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
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">2. How We Use Your Information</h2>
              <div className="space-y-4 text-[#c0c0c0]">
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
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">3. Data Security</h2>
              <div className="space-y-4 text-[#c0c0c0]">
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
