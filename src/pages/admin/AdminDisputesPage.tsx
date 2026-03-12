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
  ChevronDown,
  Shield
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
      // Fetch disputes
      const { data: disputesData, error: disputesError } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (disputesError) throw disputesError;

      if (disputesData && disputesData.length > 0) {
        // Fetch related data for each dispute
        const withDetails = await Promise.all(
          disputesData.map(async (d) => {
            // Fetch gig details
            const { data: gig } = await supabase
              .from("gigs")
              .select("*, client:profiles!gigs_client_id_fkey(*), hustler:profiles!gigs_hustler_id_fkey(*)")
              .eq("id", d.gig_id)
              .single();

            // Fetch user who raised dispute
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

    // Real-time subscription
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
      // Update dispute
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

      // Handle funds based on resolution
      if (resolution === "resolved_client") {
        // Refund to client
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

        // Send notifications
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
        // Release to hustler
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

          // Send notifications
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

  // Calculate stats
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
    switch(status) {
      case 'open':
        return 'bg-red-500/20 text-red-400 border border-red-500/50';
      case 'under_review':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/50';
      case 'resolved_client':
      case 'resolved_hustler':
        return 'bg-green-500/20 text-green-400 border border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/50';
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
    const progress = Math.min(Math.round((diffHours / 48) * 100), 100); // 48 hour SLA
    return progress;
  };

  // Status filters
  const statusFilters = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved_client', label: 'Resolved (Client)' },
    { value: 'resolved_hustler', label: 'Resolved (Hustler)' },
  ];

  const primaryFilters = statusFilters.slice(0, 3); // 'all', 'open', 'under_review'
  const secondaryFilters = statusFilters.slice(3); // 'resolved_client', 'resolved_hustler'

  if (loading && disputes.length === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F1D302]" />
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
            <h1 className="text-4xl font-bold text-white mb-2">Manage Disputes</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#F1D302] to-transparent rounded-full" />
          </div>
          <div className="card-3d px-6 py-3 flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-400">Open</p>
              <p className="text-xl font-bold text-[#F1D302]">{openDisputes}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-400">Under Review</p>
              <p className="text-xl font-bold text-amber-400">{underReviewDisputes}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-400">Resolved</p>
              <p className="text-xl font-bold text-green-400">{resolvedDisputes}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="card-3d p-12 text-center">
            <Scale className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No disputes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Dispute List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Filter Chips with Dropdown */}
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
                        ? 'bg-gradient-to-r from-[#F1D302] to-[#FFE55C] text-[#003249]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
                          ? 'bg-gradient-to-r from-[#F1D302] to-[#FFE55C] text-[#003249]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
                        
                        <div className="absolute top-full left-0 mt-2 z-20 card-3d p-2 min-w-[150px]">
                          {secondaryFilters.map((filter) => (
                            <button
                              key={filter.value}
                              onClick={() => {
                                setFilterStatus(filter.value);
                                setShowAllStatuses(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                filterStatus === filter.value
                                  ? 'bg-[#F1D302]/20 text-[#F1D302]'
                                  : 'text-gray-400 hover:bg-white/5'
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
                      className={`card-3d p-4 cursor-pointer transition-all hover:translate-x-1 ${
                        selectedDispute === dispute.id ? 'border-[#F1D302]/50 shadow-[0_0_20px_rgba(241,211,2,0.3)]' : ''
                      }`}
                      style={{ animation: `slideIn 0.3s ease ${index * 0.05}s both` }}
                    >
                      {/* Priority Indicator */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            priority === 'high'
                              ? 'bg-[#F1D302] animate-pulse'
                              : priority === 'medium'
                              ? 'bg-[#508991]'
                              : 'bg-gray-500'
                          }`}
                        />
                        <span className="text-xs text-gray-400">{dispute.id.slice(0, 8)}</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-white font-semibold text-sm mb-1">{dispute.reason || 'No reason provided'}</p>
                        <p className="text-xs text-gray-400">
                          {dispute.raiser?.full_name || 'Unknown'} • {dispute.gig?.title || 'No gig'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#F1D302] font-bold">
                          {formatCurrency(dispute.gig?.budget || 0)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dispute.status)}`}>
                          {getStatusLabel(dispute.status)}
                        </span>
                      </div>

                      {/* SLA Timer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">SLA Progress</span>
                          <span className="text-xs text-white font-semibold">{slaProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              slaProgress >= 75
                                ? 'bg-gradient-to-r from-red-500 to-[#F1D302] animate-pulse'
                                : 'bg-gradient-to-r from-[#508991] to-[#F1D302]'
                            }`}
                            style={{ width: `${slaProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Admin Notes Preview */}
                      {dispute.admin_notes && (
                        <div className="mt-3 text-xs">
                          <span className="text-[#508991]">Note: {dispute.admin_notes.substring(0, 50)}...</span>
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
                  className="card-3d p-6 space-y-6"
                  style={{ animation: 'fadeInUp 0.3s ease' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between pb-6 border-b border-white/10">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {selectedDisputeData.reason || 'Dispute'}
                      </h3>
                      <p className="text-gray-400 text-sm">Dispute ID: {selectedDisputeData.id}</p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        getSlaProgress(selectedDisputeData) >= 75
                          ? 'bg-red-500/20 text-red-400 animate-pulse'
                          : 'bg-[#508991]/20 text-[#508991]'
                      }`}
                    >
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Raised By</p>
                      <p className="text-white font-semibold">{selectedDisputeData.raiser?.full_name || 'Unknown'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <p className={`font-semibold capitalize ${
                        selectedDisputeData.status === 'open' ? 'text-red-400' :
                        selectedDisputeData.status === 'under_review' ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        {getStatusLabel(selectedDisputeData.status)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Amount</p>
                      <p className="text-[#F1D302] font-bold text-lg">
                        {formatCurrency(selectedDisputeData.gig?.budget || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-400 mb-1">Created</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedDisputeData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Reason - This was the 'description' field */}
                  {selectedDisputeData.reason && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-[#508991]" />
                        <h4 className="text-white font-semibold">Reason</h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {selectedDisputeData.reason}
                      </p>
                    </div>
                  )}

                  {/* Gig Details */}
                  {selectedDisputeData.gig && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-[#508991]" />
                        <h4 className="text-white font-semibold">Gig Details</h4>
                      </div>
                      <p className="text-white text-sm mb-1">{selectedDisputeData.gig.title}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-400">Client:</span>{' '}
                          <span className="text-white">{selectedDisputeData.gig.client?.full_name || selectedDisputeData.gig.client_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Hustler:</span>{' '}
                          <span className="text-white">{selectedDisputeData.gig.hustler?.full_name || selectedDisputeData.gig.hustler_id || 'Not assigned'}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <span className="text-xs text-gray-400">Gig Status:</span>{' '}
                        <span className="text-xs font-semibold text-[#508991]">
                          {selectedDisputeData.gig.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Resolution Panel - Only show if not resolved */}
                  {selectedDisputeData.status !== 'resolved_client' && selectedDisputeData.status !== 'resolved_hustler' && (
                    <div className="pt-6 border-t border-white/10">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-[#F1D302]" />
                        Resolution Decision
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => setResolution('resolved_client')}
                            className={`flex-1 p-4 rounded-lg border transition-all ${
                              resolution === 'resolved_client'
                                ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border-red-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                              resolution === 'resolved_client' ? 'text-red-400' : 'text-gray-400'
                            }`} />
                            <p className={`font-semibold text-sm ${
                              resolution === 'resolved_client' ? 'text-white' : 'text-gray-400'
                            }`}>Refund to Client</p>
                          </button>

                          <button
                            onClick={() => setResolution('resolved_hustler')}
                            className={`flex-1 p-4 rounded-lg border transition-all ${
                              resolution === 'resolved_hustler'
                                ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 border-green-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                              resolution === 'resolved_hustler' ? 'text-green-400' : 'text-gray-400'
                            }`} />
                            <p className={`font-semibold text-sm ${
                              resolution === 'resolved_hustler' ? 'text-white' : 'text-gray-400'
                            }`}>Release to Hustler</p>
                          </button>
                        </div>

                        <div>
                          <Textarea
                            placeholder="Add resolution notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-[#F1D302]"
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => handleResolve(selectedDisputeData)}
                          disabled={resolving === selectedDisputeData.id}
                          className="w-full bg-gradient-to-r from-[#F1D302] to-[#FFE55C] text-[#003249] font-semibold hover:opacity-90 transition-all"
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

                  {/* Resolution Info if resolved */}
                  {(selectedDisputeData.status === 'resolved_client' || selectedDisputeData.status === 'resolved_hustler') && (
                    <div className="pt-6 border-t border-white/10">
                      <div className="p-4 rounded-lg bg-white/5 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h4 className="text-white font-semibold">Resolution</h4>
                        </div>
                        <p className="text-[#F1D302] font-medium capitalize mb-1">
                          {selectedDisputeData.status === 'resolved_client' ? 'Refunded to Client' : 'Released to Hustler'}
                        </p>
                        {selectedDisputeData.admin_notes && (
                          <p className="text-sm text-gray-400 mt-2">
                            Notes: {selectedDisputeData.admin_notes}
                          </p>
                        )}
                        {selectedDisputeData.resolved_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            Resolved on: {new Date(selectedDisputeData.resolved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-3d p-12 text-center">
                  <Scale className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a dispute to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add these styles to your global CSS or in a style tag */}
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

        .card-3d {
          background: rgba(26, 31, 46, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(80, 137, 145, 0.2);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </AppLayout>
  );
}