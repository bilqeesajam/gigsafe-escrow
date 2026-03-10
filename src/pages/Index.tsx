import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { useState } from "react";

export default function Index() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <a href="#how-it-works" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              How it works
            </a>
            <a href="#features" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              Features
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
        <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#c0c0c0]">
          <span>© {new Date().getFullYear()} GigHold. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/signup" className="hover:text-white transition-colors">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
