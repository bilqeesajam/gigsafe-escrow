import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { PINInput } from "@/components/PINInput";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, MapPin, DollarSign, Clock, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";

type Gig = Tables<"gigs">;

export default function GigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [hustlerProfile, setHustlerProfile] = useState<Tables<"profiles"> | null>(null);

  const fetchGig = async () => {
    if (!id) return;
    const { data } = await supabase.from("gigs").select("*").eq("id", id).single();
    setGig(data);
    if (data?.hustler_id) {
      const { data: hp } = await supabase.from("profiles").select("*").eq("id", data.hustler_id).single();
      setHustlerProfile(hp);
    }
    setLoading(false);
  };

  useEffect(() => { fetchGig(); }, [id]);

  if (loading) return <AppLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!gig) return <AppLayout><p className="text-center text-muted-foreground py-16">Gig not found</p></AppLayout>;

  const isClient = user?.id === gig.client_id;
  const isHustler = user?.id === gig.hustler_id;
  const pricingSubtotal = (gig as any).pricing_subtotal ?? gig.budget;
  const pricingFee = (gig as any).pricing_fee ?? 0;
  const pricingTotal = (gig as any).pricing_total ?? gig.budget;

  // Client: Confirm & release PIN
  const handleConfirmRelease = async () => {
    setActionLoading(true);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("gigs").update({ client_confirmed: true, completion_pin: pin }).eq("id", gig.id);
    // Notify hustler
    if (gig.hustler_id) {
      await supabase.from("notifications").insert({ user_id: gig.hustler_id, message: `PIN issued for "${gig.title}". Enter the PIN to complete the gig.`, gig_id: gig.id });
    }
    toast.success(`Your completion PIN is: ${pin}. Share it with the hustler.`);
    setActionLoading(false);
    fetchGig();
  };

  // Hustler: Accept gig
  const handleAccept = async () => {
    if (!user) return;
    setActionLoading(true);
    await supabase.from("gigs").update({ hustler_id: user.id, status: "accepted" as any }).eq("id", gig.id);
    // Notify client
    await supabase.from("notifications").insert({ user_id: gig.client_id, message: `Your gig "${gig.title}" was accepted by a hustler.`, gig_id: gig.id });
    toast.success("Gig accepted!");
    setActionLoading(false);
    fetchGig();
  };

  // Hustler: Mark started
  const handleStart = async () => {
    setActionLoading(true);
    await supabase.from("gigs").update({ status: "in_progress" as any }).eq("id", gig.id);
    toast.success("Marked as started");
    setActionLoading(false);
    fetchGig();
  };

  // Hustler: Mark done
  const handleDone = async () => {
    setActionLoading(true);
    await supabase.from("gigs").update({ status: "pending_confirmation" as any, hustler_confirmed: true }).eq("id", gig.id);
    // Notify client
    await supabase.from("notifications").insert({ user_id: gig.client_id, message: `Hustler marked "${gig.title}" as done. Please confirm & release PIN.`, gig_id: gig.id });
    toast.success("Marked as done. Waiting for client confirmation.");
    setActionLoading(false);
    fetchGig();
  };

  // Hustler: Enter PIN
  const handlePIN = async (pin: string) => {
    if (pin !== gig.completion_pin) {
      toast.error("Invalid PIN. Please try again.");
      return;
    }
    setActionLoading(true);
    // Release funds to hustler
    await supabase.from("gigs").update({ status: "completed" as any, hustler_confirmed: true }).eq("id", gig.id);
    // Credit hustler
    if (gig.hustler_id) {
      const { data: hProfile } = await supabase.from("profiles").select("balance").eq("id", gig.hustler_id).single();
      await supabase.from("profiles").update({ balance: (hProfile?.balance || 0) + pricingSubtotal }).eq("id", gig.hustler_id);
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
      await supabase.from("notifications").insert({ user_id: gig.hustler_id, message: `R${pricingSubtotal.toFixed(2)} released for "${gig.title}".`, gig_id: gig.id });
      await supabase.from("notifications").insert({ user_id: gig.client_id, message: `"${gig.title}" completed. Funds released.`, gig_id: gig.id });
    }
    await refreshProfile();
    toast.success("Gig completed! Funds released.");
    setActionLoading(false);
    fetchGig();
  };

  // Dispute
  const handleDispute = async () => {
    if (!disputeReason.trim() || !user) return;
    setActionLoading(true);
    await supabase.from("gigs").update({ status: "disputed" as any }).eq("id", gig.id);
    await supabase.from("disputes").insert({ gig_id: gig.id, raised_by: user.id, reason: disputeReason.trim() });
    // Notify both
    const otherId = isClient ? gig.hustler_id : gig.client_id;
    if (otherId) await supabase.from("notifications").insert({ user_id: otherId, message: `A dispute was opened on "${gig.title}".`, gig_id: gig.id });
    toast.success("Dispute raised. Admin will review.");
    setShowDispute(false);
    setDisputeReason("");
    setActionLoading(false);
    fetchGig();
  };

  // Client cancel
  const handleCancel = async () => {
    setActionLoading(true);
    if (gig.status === "open") {
      // Free cancel — refund
      await supabase.from("gigs").update({ status: "cancelled" as any }).eq("id", gig.id);
      const { data: cProfile } = await supabase.from("profiles").select("balance").eq("id", gig.client_id).single();
      await supabase.from("profiles").update({ balance: (cProfile?.balance || 0) + gig.budget }).eq("id", gig.client_id);
      await supabase.from("transactions").insert({
        gig_id: gig.id,
        to_user_id: gig.client_id,
        amount: pricingTotal,
        subtotal_amount: pricingSubtotal,
        fee_amount: pricingFee,
        total_amount: pricingTotal,
        type: "refund" as const,
      });
      await refreshProfile();
      toast.success("Gig cancelled. Funds refunded.");
    } else {
      // Auto-dispute
      await supabase.from("gigs").update({ status: "disputed" as any }).eq("id", gig.id);
      await supabase.from("disputes").insert({ gig_id: gig.id, raised_by: user!.id, reason: "Client initiated cancellation after acceptance." });
      if (gig.hustler_id) await supabase.from("notifications").insert({ user_id: gig.hustler_id, message: `Client cancelled "${gig.title}". Dispute opened.`, gig_id: gig.id });
      toast.info("Dispute opened. Admin will decide fund allocation.");
    }
    setShowCancel(false);
    setActionLoading(false);
    fetchGig();
  };

  const canDispute = (isClient || isHustler) && ["accepted", "in_progress", "pending_confirmation"].includes(gig.status);
  const canCancel = isClient && ["open", "accepted", "in_progress"].includes(gig.status);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">← Back</Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xl">{gig.title}</CardTitle>
              <StatusBadge status={gig.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{gig.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-muted-foreground" /> R{pricingTotal.toFixed(2)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> {gig.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /> {gig.created_at ? formatDistanceToNow(new Date(gig.created_at), { addSuffix: true }) : ""}</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize text-xs">{gig.category}</span>
            </div>
            {hustlerProfile && (
              <p className="text-sm">Assigned to: <span className="font-medium">{hustlerProfile.full_name}</span></p>
            )}
            <div className="rounded-md border p-3 text-sm space-y-1">
              <p>Subtotal: <span className="font-mono">R{pricingSubtotal.toFixed(2)}</span></p>
              <p>Platform Fee: <span className="font-mono">R{pricingFee.toFixed(2)}</span></p>
              <p>Total: <span className="font-mono">R{pricingTotal.toFixed(2)}</span></p>
              {isHustler && <p className="text-xs text-muted-foreground">You will receive the subtotal amount.</p>}
            </div>

            {/* Client actions */}
            {isClient && gig.status === "pending_confirmation" && !gig.client_confirmed && (
              <Button onClick={handleConfirmRelease} disabled={actionLoading} className="w-full">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & Release PIN
              </Button>
            )}
            {isClient && gig.client_confirmed && gig.completion_pin && gig.status === "pending_confirmation" && (
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Completion PIN: <span className="font-mono text-lg font-bold">{gig.completion_pin}</span></p>
                  <p className="text-xs text-muted-foreground">Share this PIN with the hustler to finalize.</p>
                </CardContent>
              </Card>
            )}

            {/* Hustler actions */}
            {isHustler && gig.status === "accepted" && (
              <Button onClick={handleStart} disabled={actionLoading} className="w-full">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Mark as Started
              </Button>
            )}
            {isHustler && gig.status === "in_progress" && (
              <Button onClick={handleDone} disabled={actionLoading} className="w-full">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                I'm Done
              </Button>
            )}
            {isHustler && gig.status === "pending_confirmation" && gig.client_confirmed && (
              <PINInput onComplete={handlePIN} disabled={actionLoading} />
            )}

            {/* Accept (for marketplace hustlers viewing the detail) */}
            {!isClient && !isHustler && profile?.role === "hustler" && gig.status === "open" && (
              <Button onClick={handleAccept} disabled={actionLoading} className="w-full">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Accept Gig
              </Button>
            )}

            {/* Dispute & Cancel */}
            <div className="flex gap-2 pt-2">
              {canDispute && gig.status !== "disputed" && (
                <Button variant="destructive" size="sm" onClick={() => setShowDispute(true)}>
                  <AlertTriangle className="h-4 w-4" /> Raise Dispute
                </Button>
              )}
              {canCancel && gig.status !== "disputed" && (
                <Button variant="outline" size="sm" onClick={() => setShowCancel(true)}>Cancel Gig</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispute dialog */}
        <Dialog open={showDispute} onOpenChange={setShowDispute}>
          <DialogContent>
            <DialogHeader><DialogTitle>Raise a Dispute</DialogTitle></DialogHeader>
            <Textarea placeholder="Explain your reason..." value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} maxLength={500} />
            <Button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()} className="w-full">
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Dispute
            </Button>
          </DialogContent>
        </Dialog>

        {/* Cancel confirm */}
        <ConfirmModal
          open={showCancel}
          title="Cancel Gig?"
          description={gig.status === "open"
            ? "The budget will be refunded to your wallet."
            : "This will open a dispute. Admin will decide fund allocation."}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          confirmLabel="Cancel Gig"
          destructive
        />
      </div>
    </AppLayout>
  );
}
