import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Search, 
  ChevronDown,
  Eye,
  UserX,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useTheme } from "@/lib/theme-context";

type Profile = Tables<"profiles">;

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  type: string;
  gig_id: string;
}

interface UserWithEmail extends Profile {
  email?: string;
}

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (usersData) {
        const usersWithEmails: UserWithEmail[] = await Promise.all(
          usersData.map(async (user) => {
            const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
            return {
              ...user,
              email: authUser?.user?.email || `${user.id.substring(0, 8)}@example.com`
            };
          })
        );
        
        setUsers(usersWithEmails);

        const transactionsMap: Record<string, Transaction[]> = {};
        
        await Promise.all(
          usersWithEmails.map(async (user) => {
            const { data: userTransactions } = await supabase
              .from("transactions")
              .select("*")
              .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
              .order("created_at", { ascending: false })
              .limit(5);
            
            if (userTransactions) {
              transactionsMap[user.id] = userTransactions;
            }
          })
        );
        
        setTransactions(transactionsMap);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const getKycBadgeClass = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch(status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/50`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/50`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/50`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/50`;
    }
  };

  const getKycIcon = (status: string) => {
    switch(status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const filtered = users.filter((u) => {
    if (statusFilter !== 'all' && u.kyc_status !== statusFilter) {
      return false;
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        (u.full_name || "").toLowerCase().includes(searchLower) ||
        (u.phone || "").includes(search) ||
        (u.email || "").toLowerCase().includes(searchLower) ||
        (u.role || "").toLowerCase().includes(searchLower) ||
        u.id.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleViewProfile = (user: UserWithEmail) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setOpenDropdown(null);
  };

  const handleSuspend = (user: UserWithEmail) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = (user: UserWithEmail) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmSuspend = async () => {
    console.log(`Suspending user ${selectedUser?.id} for reason: ${suspensionReason}`);
    setShowSuspendModal(false);
    setSuspensionReason("");
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    console.log(`Deleting user ${selectedUser?.id}`);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
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
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Manage Users
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#F1D302] to-transparent rounded-full" />
          </div>
          <div className={`px-6 py-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <Input 
              className={`pl-9 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              placeholder="Search by name, phone, ID, or role..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className={`${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === 'all' ? 'All Statuses' : `KYC: ${statusFilter}`}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>

            {showFilterDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className={`absolute right-0 mt-2 z-20 min-w-[150px] rounded-xl p-2 ${
                  isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
                }`}>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      statusFilter === 'all'
                        ? isDark ? 'bg-[#F1D302]/20 text-[#F1D302]' : 'bg-[#F1D302]/10 text-[#003249]'
                        : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('approved');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      statusFilter === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Approved
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('pending');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                        : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('rejected');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      statusFilter === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Rejected
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-xl overflow-hidden border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={isDark ? 'border-white/10' : 'border-gray-200'}>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>Name</TableHead>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>User ID</TableHead>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phone</TableHead>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>Role</TableHead>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>KYC Status</TableHead>
                  <TableHead className={isDark ? 'text-gray-400' : 'text-gray-600'}>Balance</TableHead>
                  <TableHead className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} className={`border-b ${
                    isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                  } transition-colors`}>
                    <TableCell className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.full_name || "—"}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.role || "—"}
                    </TableCell>
                    <TableCell>
                      <span className={getKycBadgeClass(user.kyc_status || 'pending')}>
                        {getKycIcon(user.kyc_status || 'pending')}
                        {user.kyc_status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[#F1D302] font-semibold">
                      {formatCurrency(user.balance || 0)}
                    </TableCell>
                    <TableCell className="text-right relative">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        >
                          Actions <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>

                        {openDropdown === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className={`absolute right-0 mt-2 z-20 min-w-[160px] rounded-xl p-2 ${
                              isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
                            }`}>
                              <button
                                onClick={() => handleViewProfile(user)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                  isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                                View Profile
                              </button>
                              <button
                                onClick={() => handleSuspend(user)}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-white/5"
                              >
                                <UserX className="w-4 h-4" />
                                Suspend User
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/5"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Search className={`w-12 h-12 mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Profile Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setShowUserModal(false)} />
            <div className={`relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 ${
              isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    User Profile
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#F1D302] to-transparent rounded-full" />
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.full_name || 'Not provided'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>User ID</p>
                  <p className={`font-mono text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.id}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Status</p>
                  <p className="text-green-600 dark:text-green-400 font-semibold">Active</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date Joined</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Balance</p>
                  <p className="text-[#F1D302] font-bold text-lg">
                    {formatCurrency(selectedUser.balance || 0)}
                  </p>
                </div>
              </div>

              {/* KYC Status */}
              <div className={`p-4 rounded-lg mb-6 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>KYC Status</p>
                <div className="flex items-center gap-2">
                  <span className={getKycBadgeClass(selectedUser.kyc_status || 'pending')}>
                    {getKycIcon(selectedUser.kyc_status || 'pending')}
                    {selectedUser.kyc_status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Transaction History Summary */}
              <div className={`p-4 rounded-lg mb-6 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Transactions
                </h3>
                {transactions[selectedUser.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {transactions[selectedUser.id].map((tx) => (
                      <div key={tx.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${
                        isDark ? 'border-white/10' : 'border-gray-200'
                      }`}>
                        <div>
                          <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.type}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(tx.created_at)}</p>
                        </div>
                        <p className={`font-semibold ${tx.type === 'refund' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No recent transactions</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowUserModal(false);
                    handleSuspend(selectedUser);
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Suspend User
                </Button>
                <Button
                  onClick={() => {
                    setShowUserModal(false);
                    handleDelete(selectedUser);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setShowSuspendModal(false)} />
            <div className={`relative max-w-md w-full rounded-xl p-6 ${
              isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Suspend User</h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Suspending <span className="text-[#F1D302] font-semibold">
                  {selectedUser.full_name || selectedUser.id.substring(0, 8)}
                </span>
              </p>

              <div className="mb-6">
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reason for suspension
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-[#F1D302] ${
                    isDark 
                      ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                  rows={4}
                  placeholder="Enter reason for suspension..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSuspendModal(false)}
                  className={`flex-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSuspend}
                  disabled={!suspensionReason.trim()}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                >
                  Suspend
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-900/50'} backdrop-blur-sm`} onClick={() => setShowDeleteModal(false)} />
            <div className={`relative max-w-md w-full rounded-xl p-6 ${
              isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete User</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This action cannot be undone</p>
                </div>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete <span className="text-[#F1D302] font-semibold">
                  {selectedUser.full_name || selectedUser.id.substring(0, 8)}
                </span>? 
                All user data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}