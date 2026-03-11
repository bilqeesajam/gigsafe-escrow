import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield
} from "lucide-react";

export default function SignupPage() {
  const [tab, setTab] = useState("signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to confirm, or continue to set up your profile.");
      navigate("/choose-role");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2836] flex flex-col scroll-smooth">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-[#0f1a2b]">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-transparent border border-[#f5b800]">
              <Shield className="h-5 w-5 text-[#f5b800]" />
            </div>
            <Link to="/">
              <h1 className="text-xl font-bold text-white">Gig<span className="text-[#f5b800]">Hold</span></h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#c0c0c0]">
            <a href="#how-it-works" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              How it works
            </a>
            <a href="#features" className="relative hover:text-white transition-colors before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-[#f5b800] before:transition-[width] before:duration-300 hover:before:w-full">
              Features
            </a>
          </nav>
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white transition-all duration-300 ease-out hover:bg-[#1a2a42]" onClick={() => setTab('login')}>
              Sign In
            </Button>
            <Button size="sm" className="bg-[#f5b800] text-black hover:bg-[#e0a500] transition-all duration-300 ease-out" onClick={() => setTab('signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in bg-[#0f1a2b] border-border/60 transition-all duration-500 ease-out">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#f5b800]">
              Gig<span className="text-white">Hold</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a2a42] rounded-md transition-all duration-300 ease-out">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#f5b800] data-[state=active]:text-black data-[state=inactive]:text-[#66758a] transition-all duration-300 ease-out">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-[#f5b800] data-[state=active]:text-black data-[state=inactive]:text-[#66758a] transition-all duration-300 ease-out">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4 text-[#66758a]">
                  <div>
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loading} className="bg-[#1a2a42] border-border/60 text-white focus:border-[#f5b800] transition-all duration-300 ease-out" />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-white">Password</Label>
                    <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={loading} className="bg-[#1a2a42] border-border/60 text-white focus:border-[#f5b800] transition-all duration-300 ease-out [color:white]" />
                  </div>
                  <Button type="submit" className="w-full bg-[#f5b800] text-black hover:bg-[#e0a500] transition-all duration-300 ease-out" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4 text-[#66758a]">
                  <div>
                    <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                    <Input id="signup-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={loading} className="bg-[#1a2a42] border-border/60 text-white focus:border-[#f5b800] transition-all duration-300 ease-out" />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="bg-[#1a2a42] border-border/60 text-white focus:border-[#f5b800] transition-all duration-300 ease-out" />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-white">Create Password</Label>
                    <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={loading} className="bg-[#1a2a42] border-border/60 text-white focus:border-[#f5b800] transition-all duration-300 ease-out [color:white]" />
                  </div>
                  <Button type="submit" className="w-full bg-[#f5b800] text-black hover:bg-[#e0a500] transition-all duration-300 ease-out" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <footer className="border-t border-border/60 bg-[#0f1a2b]">
        <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#66758a]">
          <span>© {new Date().getFullYear()} GigHold. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/#how-it-works" className="hover:text-white transition-all duration-300 ease-out hover:underline decoration-[#f5b800] underline-offset-4 decoration-2">How it works</Link>
            <Link to="/" className="hover:text-white transition-all duration-300 ease-out hover:underline decoration-[#f5b800] underline-offset-4 decoration-2">About</Link>
            <Link to="/signup" className="hover:text-white transition-all duration-300 ease-out hover:underline decoration-[#f5b800] underline-offset-4 decoration-2">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
