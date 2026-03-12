import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  Lock,
  Zap,
  CheckCircle,
  MapPin,
  Handshake,
  Truck,
  Search,
  Banknote,
  Shield,
} from "lucide-react";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { THEME } from "@/lib/theme";

export default function Index() {
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

  return (
    <div style={{ backgroundImage: `linear-gradient(to bottom, ${THEME.primary.darkNavy}, ${THEME.primary.lightBlue})` }} className="min-h-screen">
      <Navbar showLandingNav={true} />

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32" style={{ color: THEME.text.white }}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Service Marketplace<br />
            <span style={{ color: THEME.primary.gold }}>With Built-In Escrow</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: THEME.text.primary }}>
            Post tasks, hire trusted hustlers, and pay securely. Funds are held until the job is verified complete — protecting both parties.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8 h-12 hover:bg-yellow-400" style={{ backgroundColor: THEME.primary.gold, color: THEME.primary.darkNavy }}>
              <Link to="/signup">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border text-white hover:bg-[#232c40]" style={{ borderColor: THEME.primary.cardBlue, backgroundColor: THEME.primary.lightBlue }}>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20" style={{ backgroundColor: 'rgba(26, 34, 53, 0.5)', color: THEME.text.white }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: THEME.primary.gold }}>Why choose GigHold?</h2>
            <p className="max-w-2xl mx-auto" style={{ color: THEME.text.primary }}>
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
                className="border rounded-xl p-6 transition-colors group"
                style={{ 
                  backgroundColor: THEME.primary.cardBlue,
                  borderColor: THEME.primary.borderGray,
                  '--group-hover-border': THEME.primary.gold
                } as any}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4 transition-colors border group-hover:transition-colors" style={{
                  backgroundColor: THEME.primary.borderGray,
                  borderColor: THEME.primary.borderGray,
                  '--group-hover-bg': 'rgba(245, 184, 0, 0.2)',
                  '--group-hover-border': THEME.primary.gold
                } as any}>
                  <Icon className="h-6 w-6" style={{ color: THEME.primary.gold }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: THEME.text.white }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: THEME.text.primary }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-20" style={{ backgroundColor: THEME.primary.darkNavy, color: THEME.text.white }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: THEME.primary.gold }}>
                How it works
              </h2>
              <p className="max-w-lg mx-auto" style={{ color: THEME.text.primary }}>
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
                <div key={title} className="border rounded-xl p-6 transition-colors relative" style={{
                  backgroundColor: THEME.primary.cardBlue,
                  borderColor: THEME.primary.borderGray,
                }}>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4 border" style={{
                    backgroundColor: 'rgba(245, 184, 0, 0.2)',
                    borderColor: 'rgba(245, 184, 0, 0.3)'
                  }}>
                    <Icon className="h-6 w-6" style={{ color: THEME.primary.gold }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: THEME.text.white }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: THEME.text.primary }}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-20" style={{ backgroundColor: 'rgba(26, 34, 53, 0.5)', color: THEME.text.white }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: THEME.primary.gold }}>
                Frequently Asked Questions
              </h2>
              <p className="max-w-lg mx-auto mb-8" style={{ color: THEME.text.primary }}>
                Find answers to common questions about GigHold
              </p>
              {/* Search Box */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-3.5 h-5 w-5" style={{ color: THEME.text.primary }} />
                <input
                  type="text"
                  placeholder="Search common questions here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 border rounded-lg h-11 transition-colors focus:outline-none"
                  style={{
                    backgroundColor: THEME.primary.cardBlue,
                    borderColor: THEME.primary.borderGray,
                    color: THEME.text.white,
                  }}
                  onFocus={(e) => e.target.style.borderColor = THEME.primary.gold}
                  onBlur={(e) => e.target.style.borderColor = THEME.primary.borderGray}
                />
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {groupedFAQ.map((section) => (
                section.items.length > 0 && (
                  <div key={section.category} className="border rounded-xl overflow-hidden transition-colors" style={{
                    backgroundColor: THEME.primary.cardBlue,
                    borderColor: THEME.primary.borderGray,
                  }}>
                    <div className="px-6 py-4 border-b" style={{
                      backgroundColor: THEME.primary.lightBlue,
                      borderColor: THEME.primary.borderGray,
                    }}>
                      <h3 className="text-lg font-semibold" style={{ color: THEME.primary.gold }}>
                        {section.category}
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <Accordion type="single" collapsible className="w-full">
                        {section.items.map((item) => (
                          <AccordionItem key={item.id} value={item.id} style={{ borderColor: THEME.primary.borderGray }}>
                            <AccordionTrigger className="text-left hover:no-underline transition-colors py-3" style={{ color: THEME.text.white }}>
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4" style={{ color: THEME.text.primary }}>
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
                <div className="border rounded-xl p-8 text-center" style={{
                  backgroundColor: THEME.primary.cardBlue,
                  borderColor: THEME.primary.borderGray,
                }}>
                  <p style={{ color: THEME.text.primary }}>
                    No results found for "<span style={{ color: THEME.primary.gold }}>{searchQuery}</span>". Try different keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20" style={{ backgroundColor: 'rgba(26, 34, 53, 0.5)', color: THEME.text.white }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: THEME.primary.gold }}>
              Ready to make your next deal safer?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: THEME.text.primary }}>
              Create your first gig transaction in minutes. No complexity, no hidden fees. Just secure, transparent escrow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 h-12" style={{ backgroundColor: THEME.primary.gold, color: THEME.primary.darkNavy }}>
                <Link to="/signup">
                  Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border text-white" style={{ borderColor: THEME.primary.cardBlue, backgroundColor: THEME.primary.lightBlue }}>
                <Link to="/login">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
