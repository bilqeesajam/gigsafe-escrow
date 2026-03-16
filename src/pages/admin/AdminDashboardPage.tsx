import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, Briefcase, AlertTriangle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { backendRequest } from "@/lib/backend";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, pendingKyc: 0, openGigs: 0, disputes: 0 });
  const [loading, setLoading] = useState(true);
  const [healthChecking, setHealthChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<null | { status: "ok" | "error"; detail?: string }>(null);

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

  const runHealthCheck = async () => {
    setHealthChecking(true);
    try {
      const data = await backendRequest<{ status: "ok" | "error"; detail?: string }>("/api/health/", { method: "GET" });
      setHealthStatus({ status: data.status, detail: data.detail });
      if (data.status === "ok") {
        toast.success("Backend health check passed");
      } else {
        toast.error(data.detail || "Backend health check failed");
      }
    } catch (error: any) {
      const message = error?.message ?? "Backend health check failed";
      setHealthStatus({ status: "error", detail: message });
      toast.error(message);
    } finally {
      setHealthChecking(false);
    }
  };


  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Backend Health Check</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button onClick={runHealthCheck} disabled={healthChecking}>
                {healthChecking && <Loader2 className="h-4 w-4 animate-spin" />}
                Test Backend
              </Button>
              {healthStatus && (
                <span className="text-sm text-muted-foreground">
                  {healthStatus.status === "ok" ? "Healthy" : `Error: ${healthStatus.detail || "Unknown error"}`}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This checks the backend + Supabase connection using `/api/health/`.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
