import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Shield,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle,
  MapPin,
  Handshake,
  Truck,
  Search,
  Banknote,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useMemo } from "react";

export default function Index() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    { id: 'gs-1', category: 'Getting Started', question: "What is 'name'?", answer: "Your name is a unique identifier used to represent you on the platform. It helps other users identify you when working together on gigs." },
    { id: 'gs-2', category: 'Getting Started', question: 'Is my data safe?', answer: 'Yes, your data is protected with industry-standard encryption and security measures. We comply with data protection regulations and regularly audit our security systems.' },
    { id: 'gs-3', category: 'Getting Started', question: 'Who can use this?', answer: 'Anyone 18 years or older with a valid email address can create an account. Additional verification may be required depending on your role and location.' },
    { id: 'pp-1', category: 'Payments & Payouts', question: 'How do I fund a deal?', answer: 'You can fund a deal through your account dashboard by adding payment methods like credit/debit cards or bank transfers. Once a gig is accepted, funds are held in escrow.' },
    { id: 'pp-2', category: 'Payments & Payouts', question: 'When is money released?', answer: 'Money is released once the gig is marked as complete by both parties or the agreed-upon deadline is reached. You can request early release with mutual consent.' },
    { id: 'pp-3', category: 'Payments & Payouts', question: 'What if the currency is different?', answer: 'We automatically convert currencies at real-time exchange rates. Conversion fees may apply depending on your payment method and the currencies involved.' },
    { id: 'cm-1', category: 'Changes & Modifications', question: 'Can I change terms mid-deal?', answer: 'Yes, you can propose changes to terms during an active deal. Both parties must agree to modifications before they take effect.' },
    { id: 'cm-2', category: 'Changes & Modifications', question: "What counts as 'Proof of Delivery'?", answer: 'Proof of delivery can include photos, videos, documents, or any agreed-upon evidence that the work has been completed according to the gig specifications.' },
    { id: 'cm-3', category: 'Changes & Modifications', question: 'Can I change terms mid-deal?', answer: 'Yes, both parties must agree to any changes. Submit a modification request, and the other party must approve before changes take effect.' },
    { id: 'df-1', category: 'Disputes & Fees', question: 'What happens if there is a dispute?', answer: 'If a dispute arises, our resolution team will review the evidence from both parties and make a fair determination. The escrow funds will be released accordingly.' },
    { id: 'df-2', category: 'Disputes & Fees', question: 'How much does it cost?', answer: 'We charge a small platform fee (usually 2-3%) on completed gigs. There are no hidden fees, and all charges are clearly displayed before you confirm.' },
    { id: 'df-3', category: 'Disputes & Fees', question: 'Who pays the escrow fee?', answer: 'The escrow fee is typically split between both parties or paid by the buyer, depending on the agreement. This is negotiable and should be discussed upfront.' },
  ];

  const faqCategories = ['Getting Started', 'Payments & Payouts', 'Changes & Modifications', 'Disputes & Fees'];

  const filteredFAQ = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return faqData.filter((item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query));
  }, [searchQuery]);

  const groupedFAQ = useMemo(() => {
    return faqCategories.map((category) => ({ category, items: filteredFAQ.filter((item) => item.category === category) }));
  }, [filteredFAQ]);

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
              How it works
            </Link>
            <a href="#features" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              Features
            </a>
            <a href="#faq" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              FAQ
            </a>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-[#c0c0c0] hover:text-white hover:bg-[#232c40]">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-[#f5b800] text-[#0f1a2b] hover:bg-yellow-400">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Service Marketplace<br />
            <span className="text-[#f5b800]">With Built-In Escrow</span>
          </h1>
          <p className="text-lg md:text-xl text-[#c0c0c0] mb-8 max-w-2xl mx-auto leading-relaxed">
            Post tasks, hire trusted hustlers, and pay securely. Funds are held until the job is verified complete — protecting both parties.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8 h-12 bg-[#f5b800] hover:bg-yellow-400 text-[#0f1a2b]">
              <Link to="/signup">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border-[#232c40] bg-[#1a2235] text-white hover:bg-[#232c40]">
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
          {/* <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <p className="text-2xl font-bold text-[#f5b800]">256-bit</p>
              <p className="text-sm text-[#c0c0c0] mt-1">Encryption</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5b800]">100%</p>
              <p className="text-sm text-[#c0c0c0] mt-1">Transparent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5b800]">24/7</p>
              <p className="text-sm text-[#c0c0c0] mt-1">Support</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-[#1a2235]/50 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#f5b800] mb-4">Why choose GigHold?</h2>
            <p className="text-[#c0c0c0] max-w-2xl mx-auto">
              Every feature is designed to protect both parties and keep deals moving forward.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Escrow Protection",
                description: "Funds are held securely until the job is verified complete.",
                Icon: Lock,
              },
              {
                title: "Fast Matching",
                description: "Post a task and get matched with hustlers in your area instantly.",
                Icon: Zap,
              },
              {
                title: "Verified Users",
                description: "All users go through KYC verification before accessing the platform.",
                Icon: CheckCircle,
              },
              {
                title: "Transparent Tracking",
                description: "Real-time updates for complete visibility at every stage.",
                Icon: MapPin,
              },
              {
                title: "Dispute Resolution",
                description: "Neutral third-parties to help reach fair resolutions.",
                Icon: Shield,
              },
              {
                title: "PIN Security",
                description: "Additional layer of security with PIN verification on release.",
                Icon: Lock,
              },
            ].map(({ Icon, title, description }) => (
              <div
                key={title}
                className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800] transition-colors group"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#3a4456] mb-4 group-hover:bg-[#f5b800]/20 transition-colors border border-[#4a5466] group-hover:border-[#f5b800]">
                  <Icon className="h-6 w-6 text-[#f5b800] group-hover:text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full bg-[#0f1a2b] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#f5b800] mb-4">
                How it works
              </h2>
              <p className="text-[#c0c0c0] max-w-lg mx-auto">
                Simple steps from agreement to payment. Both sides stay informed at every stage.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  title: "1. Post a Task",
                  description: "Create your gig with clear terms, budget, and timeline. Both parties agree to the conditions.",
                  Icon: Handshake,
                },
                {
                  title: "2. Hustler Accepts",
                  description: "A verified hustler accepts your task and confirms they're ready to deliver.",
                  Icon: CheckCircle,
                },
                {
                  title: "3. Payment Locked",
                  description: "You deposit payment via secure checkout. Funds are held safely by escrow until completion.",
                  Icon: Lock,
                },
                {
                  title: "4. Work Delivered",
                  description: "Hustler completes the work and delivers as agreed in the task terms.",
                  Icon: Truck,
                },
                {
                  title: "5. Funds Released",
                  description: "Review and approve the work, then release funds with a secure PIN. Done!",
                  Icon: Banknote,
                },
              ].map(({ Icon, title, description }, idx) => (
                <div key={title} className="bg-[#232c40] border border-[#3a4456] rounded-xl p-6 hover:border-[#f5b800] transition-colors relative">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#f5b800]/20 mb-4 border border-[#f5b800]/30">
                    <Icon className="h-6 w-6 text-[#f5b800]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
                  <p className="text-sm text-[#c0c0c0] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full bg-[#1a2235]/50 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#f5b800] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-[#c0c0c0] max-w-lg mx-auto mb-8">
                Find answers to common questions about GigHold
              </p>
              {/* Search Box */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#c0c0c0]" />
                <input
                  type="text"
                  placeholder="Search common questions here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 bg-[#232c40] border border-[#3a4456] text-white placeholder:text-[#8b95ac] focus:border-[#f5b800] focus:outline-none h-11 rounded-lg transition-colors"
                />
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {groupedFAQ.map((section) => (
                section.items.length > 0 && (
                  <div key={section.category} className="bg-[#232c40] border border-[#3a4456] rounded-xl overflow-hidden hover:border-[#f5b800]/50 transition-colors">
                    <div className="bg-[#1a2235] px-6 py-4 border-b border-[#3a4456]">
                      <h3 className="text-lg font-semibold text-[#f5b800]">
                        {section.category}
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <Accordion type="single" collapsible className="w-full">
                        {section.items.map((item) => (
                          <AccordionItem key={item.id} value={item.id} className="border-[#3a4456]">
                            <AccordionTrigger className="text-left hover:no-underline text-white hover:text-[#f5b800] transition-colors py-3">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#c0c0c0] pt-2 pb-4">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                )
              ))}

              {filteredFAQ.length === 0 && (
                <div className="bg-[#232c40] border border-[#3a4456] rounded-xl p-8 text-center">
                  <p className="text-[#c0c0c0]">
                    No results found for "<span className="text-[#f5b800]">{searchQuery}</span>". Try different keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#1a2235]/50 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#f5b800]">
              Ready to make your next deal safer?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-[#c0c0c0]">
              Create your first gig transaction in minutes. No complexity, no hidden fees. Just secure, transparent escrow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 h-12 bg-[#f5b800] hover:bg-yellow-400 text-[#0f1a2b]">
                <Link to="/signup">
                  Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border-[#232c40] bg-[#1a2235] text-white hover:bg-[#232c40]">
                <Link to="/login">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#232c40] bg-[#0f1a2b]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent border border-[#f5b800]">
                  <Shield className="h-4 w-4 text-[#f5b800]" />
                </div>
                <span className="font-bold text-white">GigHold</span>
              </Link>
              <p className="text-[#c0c0c0] text-sm">Secure escrow for every gig transaction.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-3 text-sm text-[#c0c0c0]">
                <a href="#features" className="hover:text-[#f5b800] transition-colors">Features</a>
                <a href="#how-it-works" className="block hover:text-[#f5b800] transition-colors">How it Works</a>
                <a href="#faq" className="block hover:text-[#f5b800] transition-colors">FAQ</a>
                <Link to="/pricing" className="block hover:text-[#f5b800] transition-colors">Pricing</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-3 text-sm text-[#c0c0c0]">
                <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="block hover:text-[#f5b800] transition-colors">Contact Us</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-3 text-sm text-[#c0c0c0]">
                <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="block hover:text-[#f5b800] transition-colors">Terms of Service</Link>
                <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="block hover:text-[#f5b800] transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#232c40] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#c0c0c0]">
            <span>© {new Date().getFullYear()} GigHold. All rights reserved.</span>
            <Link to="/signup" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
