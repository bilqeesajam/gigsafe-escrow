import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { backendRequest } from "@/lib/backend";

type Dispute = Tables<"disputes">;
type Gig = Tables<"gigs"> & {
  pricing_inputs?: { distance_km?: string | number; hours?: string | number };
  pricing_subtotal?: number;
  pricing_total?: number;
  pricing_fee?: number;
};

type PricingOverride = {
  id: string;
  gig_id: string | null;
  client_id: string;
  category: string;
  requested_budget: string;
  suggested_budget: string;
  adjustment_pct: string;
  reason: string | null;
  status: string;
  created_at: string;
  admin_note?: string | null;
  reason_category?: string | null;
  gig?: Gig | null;
};

const overrideCategoryLabels: Record<string, string> = {
  overpricing: "Overpricing",
  underpricing: "Underpricing",
  too_much_kms: "Too Much KMs",
  other: "Other",
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<(Dispute & { gig?: Gig })[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState<PricingOverride[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(true);
  const [overrideNotes, setOverrideNotes] = useState<Record<string, string>>({});
  const [overrideActing, setOverrideActing] = useState<string | null>(null);
  const [overrideCategoryFilter, setOverrideCategoryFilter] = useState<string>("all");
  const [overrideCategorySort, setOverrideCategorySort] = useState<"asc" | "desc">("asc");
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState<"resolved_client" | "resolved_hustler">("resolved_client");
  const [notes, setNotes] = useState("");

  const fetchDisputes = async () => {
    const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
    if (data) {
      const withGigs = await Promise.all(data.map(async (d) => {
        const { data: gig } = await supabase.from("gigs").select("*").eq("id", d.gig_id).single();
        return { ...d, gig: gig || undefined };
      }));
      setDisputes(withGigs);
    }
    setLoading(false);
  };

  const fetchOverrides = async () => {
    setOverridesLoading(true);
    try {
      const data = await backendRequest<{ data: PricingOverride[] }>("/api/pricing/overrides/", { method: "GET" });
      setOverrides(data.data ?? []);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load pricing overrides");
    } finally {
      setOverridesLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
    fetchOverrides();
  }, []);

  const handleResolve = async (dispute: Dispute & { gig?: Gig }) => {
    if (!dispute.gig) return;
    setResolving(dispute.id);
    const gig = dispute.gig as any;
    const pricingSubtotal = gig.pricing_subtotal ?? gig.budget;
    const pricingTotal = gig.pricing_total ?? gig.budget;
    const pricingFee = gig.pricing_fee ?? 0;

    // Update dispute
    await supabase.from("disputes").update({
      status: resolution,
      admin_notes: notes || null,
      resolved_at: new Date().toISOString(),
    }).eq("id", dispute.id);

    // Handle funds
    if (resolution === "resolved_client") {
      // Refund to client
      const { data: cp } = await supabase.from("profiles").select("balance").eq("id", gig.client_id).single();
      await supabase.from("profiles").update({ balance: (cp?.balance || 0) + pricingTotal }).eq("id", gig.client_id);
      await supabase.from("transactions").insert({
        gig_id: gig.id,
        to_user_id: gig.client_id,
        amount: pricingTotal,
        subtotal_amount: pricingSubtotal,
        fee_amount: pricingFee,
        total_amount: pricingTotal,
        type: "refund" as const,
      });
      await supabase.from("gigs").update({ status: "cancelled" as any }).eq("id", gig.id);
      await supabase.from("notifications").insert({ user_id: gig.client_id, message: `Dispute on "${gig.title}" resolved in your favor. Funds refunded.`, gig_id: gig.id });
      if (gig.hustler_id) await supabase.from("notifications").insert({ user_id: gig.hustler_id, message: `Dispute on "${gig.title}" resolved. Funds returned to client.`, gig_id: gig.id });
    } else {
      // Release to hustler
      if (gig.hustler_id) {
        const { data: hp } = await supabase.from("profiles").select("balance").eq("id", gig.hustler_id).single();
        await supabase.from("profiles").update({ balance: (hp?.balance || 0) + pricingSubtotal }).eq("id", gig.hustler_id);
        await supabase.from("transactions").insert({
          gig_id: gig.id,
          to_user_id: gig.hustler_id,
          from_user_id: gig.client_id,
          amount: pricingSubtotal,
          subtotal_amount: pricingSubtotal,
          fee_amount: pricingFee,
          total_amount: pricingTotal,
          type: "release" as const,
        });
        await supabase.from("gigs").update({ status: "completed" as any }).eq("id", gig.id);
        await supabase.from("notifications").insert({ user_id: gig.hustler_id, message: `Dispute on "${gig.title}" resolved in your favor. Funds released.`, gig_id: gig.id });
        await supabase.from("notifications").insert({ user_id: gig.client_id, message: `Dispute on "${gig.title}" resolved. Funds released to hustler.`, gig_id: gig.id });
      }
    }

    toast.success("Dispute resolved");
    setResolving(null);
    setNotes("");
    fetchDisputes();
  };

  const handleOverrideAction = async (overrideId: string, action: "approve" | "reject") => {
    setOverrideActing(overrideId);
    try {
      await backendRequest("/api/pricing/overrides/decision/", {
        body: {
          override_id: overrideId,
          action,
          admin_note: overrideNotes[overrideId] ?? "",
        },
      });
      toast.success(`Override ${action}d`);
      await fetchOverrides();
    } catch (error: any) {
      toast.error(error?.message ?? "Action failed");
    } finally {
      setOverrideActing(null);
    }
  };

  const getOverrideCategoryLabel = (override: PricingOverride) => {
    const explicit = override.reason_category ? overrideCategoryLabels[override.reason_category] : null;
    if (explicit) return explicit;

    const reason = (override.reason ?? "").toLowerCase();
    if (reason.includes("km") || reason.includes("kms") || reason.includes("kilometer") || reason.includes("kilometre")) {
      return overrideCategoryLabels.too_much_kms;
    }

    const requested = parseFloat(override.requested_budget ?? "");
    const suggested = parseFloat(override.suggested_budget ?? "");
    if (!Number.isNaN(requested) && !Number.isNaN(suggested)) {
      if (requested > suggested) return overrideCategoryLabels.overpricing;
      if (requested < suggested) return overrideCategoryLabels.underpricing;
    }

    return overrideCategoryLabels.other;
  };

  const pageLoading = loading && overridesLoading;

  if (pageLoading) return <AppLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  const normalizedCategory = (override: PricingOverride) => {
    const label = getOverrideCategoryLabel(override);
    return label.toLowerCase().replace(/\s+/g, "_");
  };

  const visibleOverrides = overrides
    .filter((item) => {
      if (overrideCategoryFilter === "all") return true;
      return normalizedCategory(item) === overrideCategoryFilter;
    })
    .sort((a, b) => {
      const aCat = getOverrideCategoryLabel(a);
      const bCat = getOverrideCategoryLabel(b);
      if (aCat === bCat) return 0;
      return overrideCategorySort === "asc"
        ? aCat.localeCompare(bCat)
        : bCat.localeCompare(aCat);
    });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Disputes</h2>
        {disputes.length === 0 ? (
          <EmptyState icon={AlertTriangle} message="No disputes" />
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <Card key={d.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{d.gig?.title || "Unknown Gig"}</CardTitle>
                    <StatusBadge status={d.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{d.reason}</p>
                  {d.gig && <p className="text-xs text-muted-foreground">Budget: <span className="font-mono font-semibold">R{d.gig.budget.toFixed(2)}</span></p>}
                  {d.admin_notes && <p className="text-xs bg-muted p-2 rounded">Admin: {d.admin_notes}</p>}
                  {(d.status === "open" || d.status === "under_review") && (
                    <div className="space-y-3 pt-2 border-t">
                      <Select value={resolution} onValueChange={(v: any) => setResolution(v)}>
                        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resolved_client">Client Wins (Refund)</SelectItem>
                          <SelectItem value="resolved_hustler">Hustler Wins (Release)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Admin notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
                      <Button onClick={() => handleResolve(d)} disabled={resolving === d.id}>
                        {resolving === d.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        Resolve Dispute
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold">Pricing Overrides</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={overrideCategoryFilter} onValueChange={setOverrideCategoryFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="overpricing">Overpricing</SelectItem>
                  <SelectItem value="underpricing">Underpricing</SelectItem>
                  <SelectItem value="too_much_kms">Too Much KMs</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOverrideCategorySort((prev) => (prev === "asc" ? "desc" : "asc"))}
              >
                Sort {overrideCategorySort === "asc" ? "A→Z" : "Z→A"}
              </Button>
            </div>
          </div>
          {overridesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : visibleOverrides.length === 0 ? (
            <EmptyState icon={AlertTriangle} message="No pricing overrides" />
          ) : (
            <div className="space-y-4">
              {visibleOverrides.map((item) => {
                const gig = item.gig as Gig | undefined;
                const inputs = (gig as any)?.pricing_inputs || {};
                const distanceKm = inputs?.distance_km;
                const hours = inputs?.hours;
                const requestedNum = Number(item.requested_budget);
                const suggestedNum = Number(item.suggested_budget);
                const requestedLabel = Number.isFinite(requestedNum) ? requestedNum.toFixed(2) : item.requested_budget;
                const suggestedLabel = Number.isFinite(suggestedNum) ? suggestedNum.toFixed(2) : item.suggested_budget;
                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{gig?.title || "Unknown Gig"}</CardTitle>
                        <StatusBadge status={item.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Category: <span className="font-semibold text-foreground">{getOverrideCategoryLabel(item)}</span></span>
                        <span>Requested: <span className="font-mono font-semibold text-foreground">R{requestedLabel}</span></span>
                        <span>Suggested: <span className="font-mono font-semibold text-foreground">R{suggestedLabel}</span></span>
                        {typeof hours !== "undefined" && <span>Hours: <span className="font-mono font-semibold text-foreground">{hours}</span></span>}
                        {typeof distanceKm !== "undefined" && <span>Distance: <span className="font-mono font-semibold text-foreground">{distanceKm} km</span></span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason || "No reason provided."}</p>
                      {item.admin_note && <p className="text-xs bg-muted p-2 rounded">Admin: {item.admin_note}</p>}
                      {item.status === "pending" && (
                        <div className="space-y-3 pt-2 border-t">
                          <Textarea
                            placeholder="Admin note (optional)"
                            value={overrideNotes[item.id] ?? ""}
                            onChange={(e) => setOverrideNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            maxLength={500}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => handleOverrideAction(item.id, "approve")} disabled={overrideActing === item.id}>
                              {overrideActing === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleOverrideAction(item.id, "reject")} disabled={overrideActing === item.id}>
                              {overrideActing === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
