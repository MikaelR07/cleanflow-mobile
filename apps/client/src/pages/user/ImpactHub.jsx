import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, Medal, Zap, Leaf, Loader2 } from 'lucide-react';
import { useAuthStore, useBookingStore, supabase } from '@cleanflow/core';

// Badge definitions — unlock conditions are checked dynamically
const BADGE_DEFS = [
  { id: 'first_pickup', name: 'First Step', icon: '🌱', description: 'Complete your first pickup', check: (stats) => stats.totalPickups >= 1 },
  { id: 'green_neighbor', name: 'Green Neighbor', icon: '🏠', description: '5 successful pickups', check: (stats) => stats.totalPickups >= 5 },
  { id: 'plastic_warrior', name: 'Plastic Warrior', icon: '♻️', description: 'Recycled 50+ kg of plastic', check: (stats) => stats.plasticKg >= 50 },
  { id: 'ewaste_wizard', name: 'E-Waste Wizard', icon: '🔌', description: 'Recycled electronics', check: (stats) => stats.hasEwaste },
  { id: 'organic_hero', name: 'Organic Hero', icon: '🥬', description: 'Recycled 30+ kg organic waste', check: (stats) => stats.organicKg >= 30 },
  { id: 'century_club', name: 'Century Club', icon: '💯', description: 'Earned 1000+ GFP', check: (stats) => stats.gfp >= 1000 },
  { id: 'sprout_level', name: 'Sprout Level', icon: '🌿', description: 'Reached Sprout rank', check: (stats) => stats.gfp > 500 },
  { id: 'oak_level', name: 'Forest Keeper', icon: '🌳', description: 'Reached Oak rank', check: (stats) => stats.gfp > 2000 },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', description: '3-week recycling streak', check: (stats) => stats.streak >= 3 },
];

function calculateStreak(bookings) {
  const completed = bookings
    .filter(b => b.status === 'completed')
    .map(b => new Date(b.lastUpdated || b.date));

  if (completed.length === 0) return 0;

  // Group by ISO week
  const weeks = new Set();
  completed.forEach(d => {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    weeks.add(start.toISOString().slice(0, 10));
  });

  const sortedWeeks = [...weeks].sort().reverse();
  
  // Count consecutive weeks from the most recent
  let streak = 0;
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  const currentWeek = now.toISOString().slice(0, 10);
  
  // Check if the most recent week is this week or last week
  if (sortedWeeks[0] !== currentWeek) {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    if (sortedWeeks[0] !== lastWeek.toISOString().slice(0, 10)) return 0;
  }

  for (let i = 0; i < sortedWeeks.length; i++) {
    const expected = new Date(now);
    expected.setDate(expected.getDate() - (i * 7));
    const expectedStr = expected.toISOString().slice(0, 10);
    if (sortedWeeks[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function ImpactHub() {
  const navigate = useNavigate();
  const { profile, getGFPMetrics } = useAuthStore();
  const { bookings } = useBookingStore();
  const metrics = getGFPMetrics();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  // Fetch leaderboard from DB
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoadingBoard(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, location, reward_points')
        .eq('role', 'user')
        .order('reward_points', { ascending: false })
        .limit(10);

      if (!error && data) {
        setLeaderboard(data.map((u, idx) => ({
          id: u.id,
          name: u.name?.split(' ')[0] || 'User',
          estate: u.location?.estate || 'Nairobi',
          points: u.reward_points || 0,
          rank: idx + 1,
          isMe: u.id === profile?.id
        })));
      }
      setLoadingBoard(false);
    }
    fetchLeaderboard();
  }, [profile?.id]);

  // Calculate streak from bookings
  const streak = useMemo(() => calculateStreak(bookings), [bookings]);

  // Calculate kg recovered from GFP
  const kgRecovered = Math.floor((profile?.rewardPoints || 0) / 5);

  // Build badge unlock stats
  const badgeStats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed');
    const wasteTypes = completed.map(b => (b.wasteType || '').toLowerCase());
    
    return {
      totalPickups: completed.length,
      gfp: profile?.rewardPoints || 0,
      plasticKg: wasteTypes.filter(w => w.includes('plastic') || w.includes('recyclable')).length * 5,
      organicKg: wasteTypes.filter(w => w.includes('organic')).length * 5,
      hasEwaste: wasteTypes.some(w => w.includes('e-waste') || w.includes('electronic')),
      streak,
    };
  }, [bookings, profile?.rewardPoints, streak]);

  const badges = BADGE_DEFS.map(b => ({ ...b, unlocked: b.check(badgeStats) }));
  const unlockedCount = badges.filter(b => b.unlocked).length;

  // Max points on leaderboard for progress bar scaling
  const maxPoints = leaderboard.length > 0 ? leaderboard[0].points : 1;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">GreenFlow Hub</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest">Sustainability Dashboard</p>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="card bg-gradient-to-br from-primary to-emerald-600 p-6 text-white border-0 shadow-xl shadow-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            {metrics.icon}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Current Rank</p>
            <h2 className="text-2xl font-black">{metrics.tier}</h2>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Impact Score</p>
            <p className="text-2xl font-mono font-black">{profile?.rewardPoints || 0} GFP</p>
          </div>
        </div>

        <div className="space-y-1.5 relative">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
            <span>Progress to {metrics.nextTier}</span>
            <span>{Math.round(metrics.progress)}%</span>
          </div>
          <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${metrics.progress}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-bold text-center opacity-70 italic mt-1">
            Your recycling efforts have recovered {kgRecovered}kg of waste from landfills
          </p>
        </div>
      </div>

      {/* Streaks & Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`card p-4 flex items-center gap-3 ${streak > 0 ? 'border-orange-100 bg-orange-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? 'bg-orange-100' : 'bg-slate-100'}`}>
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase leading-none mb-1 ${streak > 0 ? 'text-orange-600/60' : 'text-slate-400'}`}>Streak</p>
            <p className={`text-lg font-black leading-none ${streak > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
              {streak > 0 ? `${streak} Week${streak > 1 ? 's' : ''}` : 'None'}
            </p>
          </div>
        </div>
        <div className="card p-4 border-blue-100 bg-blue-50/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-blue-600/60 leading-none mb-1">Recovered</p>
            <p className="text-lg font-black text-blue-600 leading-none">{kgRecovered}kg</p>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-500" /> Badges
          </h3>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            {unlockedCount}/{badges.length} Earned
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {badges.map(badge => (
            <div 
              key={badge.id} 
              className={`card p-3 text-center transition-all ${!badge.unlocked ? 'grayscale opacity-40' : 'shadow-md'}`}
            >
              <div className={`text-3xl mb-1.5 ${badge.unlocked ? 'transform hover:scale-110 transition-transform' : ''}`}>
                {badge.icon}
              </div>
              <p className="text-[9px] font-black leading-tight uppercase tracking-tighter text-slate-700 dark:text-slate-300">
                {badge.name}
              </p>
              <p className="text-[7px] text-slate-400 mt-0.5 leading-tight">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="space-y-4">
        <h3 className="font-extrabold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Community Leaderboard
        </h3>
        <div className="card border-0 bg-slate-50 dark:bg-slate-800/50 p-1">
          {loadingBoard ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs text-slate-400 ml-2">Loading rankings...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No recyclers yet. Be the first!</p>
            </div>
          ) : (
            leaderboard.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.isMe ? 'bg-primary/10 border border-primary/20 ring-1 ring-primary/10' : ''}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  item.rank === 1 ? 'bg-amber-400 text-white' : 
                  item.rank === 2 ? 'bg-slate-300 text-slate-700' :
                  item.rank === 3 ? 'bg-orange-300 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  #{item.rank}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black dark:text-white">
                    {item.name} {item.isMe && <span className="text-[8px] text-primary font-bold">(You)</span>}
                    <span className="text-[10px] font-medium text-slate-400 ml-1">at {item.estate}</span>
                  </p>
                  <div className="h-1 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(item.points / Math.max(maxPoints, 1)) * 100}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary font-mono">{item.points}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">GFP</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
