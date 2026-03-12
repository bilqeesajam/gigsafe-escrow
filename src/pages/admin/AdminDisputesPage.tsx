import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  AlertTriangle, 
  Scale, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  ChevronDown
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dispute = Tables<"disputes">;
type Gig = Tables<"gigs">;
type Profile = Tables<"profiles">;

interface DisputeWithDetails extends Dispute {
  gig?: Gig & {
    client?: Profile | null;
    hustler?: Profile | null;
  };
  raiser?: Profile | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<DisputeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [resolution, setResolution] = useState<"resolved_client" | "resolved_hustler">("resolved_client");
  const [notes, setNotes] = useState("");
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  const fetchDisputes = async () => {
    try {
      const { data: disputesData, error: disputesError } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (disputesError) throw disputesError;

      if (disputesData && disputesData.length > 0) {
        const withDetails = await Promise.all(
          disputesData.map(async (d) => {
            const { data: gig } = await supabase
              .from("gigs")
              .select("*, client:profiles!gigs_client_id_fkey(*), hustler:profiles!gigs_hustler_id_fkey(*)")
              .eq("id", d.gig_id)
              .single();

            const { data: raiser } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", d.raised_by)
              .single();

            return {
              ...d,
              gig: gig || undefined,
              raiser: raiser || undefined,
            };
          })
        );

        setDisputes(withDetails);
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();

    const channel = supabase
      .channel('admin-disputes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disputes' },
        () => {
          fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResolve = async (dispute: DisputeWithDetails) => {
    if (!dispute.gig) return;
    
    setResolving(dispute.id);
    
    try {
      const { error: disputeError } = await supabase
        .from("disputes")
        .update({
          status: resolution,
          admin_notes: notes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", dispute.id);

      if (disputeError) throw disputeError;

      const gig = dispute.gig;

      if (resolution === "resolved_client") {
        const { data: clientProfile, error: clientError } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", gig.client_id)
          .single();

        if (clientError) throw clientError;

        await supabase
          .from("profiles")
          .update({ balance: (clientProfile?.balance || 0) + gig.budget })
          .eq("id", gig.client_id);

        await supabase
          .from("transactions")
          .insert({ 
            gig_id: gig.id, 
            to_user_id: gig.client_id, 
            amount: gig.budget, 
            type: "refund" 
          });

        await supabase
          .from("gigs")
          .update({ status: "cancelled" })
          .eq("id", gig.id);

        if (gig.client_id) {
          await supabase
            .from("notifications")
            .insert({ 
              user_id: gig.client_id, 
              message: `Dispute on "${gig.title}" resolved in your favor. Funds refunded.`, 
              gig_id: gig.id 
            });
        }
        
        if (gig.hustler_id) {
          await supabase
            .from("notifications")
            .insert({ 
              user_id: gig.hustler_id, 
              message: `Dispute on "${gig.title}" resolved. Funds returned to client.`, 
              gig_id: gig.id 
            });
        }

        toast.success("Dispute resolved: Refunded to client");
      } else {
        if (gig.hustler_id) {
          const { data: hustlerProfile, error: hustlerError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", gig.hustler_id)
            .single();

          if (hustlerError) throw hustlerError;

          await supabase
            .from("profiles")
            .update({ balance: (hustlerProfile?.balance || 0) + gig.budget })
            .eq("id", gig.hustler_id);

          await supabase
            .from("transactions")
            .insert({ 
              gig_id: gig.id, 
              to_user_id: gig.hustler_id, 
              from_user_id: gig.client_id, 
              amount: gig.budget, 
              type: "release" 
            });

          await supabase
            .from("gigs")
            .update({ status: "completed" })
            .eq("id", gig.id);

          if (gig.hustler_id) {
            await supabase
              .from("notifications")
              .insert({ 
                user_id: gig.hustler_id, 
                message: `Dispute on "${gig.title}" resolved in your favor. Funds released.`, 
                gig_id: gig.id 
              });
          }
          
          if (gig.client_id) {
            await supabase
              .from("notifications")
              .insert({ 
                user_id: gig.client_id, 
                message: `Dispute on "${gig.title}" resolved. Funds released to hustler.`, 
                gig_id: gig.id 
              });
          }

          toast.success("Dispute resolved: Released to hustler");
        }
      }

      setNotes("");
      fetchDisputes();
      setSelectedDispute(null);
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    } finally {
      setResolving(null);
    }
  };

  const openDisputes = disputes.filter(d => d.status === 'open').length;
  const underReviewDisputes = disputes.filter(d => d.status === 'under_review').length;
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved_client' || d.status === 'resolved_hustler').length;
  const totalAmount = disputes.reduce((sum, d) => sum + (d.gig?.budget || 0), 0);

  const filteredDisputes = disputes.filter(
    (dispute) => filterStatus === 'all' || dispute.status === filterStatus
  );

  const selectedDisputeData = disputes.find((d) => d.id === selectedDispute);

  const getPriorityLevel = (dispute: DisputeWithDetails) => {
    if (dispute.status === 'open') return 'high';
    if (dispute.status === 'under_review') return 'medium';
    return 'low';
  };

  const getStatusColor = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch(status) {
      case 'open':
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/50`;
      case 'under_review':
        return `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/50`;
      case 'resolved_client':
      case 'resolved_hustler':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/50`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/50`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'under_review':
        return 'Under Review';
      case 'resolved_client':
        return 'Resolved (Client)';
      case 'resolved_hustler':
        return 'Resolved (Hustler)';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getSlaProgress = (dispute: DisputeWithDetails) => {
    const created = new Date(dispute.created_at).getTime();
    const now = new Date().getTime();
    const diffHours = (now - created) / (1000 * 60 * 60);
    const progress = Math.min(Math.round((diffHours / 48) * 100), 100);
    return progress;
  };

  const statusFilters = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved_client', label: 'Resolved (Client)' },
    { value: 'resolved_hustler', label: 'Resolved (Hustler)' },
  ];

  const primaryFilters = statusFilters.slice(0, 3);
  const secondaryFilters = statusFilters.slice(3);

  if (loading && disputes.length === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Manage Disputes
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full" />
          </div>
          
          {/* Stats Card - Using semantic tokens */}
          <div className="px-6 py-3 rounded-xl flex items-center gap-6 bg-card border border-border shadow-lg">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-xl font-bold text-primary">{openDisputes}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Under Review</p>
              <p className="text-xl font-bold text-warning dark:text-warning-foreground">{underReviewDisputes}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-xl font-bold text-success dark:text-success-foreground">{resolvedDisputes}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="rounded-xl p-12 text-center bg-card border border-border shadow-lg">
            <Scale className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No disputes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Dispute List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {primaryFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setFilterStatus(filter.value);
                      setShowAllStatuses(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      filterStatus === filter.value
                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 shadow-sm'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}

                {secondaryFilters.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAllStatuses(!showAllStatuses)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                        secondaryFilters.some(f => f.value === filterStatus)
                          ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 shadow-sm'
                      }`}
                    >
                      {secondaryFilters.find(f => f.value === filterStatus)?.label || 'More'} 
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showAllStatuses && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowAllStatuses(false)}
                        />
                        
                        <div className="absolute top-full left-0 mt-2 z-20 min-w-[150px] rounded-xl p-2 bg-popover border border-border shadow-lg">
                          {secondaryFilters.map((filter) => (
                            <button
                              key={filter.value}
                              onClick={() => {
                                setFilterStatus(filter.value);
                                setShowAllStatuses(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                filterStatus === filter.value
                                  ? 'bg-primary/10 dark:bg-primary/20 text-primary-foreground dark:text-primary font-semibold'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Dispute Items */}
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {filteredDisputes.map((dispute, index) => {
                  const priority = getPriorityLevel(dispute);
                  const slaProgress = getSlaProgress(dispute);
                  
                  return (
                    <div
                      key={dispute.id}
                      onClick={() => setSelectedDispute(dispute.id)}
                      className={`rounded-xl p-4 cursor-pointer transition-all hover:translate-x-1 bg-card border border-border shadow-md hover:shadow-lg ${
                        selectedDispute === dispute.id 
                          ? 'border-primary dark:border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.2)] dark:shadow-[0_0_20px_rgba(var(--primary),0.3)]'
                          : ''
                      }`}
                      style={{ animation: `slideIn 0.3s ease ${index * 0.05}s both` }}
                    >
                      {/* Priority Indicator */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            priority === 'high'
                              ? 'bg-primary animate-pulse'
                              : priority === 'medium'
                              ? 'bg-secondary'
                              : 'bg-muted-foreground/50'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {dispute.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="font-semibold text-sm mb-1 text-foreground">
                          {dispute.reason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dispute.raiser?.full_name || 'Unknown'} • {dispute.gig?.title || 'No gig'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-primary font-bold">
                          {formatCurrency(dispute.gig?.budget || 0)}
                        </span>
                        <span className={getStatusColor(dispute.status)}>
                          {getStatusLabel(dispute.status)}
                        </span>
                      </div>

                      {/* SLA Timer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">SLA Progress</span>
                          <span className="text-xs font-semibold text-foreground">
                            {slaProgress}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-secondary">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              slaProgress >= 75
                                ? 'bg-gradient-to-r from-destructive to-primary animate-pulse'
                                : 'bg-gradient-to-r from-secondary to-primary'
                            }`}
                            style={{ width: `${slaProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Admin Notes Preview */}
                      {dispute.admin_notes && (
                        <div className="mt-3 text-xs">
                          <span className="text-secondary">Note: {dispute.admin_notes.substring(0, 50)}...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Detail Workspace */}
            <div className="lg:col-span-2">
              {selectedDisputeData ? (
                <div
                  className="rounded-xl p-6 space-y-6 bg-card light:bg-white border border-border shadow-lg"
                  style={{ animation: 'fadeInUp 0.3s ease' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between pb-6 border-b border-border">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {selectedDisputeData.reason || 'Dispute'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Dispute ID: {selectedDisputeData.id}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        getSlaProgress(selectedDisputeData) >= 75
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
                          : 'bg-secondary/10 dark:bg-secondary/20 text-secondary'
                      }`}
                    >
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-xs mb-1 text-muted-foreground">Raised By</p>
                      <p className="font-semibold text-foreground">
                        {selectedDisputeData.raiser?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-xs mb-1 text-muted-foreground">Status</p>
                      <p className={`font-semibold capitalize ${
                        selectedDisputeData.status === 'open' 
                          ? 'text-red-600 dark:text-red-400'
                          : selectedDisputeData.status === 'under_review' 
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {getStatusLabel(selectedDisputeData.status)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-xs mb-1 text-muted-foreground">Amount</p>
                      <p className="text-primary font-bold text-lg">
                        {formatCurrency(selectedDisputeData.gig?.budget || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-xs mb-1 text-muted-foreground">Created</p>
                      <p className="font-semibold text-foreground">
                        {new Date(selectedDisputeData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  {selectedDisputeData.reason && (
                    <div className="p-4 rounded-lg border border-border bg-secondary">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-secondary" />
                        <h4 className="font-semibold text-foreground">Reason</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedDisputeData.reason}
                      </p>
                    </div>
                  )}

                  {/* Gig Details */}
                  {selectedDisputeData.gig && (
                    <div className="p-4 rounded-lg border border-border bg-secondary">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-secondary" />
                        <h4 className="font-semibold text-foreground">Gig Details</h4>
                      </div>
                      <p className="text-sm mb-1 text-foreground">
                        {selectedDisputeData.gig.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-muted-foreground">Client:</span>{' '}
                          <span className="text-foreground">
                            {selectedDisputeData.gig.client?.full_name || selectedDisputeData.gig.client_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hustler:</span>{' '}
                          <span className="text-foreground">
                            {selectedDisputeData.gig.hustler?.full_name || selectedDisputeData.gig.hustler_id || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Gig Status:</span>{' '}
                        <span className="text-xs font-semibold text-secondary">
                          {selectedDisputeData.gig.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Resolution Panel */}
                  {selectedDisputeData.status !== 'resolved_client' && selectedDisputeData.status !== 'resolved_hustler' && (
                    <div className="pt-6 border-t border-border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                        <Scale className="w-5 h-5 text-primary" />
                        Resolution Decision
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => setResolution('resolved_client')}
                            className={`flex-1 p-4 rounded-lg border transition-all ${
                              resolution === 'resolved_client'
                                ? 'bg-red-50 dark:bg-gradient-to-br dark:from-red-500/30 dark:to-red-600/20 border-red-300 dark:border-red-500'
                                : 'bg-secondary border-border hover:bg-accent'
                            }`}
                          >
                            <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                              resolution === 'resolved_client' 
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                            }`} />
                            <p className={`font-semibold text-sm ${
                              resolution === 'resolved_client' 
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}>Refund to Client</p>
                          </button>

                          <button
                            onClick={() => setResolution('resolved_hustler')}
                            className={`flex-1 p-4 rounded-lg border transition-all ${
                              resolution === 'resolved_hustler'
                                ? 'bg-green-50 dark:bg-gradient-to-br dark:from-green-500/30 dark:to-green-600/20 border-green-300 dark:border-green-500'
                                : 'bg-secondary border-border hover:bg-accent'
                            }`}
                          >
                            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                              resolution === 'resolved_hustler' 
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-muted-foreground'
                            }`} />
                            <p className={`font-semibold text-sm ${
                              resolution === 'resolved_hustler' 
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}>Release to Hustler</p>
                          </button>
                        </div>

                        <div>
                          <Textarea
                            placeholder="Add resolution notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-primary bg-background border-border text-foreground placeholder:text-muted-foreground"
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => handleResolve(selectedDisputeData)}
                          disabled={resolving === selectedDisputeData.id}
                          className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 transition-all"
                        >
                          {resolving === selectedDisputeData.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Resolving...
                            </>
                          ) : (
                            'Resolve Dispute'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Resolution Info */}
                  {(selectedDisputeData.status === 'resolved_client' || selectedDisputeData.status === 'resolved_hustler') && (
                    <div className="pt-6 border-t border-border">
                      <div className="p-4 rounded-lg border border-green-200 dark:border-green-500/30 bg-success/10 dark:bg-secondary">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-foreground">Resolution</h4>
                        </div>
                        <p className="text-primary font-medium capitalize mb-1">
                          {selectedDisputeData.status === 'resolved_client' ? 'Refunded to Client' : 'Released to Hustler'}
                        </p>
                        {selectedDisputeData.admin_notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            Notes: {selectedDisputeData.admin_notes}
                          </p>
                        )}
                        {selectedDisputeData.resolved_at && (
                          <p className="text-xs mt-2 text-muted-foreground">
                            Resolved on: {new Date(selectedDisputeData.resolved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl p-12 text-center bg-card border border-border shadow-lg">
                  <Scale className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a dispute to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AppLayout>
  );
}