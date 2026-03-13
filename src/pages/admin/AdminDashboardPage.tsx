import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, Briefcase, AlertTriangle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { backendRequest } from "@/lib/backend";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, pendingKyc: 0, openGigs: 0, disputes: 0 });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("kyc_status", "pending"),
      supabase.from("gigs").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]).then(([u, k, g, d]) => {
      setStats({ users: u.count || 0, pendingKyc: k.count || 0, openGigs: g.count || 0, disputes: d.count || 0 });
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, route: "/admin/users" },
    { label: "Pending KYC", value: stats.pendingKyc, icon: Shield, route: "/admin/kyc" },
    { label: "Open Gigs", value: stats.openGigs, icon: Briefcase, route: "/admin/gigs" },
    { label: "Open Disputes", value: stats.disputes, icon: AlertTriangle, route: "/admin/disputes" },
  ];

  const handleTestBackend = async () => {
    setTesting(true);
    try {
      await backendRequest("/api/health/", { method: "GET" });
      const configRes = await backendRequest<{ data: Array<{ category: string }> }>("/api/pricing/config/", { method: "GET" });
      const hasErrand = (configRes.data ?? []).some((cfg) => cfg.category === "errand");
      if (!hasErrand) {
        throw new Error("No pricing config found for 'errand'. Add one in Admin > Pricing.");
      }
      await backendRequest("/api/pricing/quote/", {
        body: { category: "errand", hours: 1, distance_km: 1, complexity_keys: [] },
      });
      toast.success("Backend test passed (health + pricing config + quote).");
    } catch (error: any) {
      toast.error(error?.message ?? "Backend test failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <Button onClick={handleTestBackend} disabled={testing}>
            {testing && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Backend
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Card key={c.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(c.route)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3"><c.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
