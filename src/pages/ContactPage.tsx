import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! Our team will get back to you soon.");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in Touch with Our Team</h1>
            <p className="text-[#c0c0c0] text-lg max-w-2xl mx-auto">
              Our support specialists are available 24/7 to ensure your deal runs smoothly.
            </p>
          </div>

          {/* Contact Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-[#232c40] border border-[#3a4456] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#f5b800] mb-6">Lets Chat</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-[#1a2235] border border-[#3a4456] text-white placeholder:text-[#8b95ac] focus:border-[#f5b800] h-11"
                  />
                </div>

                <div>
                  <Input
                    placeholder="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-[#1a2235] border border-[#3a4456] text-white placeholder:text-[#8b95ac] focus:border-[#f5b800] h-11"
                  />
                </div>

                <div>
                  <Input
                    placeholder="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-[#1a2235] border border-[#3a4456] text-white placeholder:text-[#8b95ac] focus:border-[#f5b800] h-11"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Enter your message ..."
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full bg-[#1a2235] border border-[#3a4456] text-white placeholder:text-[#8b95ac] focus:border-[#f5b800] focus:outline-none rounded-lg px-4 py-3 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#f5b800] text-[#0f1a2b] hover:bg-yellow-400 w-full md:w-auto px-8 h-11 font-semibold"
                >
                  {loading ? "Sending..." : "Submit"}
                </Button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-[#f5b800] mb-6">Our Contact Details</h3>
              </div>

              <div className="bg-[#232c40] border border-[#3a4456] rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-[#f5b800] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#c0c0c0] text-sm uppercase tracking-wide mb-1">Phone</p>
                    <a href="tel:+27777777" className="text-white text-lg font-semibold hover:text-[#f5b800] transition-colors">
                      +27 777 7777
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#f5b800] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#c0c0c0] text-sm uppercase tracking-wide mb-1">Email</p>
                    <a href="mailto:support@gighold.com" className="text-white text-lg font-semibold hover:text-[#f5b800] transition-colors">
                      support@gighold.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2235] border border-[#3a4456] rounded-2xl p-6">
                <h4 className="text-[#f5b800] font-semibold mb-3">Response Time</h4>
                <p className="text-[#c0c0c0]">
                  We aim to respond to all inquiries within 24 hours. For urgent matters, call us directly at the number above.
                </p>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-[#232c40] border border-[#3a4456] rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#f5b800]">Support Hours</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#c0c0c0] mb-2">Chat Support</p>
                <p className="text-white font-semibold">24/7 Available</p>
              </div>
              <div>
                <p className="text-[#c0c0c0] mb-2">Phone Support</p>
                <p className="text-white font-semibold">9 AM - 6 PM (GMT+2)</p>
              </div>
              <div>
                <p className="text-[#c0c0c0] mb-2">Email Support</p>
                <p className="text-white font-semibold">Within 24 Hours</p>
              </div>
            </div>
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
