import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import { GigCard } from "@/components/GigCard";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, PlusCircle, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Gig = Tables<"gigs">;

export default function MyGigsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("gigs")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setGigs(data || []); setLoading(false); });
  }, [user]);

  if (loading) return <AppLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  const active = gigs.filter((g) => ["open", "accepted", "in_progress"].includes(g.status));
  const pending = gigs.filter((g) => g.status === "pending_confirmation");
  const completed = gigs.filter((g) => g.status === "completed");
  const disputed = gigs.filter((g) => g.status === "disputed");

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">My Gigs</h2>
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="disputed">Disputed ({disputed.length})</TabsTrigger>
          </TabsList>
          {[
            { key: "active", items: active },
            { key: "pending", items: pending },
            { key: "completed", items: completed },
            { key: "disputed", items: disputed },
          ].map(({ key, items }) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {items.length === 0 ? (
                <EmptyState icon={Briefcase} message={`No ${key} gigs`} cta="Post a Gig" onAction={() => navigate("/post-gig")} />
              ) : (
                items.map((gig) => (
                  <GigCard key={gig.id} gig={gig} onClick={() => navigate(`/gig/${gig.id}`)} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
