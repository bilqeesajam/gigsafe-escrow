import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Loader2, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  Shield,
  Clock,
  Search,
  Bell,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Transaction = Tables<"transactions">;

// Extended type for display purposes
interface TransactionWithUsers extends Transaction {
  buyer_name?: string;
  seller_name?: string;
  description?: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

const getTransactionTypeDisplay = (type: string) => {
  const types: Record<string, string> = {
    'hold': 'Hold',
    'release': 'Release',
    'refund': 'Refund',
    'top_up': 'Top Up',
  };
  return types[type] || type;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, pendingKyc: 0, openGigs: 0, disputes: 0 });
  const [transactions, setTransactions] = useState<TransactionWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch stats and transactions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch stats
        const [usersResult, kycResult, gigsResult, disputesResult] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "pending"),
          supabase.from("gigs").select("*", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
        ]);

        setStats({ 
          users: usersResult.count || 0, 
          pendingKyc: kycResult.count || 0, 
          openGigs: gigsResult.count || 0, 
          disputes: disputesResult.count || 0 
        });

        // Get total count for transactions
        const { count } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
        
        setTotalCount(count || 0);

        // Fetch transactions
        const { data: transactionsData, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;

        if (transactionsData && transactionsData.length > 0) {
          // Get unique user IDs from transactions
          const userIds = new Set<string>();
          transactionsData.forEach(t => {
            if (t.from_user_id) userIds.add(t.from_user_id);
            if (t.to_user_id) userIds.add(t.to_user_id);
          });

          // Fetch profiles for these users
          if (userIds.size > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', Array.from(userIds));

            if (profilesError) throw profilesError;

            // Create a map of user id to full_name
            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

            // Enhance transactions with user names and descriptions
            const enhancedTransactions: TransactionWithUsers[] = transactionsData.map(t => ({
              ...t,
              buyer_name: t.from_user_id ? profileMap.get(t.from_user_id) || 'Unknown' : 'N/A',
              seller_name: t.to_user_id ? profileMap.get(t.to_user_id) || 'Unknown' : 'N/A',
              description: `${getTransactionTypeDisplay(t.type || 'unknown')} Transaction`,
            }));

            setTransactions(enhancedTransactions);
          } else {
            setTransactions(transactionsData.map(t => ({
              ...t,
              description: `${getTransactionTypeDisplay(t.type || 'unknown')} Transaction`,
            })));
          }
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          // Refresh transactions when they change
          try {
            const { data, error } = await supabase
              .from('transactions')
              .select('*')
              .order('created_at', { ascending: false })
              .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

            if (error) throw error;

            if (data && data.length > 0) {
              // Re-fetch profiles for these transactions
              const userIds = new Set<string>();
              data.forEach(t => {
                if (t.from_user_id) userIds.add(t.from_user_id);
                if (t.to_user_id) userIds.add(t.to_user_id);
              });

              if (userIds.size > 0) {
                const { data: profiles, error: profilesError } = await supabase
                  .from('profiles')
                  .select('id, full_name')
                  .in('id', Array.from(userIds));

                if (profilesError) throw profilesError;

                const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

                const enhancedTransactions: TransactionWithUsers[] = data.map(t => ({
                  ...t,
                  buyer_name: t.from_user_id ? profileMap.get(t.from_user_id) || 'Unknown' : 'N/A',
                  seller_name: t.to_user_id ? profileMap.get(t.to_user_id) || 'Unknown' : 'N/A',
                  description: `${getTransactionTypeDisplay(t.type || 'unknown')} Transaction`,
                }));

                setTransactions(enhancedTransactions);
              } else {
                setTransactions(data.map(t => ({
                  ...t,
                  description: `${getTransactionTypeDisplay(t.type || 'unknown')} Transaction`,
                })));
              }
            } else {
              setTransactions([]);
            }
            toast.info("Transactions updated");
          } catch (error) {
            console.error('Error refreshing transactions:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, itemsPerPage]);

  // Export all transactions to CSV
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Fetch all transactions for export (no pagination)
      const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allTransactions || allTransactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }

      // Get all unique user IDs from transactions
      const userIds = new Set<string>();
      allTransactions.forEach(t => {
        if (t.from_user_id) userIds.add(t.from_user_id);
        if (t.to_user_id) userIds.add(t.to_user_id);
      });

      // Fetch profiles for all users
      let profileMap = new Map();
      if (userIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        if (profilesError) throw profilesError;
        profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      }

      // Prepare CSV data
      const csvData = allTransactions.map(t => ({
        'Transaction ID': t.id,
        'Date': new Date(t.created_at).toLocaleString(),
        'Type': getTransactionTypeDisplay(t.type || 'unknown'),
        'Amount': formatCurrency(t.amount || 0),
        'From User ID': t.from_user_id || 'N/A',
        'From Name': t.from_user_id ? (profileMap.get(t.from_user_id) || 'Unknown') : 'N/A',
        'To User ID': t.to_user_id || 'N/A',
        'To Name': t.to_user_id ? (profileMap.get(t.to_user_id) || 'Unknown') : 'N/A',
        'Description': `${getTransactionTypeDisplay(t.type || 'unknown')} Transaction`,
      }));

      // Convert to CSV string
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
          }).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');

      // Create download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allTransactions.length} transactions`);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    } finally {
      setExportLoading(false);
    }
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(t => 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = totalCount === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Quick stats cards
  const quickStatsCards = [
    { label: "Total Users", value: stats.users, icon: Users, route: "/admin/users" },
    { label: "Pending KYC", value: stats.pendingKyc, icon: Shield, route: "/admin/kyc" },
    { label: "Open Gigs", value: stats.openGigs, icon: Briefcase, route: "/admin/gigs" },
    { label: "Open Disputes", value: stats.disputes, icon: AlertTriangle, route: "/admin/disputes" },
  ];

  if (loading && transactions.length === 0 && stats.users === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform and monitor activity</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-input rounded-lg w-full md:w-[300px] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search transactions..."
              />
            </div>
            <Button variant="outline" size="icon" className="relative">
              <Bell size={18} />
              {stats.disputes > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {stats.disputes}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStatsCards.map((card) => (
            <Card 
              key={card.label} 
              className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate(card.route)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/admin/disputes")}>
            <AlertTriangle size={16} />
            Disputes
            {stats.disputes > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {stats.disputes}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/admin/users")}>
            <Users size={16} />
            Users
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/admin/gigs")}>
            <Briefcase size={16} />
            Gigs
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-primary bg-primary/10">
            <Clock size={16} />
            All Transactions
          </Button>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                  {totalCount} total
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleExport}
                  disabled={exportLoading || totalCount === 0}
                >
                  {exportLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {exportLoading ? 'Exporting...' : 'Export'}
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter size={14} />
                  Filter
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/transactions/${transaction.id}`)}
                          >
                            <TableCell>
                              <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                                {transaction.id?.substring(0, 8)}...
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{transaction.description || 'Transaction'}</TableCell>
                            <TableCell>{transaction.buyer_name || transaction.from_user_id?.substring(0, 8) || 'N/A'}</TableCell>
                            <TableCell>{transaction.seller_name || transaction.to_user_id?.substring(0, 8) || 'N/A'}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(transaction.amount || 0)}</TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block
                                ${transaction.type === 'hold' ? 'bg-primary/20 text-primary' :
                                  transaction.type === 'release' ? 'bg-green-500/20 text-green-600' :
                                  transaction.type === 'refund' ? 'bg-destructive/20 text-destructive' :
                                  transaction.type === 'top_up' ? 'bg-blue-500/20 text-blue-600' :
                                  'bg-muted text-muted-foreground'}`}>
                                {getTransactionTypeDisplay(transaction.type || 'unknown')}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No transactions found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {startItem} to {endItem} of {totalCount} transactions
                      </span>
                      <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-muted border border-input text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      
                      <span className="text-sm px-2">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <ChevronsRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          All transactions are securely stored and monitored
        </p>
      </div>
    </AppLayout>
  );
}