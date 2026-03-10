import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock, ArrowRight, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export default function Index() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const ThemeToggle = () => (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">
            Gig<span className="text-primary">Hold</span>
          </h1>
          <div className="flex gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">Sign In</Link></Button>
                <Button asChild><Link to="/signup">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="container py-20 md:py-32 text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            The Service Marketplace<br />
            <span className="text-primary">With Built-In Escrow</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Post tasks, hire hustlers, and pay securely. Funds are held until the job is verified complete — protecting both parties.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Start for Free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <section className="container pb-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: "Escrow Protection", desc: "Funds are held securely until the job is verified complete with a PIN." },
              { icon: Zap, title: "Fast Matching", desc: "Post a task and get matched with hustlers in your area instantly." },
              { icon: Shield, title: "Verified Users", desc: "All users go through KYC verification before accessing the platform." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 text-center space-y-3">
                <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 GigHold. All rights reserved.
      </footer>
    </div>
  );
}
