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

  const [activeHub, setActiveHub] = useState('marketplace');
  const [marketSubFilter, setMarketSubFilter] = useState('all'); // all, weavers, industrial, requests
  const [logisticsSubFilter, setLogisticsSubFilter] = useState('all'); // all, team, requests

  const filteredUsers = (() => {
    // START WITH REAL USERS
    let baseUsers = [...users];
    
    // IF NO REAL DATA, INJECT SAMPLES FOR DEMO
    if (baseUsers.length < 5) {
      baseUsers = [
        ...baseUsers,
        { id: 'mock-1', name: 'John Kamau', email: 'john.k@logistics.com', phone: '0712 345 678', role: 'agent', notes: 'staff_application_pending', created_at: new Date().toISOString() },
        { id: 'mock-2', name: 'Sarah Wambui', email: 'sarah.w@cleanflow.ke', phone: '0722 987 654', role: 'agent', is_staff: true, notes: 'active_fleet', created_at: new Date().toISOString() },
        { id: 'mock-3', name: 'Peter Omolo', email: 'p.omolo@express.com', phone: '0733 111 222', role: 'agent', notes: 'staff_application_pending', created_at: new Date().toISOString() },
        { id: 'mock-4', name: 'Mary Atieno', email: 'm.atieno@weaver.ke', phone: '0744 555 666', role: 'business', business_type: 'weaver', is_verified: false, nema_license: 'NEMA/2024/001' },
      ];
    }

    return baseUsers.filter(u => {
      const matchesSearch = (u.name?.toLowerCase().includes(search.toLowerCase())) || (u.phone?.includes(search));
      const isApplicant = u.notes?.includes('staff_application_pending');
      
      if (activeHub === 'marketplace') {
        const isMarketUser = (u.role === 'business' || u.business_type === 'weaver' || u.business_type === 'recycler' || u.business_type === 'manufacturer');
        if (!isMarketUser) return false;
        
        if (marketSubFilter === 'weavers') return matchesSearch && u.business_type === 'weaver';
        if (marketSubFilter === 'industrial') return matchesSearch && (u.business_type === 'recycler' || u.business_type === 'manufacturer');
        if (marketSubFilter === 'requests') return matchesSearch && u.nema_license && !u.is_verified;
        return matchesSearch;
      }
      
      if (activeHub === 'logistics') {
        if (u.role !== 'agent') return false;
        if (logisticsSubFilter === 'team') return matchesSearch && u.is_staff;
        if (logisticsSubFilter === 'requests') return matchesSearch && isApplicant;
        return matchesSearch;
      }
      
      if (activeHub === 'community') return matchesSearch && u.role === 'user';
      if (activeHub === 'admin') return matchesSearch && u.role === 'admin';
      
      return matchesSearch;
    });
  })();

  const stats = {
    pendingApps: users.filter(u => u.role === 'agent' && u.notes?.includes('staff_application_pending')).length || 2,
    pendingLicenses: users.filter(u => !u.is_verified && u.nema_license).length || 1,
    totalAgents: users.filter(u => u.role === 'agent').length || 3,
    totalBusinesses: users.filter(u => u.role === 'business' || u.business_type).length || 5
  };

  return (
    <div className="animate-slide-up space-y-8 pb-20">
      
      {/* HEADER */}
      <header>
         <h1 className="text-3xl font-black dark:text-white tracking-tighter">Command Center</h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Identity & Fleet Management</p>
      </header>

      {/* ── INTERACTIVE HUB CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
         {/* Hub: Market */}
         <button 
           onClick={() => { setActiveHub('marketplace'); setMarketSubFilter('all'); }}
           className={`p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
             activeHub === 'marketplace' 
               ? 'bg-slate-900 border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-[1.02] ring-2 ring-primary/20' 
               : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/30'
           }`}
         >
           {activeHub === 'marketplace' && (
             <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
               Active View
             </div>
           )}
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
             activeHub === 'marketplace' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
           }`}>
             <Briefcase className="w-7 h-7" />
           </div>
           <h3 className={`text-xl font-black tracking-tight mb-1 ${activeHub === 'marketplace' ? 'text-white' : 'dark:text-white'}`}>Business Partners</h3>
           <p className={`text-[10px] font-bold uppercase tracking-widest ${activeHub === 'marketplace' ? 'text-white/40' : 'text-slate-400'}`}>Weavers & Recyclers</p>
         </button>

         {/* Hub: Logistics */}
         <button 
           onClick={() => { setActiveHub('logistics'); setLogisticsSubFilter('all'); }}
           className={`p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
             activeHub === 'logistics' 
               ? 'bg-slate-900 border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-[1.02] ring-2 ring-indigo-500/20' 
               : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-indigo-400/30'
           }`}
         >
           {activeHub === 'logistics' && (
             <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
               Active View
             </div>
           )}
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
             activeHub === 'logistics' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
           }`}>
             <Truck className="w-7 h-7" />
           </div>
           <h3 className={`text-xl font-black tracking-tight mb-1 ${activeHub === 'logistics' ? 'text-white' : 'dark:text-white'}`}>Transport & Drivers</h3>
           <p className={`text-[10px] font-bold uppercase tracking-widest ${activeHub === 'logistics' ? 'text-white/40' : 'text-slate-400'}`}>Fleet & Management</p>
         </button>

         {/* Hub: Community */}
         <button 
           onClick={() => setActiveHub('community')}
           className={`p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden ${
             activeHub === 'community' 
               ? 'bg-slate-900 border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-[1.02] ring-2 ring-slate-500/20' 
               : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-400/30'
           }`}
         >
           {activeHub === 'community' && (
             <div className="absolute top-4 right-4 px-3 py-1 bg-slate-500/20 border border-slate-500/20 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
               Active View
             </div>
           )}
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
             activeHub === 'community' ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
           }`}>
             <Users className="w-7 h-7" />
           </div>
           <h3 className={`text-xl font-black tracking-tight mb-1 ${activeHub === 'community' ? 'text-white' : 'dark:text-white'}`}>Resident Members</h3>
           <p className={`text-[10px] font-bold uppercase tracking-widest ${activeHub === 'community' ? 'text-white/40' : 'text-slate-400'}`}>Standard & Premium</p>
         </button>
      </div>

      {/* SEARCH & SUB-FILTERS */}
      <div className="space-y-4">
         {activeHub === 'marketplace' && (
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setMarketSubFilter('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketSubFilter === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Everyone
              </button>
              <button 
                onClick={() => setMarketSubFilter('weavers')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketSubFilter === 'weavers' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Collectors
              </button>
              <button 
                onClick={() => setMarketSubFilter('industrial')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketSubFilter === 'industrial' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Industrial
              </button>
              <button 
                onClick={() => setMarketSubFilter('requests')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${marketSubFilter === 'requests' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Waitlist
                {stats.pendingLicenses > 0 && <div className={`w-2 h-2 rounded-full ${marketSubFilter === 'requests' ? 'bg-white' : 'bg-rose-500'} animate-pulse`} />}
              </button>
            </div>
         )}

         {activeHub === 'logistics' && (
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setLogisticsSubFilter('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${logisticsSubFilter === 'all' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Everyone
              </button>
              <button 
                onClick={() => setLogisticsSubFilter('team')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${logisticsSubFilter === 'team' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Staff
              </button>
              <button 
                onClick={() => setLogisticsSubFilter('requests')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${logisticsSubFilter === 'requests' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                Waitlist
                {stats.pendingApps > 0 && <div className={`w-2 h-2 rounded-full ${logisticsSubFilter === 'requests' ? 'bg-white' : 'bg-rose-500'} animate-pulse`} />}
              </button>
            </div>
         )}

         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search within ${activeHub}...`} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 outline-none focus:border-primary transition-all shadow-sm dark:text-white"
            />
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
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Role / Category</th>
                     {activeHub === 'logistics' ? (
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Staff ID</th>
                     ) : activeHub === 'marketplace' ? (
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NEMA License</th>
                     ) : null}
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center text-slate-400">
                        <p className="text-sm font-bold">No results found for your filter</p>
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => {
                    const isApplicant = u.notes?.includes('staff_application_pending');
                    const roleLabel = u.role === 'admin' ? '🛡️ Admin' :
                                    u.role === 'agent' ? '🚛 Agent' :
                                    u.business_type === 'weaver' ? '🧶 Weaver' :
                                    u.business_type === 'recycler' ? '♻️ Recycler' :
                                    u.business_type === 'manufacturer' ? '🏭 Manufacturer' :
                                    '👤 Resident';

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
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                              u.role === 'admin' ? 'bg-slate-900 text-primary border border-primary/20' :
                              u.role === 'agent' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              u.business_type === 'weaver' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                              u.business_type === 'recycler' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              u.business_type === 'manufacturer' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                               {roleLabel}
                            </span>
                         </td>
                         
                         {/* CONTEXTUAL COLUMN CONTENT */}
                         {activeHub === 'logistics' && (
                            <td className="px-8 py-6 text-center">
                               {u.is_staff && u.role === 'agent' ? (
                                  <div className="inline-block px-4 py-2 bg-slate-900 text-primary text-[11px] font-black rounded-xl border border-primary/20 font-mono">
                                     {u.fleet_id || 'TEAM'}
                                  </div>
                               ) : (
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">None</span>
                               )}
                            </td>
                         )}

                         {activeHub === 'marketplace' && (
                            <td className="px-8 py-6 text-center">
                               {u.nema_license ? (
                                  <div className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg border border-slate-200 dark:border-white/5 font-mono">
                                     {u.nema_license}
                                  </div>
                               ) : (
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic opacity-50">Not Provided</span>
                               )}
                            </td>
                         )}
                         <td className="px-8 py-6 text-center">
                            {u.role === 'agent' && isApplicant ? (
                               <span className="px-3 py-1 bg-orange-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Request</span>
                            ) : u.role === 'agent' ? (
                              <div className="flex flex-col items-center gap-1">
                                 <div className={`w-2 h-2 rounded-full ${u.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                    {u.is_online ? 'Online' : 'Offline'}
                                 </span>
                              </div>
                            ) : (
                               <div className="flex flex-col items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-emerald-500' : u.role === 'user' ? 'bg-slate-200' : u.nema_license ? 'bg-orange-400 animate-pulse' : 'bg-slate-200'}`} />
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                     {u.is_verified ? 'Verified' : u.role === 'user' ? 'Member' : u.nema_license ? 'Under Review' : 'Unverified'}
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
                                       className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter ${u.is_staff ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400 hover:text-primary'}`}
                                       title={u.is_staff ? "Remove from Team" : "Add to Team"}
                                     >
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {u.is_staff ? 'On Team' : 'Add Team'}
                                     </button>
                                   )}
                                   {u.nema_license && (
                                     <button 
                                       onClick={() => {
                                         toast.info("NEMA License Review", { 
                                           description: `License Number: ${u.nema_license}`,
                                           duration: 8000,
                                           action: {
                                             label: "Close",
                                             onClick: () => {}
                                           }
                                         });
                                       }}
                                       className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-slate-200"
                                       title="View Submitted NEMA License"
                                     >
                                        <FileText className="w-3.5 h-3.5" />
                                        License
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => toggleVerification(u.id, u.is_verified)}
                                     className={`p-2.5 rounded-xl border transition-all ${u.is_verified ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500'}`}
                                     title={u.is_verified ? "Unverify Account" : "Verify Account"}
                                   >
                                      <ShieldCheck className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                               <button 
                                 title="Remove User Account"
                                 className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 text-[9px] font-black uppercase tracking-tighter"
                               >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Remove
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
