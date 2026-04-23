import { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, UserMinus, Search, 
  Filter, MoreVertical, BadgeCheck, ShieldAlert,
  Loader2, ArrowUpDown, Smartphone, Briefcase,
  FileText, Check, X, Truck
} from 'lucide-react';
import { supabase } from '@cleanflow/core';
import { toast } from 'sonner';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    
    const sub = supabase
      .channel('public:profiles-manager')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        fetchUsers(); 
        if (payload.new?.notes?.includes('staff_application_pending')) {
          toast.info("New Staff Application!", { description: `${payload.new.name} has requested to join the team.` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const approveStaff = async (user) => {
    if (user.role !== 'agent') {
      toast.error("Invalid Role", { description: "Only agents can join your team." });
      return;
    }
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const fleetId = `CF-${randomNum}-FT`;

    // Use RPC to bypass RLS
    const { error } = await supabase.rpc('approve_staff_application', {
      target_user_id: user.id,
      new_fleet_id: fleetId
    });

    if (error) {
      console.error('[Admin] Approve RPC failed:', error);
      toast.error("Failed to approve", { description: error.message });
    } else {
      toast.success(`${user.name} added to Team!`, { description: `Staff ID: ${fleetId}` });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_staff: true, fleet_id: fleetId, notes: '', is_verified: true } : u));
    }
  };

  const toggleStaffStatus = async (user) => {
    if (user.role !== 'agent') {
      toast.error("Access Denied", { description: "Only agents can be on your team." });
      return;
    }

    // Use RPC to bypass RLS
    const { error } = await supabase.rpc('admin_update_profile', {
      target_user_id: user.id,
      field_name: 'is_staff',
      field_value: (!user.is_staff).toString()
    });

    if (error) {
      console.error('[Admin] Toggle staff failed:', error);
      toast.error("Update failed", { description: error.message });
    } else {
      toast.success(user.is_staff ? "Removed from Team" : "Added to Team");
      fetchUsers();
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    const { error } = await supabase.rpc('admin_update_profile', {
      target_user_id: userId,
      field_name: 'is_verified',
      field_value: (!currentStatus).toString()
    });

    if (error) {
      console.error('[Admin] Toggle verify failed:', error);
      toast.error("Action failed", { description: error.message });
    } else {
      toast.success(currentStatus ? "Unverified" : "Verified ✓");
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name?.toLowerCase().includes(search.toLowerCase())) || (u.phone?.includes(search));
    const isApplicant = u.notes?.includes('staff_application_pending');
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'staff') return matchesSearch && u.is_staff;
    if (filter === 'pending_apps') return matchesSearch && u.role === 'agent' && isApplicant;
    if (filter === 'agents') return matchesSearch && u.role === 'agent';
    if (filter === 'unverified') return matchesSearch && !u.is_verified;
    return matchesSearch;
  });

  const pendingCount = users.filter(u => u.role === 'agent' && u.notes?.includes('staff_application_pending')).length;

  return (
    <div className="animate-slide-up space-y-8 pb-20">
      
      {/* HEADER & STATS */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black dark:text-white tracking-tighter">User Manager</h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Team & Identity Control</p>
        </div>
        <div className="flex gap-3">
           <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Users</p>
              <p className="text-xl font-black dark:text-white leading-none">{users.length}</p>
           </div>
           <div className={`px-6 py-3 rounded-2xl border transition-all ${pendingCount > 0 ? 'bg-orange-500 text-white border-orange-400 animate-pulse shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5'}`}>
              <p className={`text-[10px] font-black uppercase mb-1 ${pendingCount > 0 ? 'text-white/80' : 'text-slate-400'}`}>Requests</p>
              <p className="text-xl font-black leading-none">{pendingCount}</p>
           </div>
        </div>
      </header>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 outline-none focus:border-primary transition-all shadow-sm dark:text-white"
            />
         </div>
         <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending_apps', label: `Requests (${pendingCount})` },
              { id: 'staff', label: 'My Team' },
              { id: 'agents', label: 'Agents' },
              { id: 'unverified', label: 'Unverified' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${filter === f.id ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      {/* USER LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-50 dark:border-white/5">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Staff ID</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {filteredUsers.map(u => {
                    const isApplicant = u.notes?.includes('staff_application_pending');
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${u.role === 'agent' && isApplicant ? 'bg-orange-50/30 dark:bg-orange-500/5' : ''}`}>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="relative">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner">{u.avatar || '👤'}</div>
                                 {u.role === 'agent' && isApplicant && (
                                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce" />
                                 )}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black dark:text-white leading-tight flex items-center gap-2">
                                     {u.name}
                                     {u.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/10" />}
                                  </h4>
                                  <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">{u.phone}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            {u.is_staff && u.role === 'agent' ? (
                               <div className="inline-block px-4 py-2 bg-slate-900 text-primary text-[11px] font-black rounded-xl border border-primary/20 font-mono">
                                  {u.fleet_id || 'TEAM'}
                               </div>
                            ) : (
                               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">None</span>
                            )}
                         </td>
                         <td className="px-8 py-6 text-center">
                            {u.role === 'agent' && isApplicant ? (
                               <span className="px-3 py-1 bg-orange-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Request</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                 <div className={`w-2 h-2 rounded-full ${u.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                    {u.is_online ? 'Online' : 'Offline'}
                                 </span>
                              </div>
                            )}
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                               {u.role === 'agent' && isApplicant ? (
                                 <button 
                                   onClick={() => approveStaff(u)}
                                   className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                                 >
                                    <Check className="w-4 h-4" /> Approve
                                 </button>
                               ) : (
                                 <>
                                   {u.role === 'agent' && (
                                     <button 
                                       onClick={() => toggleStaffStatus(u)}
                                       className={`p-2.5 rounded-xl border transition-all ${u.is_staff ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400 hover:text-primary'}`}
                                       title={u.is_staff ? "Remove from Team" : "Add to Team"}
                                     >
                                        <Briefcase className="w-4 h-4" />
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => toggleVerification(u.id, u.is_verified)}
                                     className={`p-2.5 rounded-xl border transition-all ${u.is_verified ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500'}`}
                                   >
                                      <ShieldCheck className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                               <button className="p-2.5 rounded-xl border border-slate-100 dark:border-white/5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900">
                                  <UserMinus className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
