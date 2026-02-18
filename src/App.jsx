import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://itcabbgtcbziwoorxtxh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y2FiYmd0Y2J6aXdvb3J4dHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTY4OTQsImV4cCI6MjA4Njk5Mjg5NH0.D5IeVqVUgRjBDzdTAHReZd2STR0Cy4LmstXYD-0FfKE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DASHBOARD_URL = "https://dashboard-chi-woad-48.vercel.app";

const CATS = [
  { v: "health", l: "Sağlık", i: "❤️" },
  { v: "fitness", l: "Fitness", i: "💪" },
  { v: "beauty", l: "Güzellik", i: "✨" },
  { v: "work", l: "İş", i: "💼" },
  { v: "education", l: "Eğitim", i: "📚" },
  { v: "mindfulness", l: "Farkındalık", i: "🧘" },
  { v: "finance", l: "Finans", i: "💰" },
  { v: "social", l: "Sosyal", i: "👥" },
  { v: "other", l: "Diğer", i: "📌" },
];

const FREQ = [
  { v: "daily", l: "Günlük" },
  { v: "weekly", l: "Haftalık" },
  { v: "monthly", l: "Aylık" },
];

const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const fmt = (d) => new Date(d).toISOString().split("T")[0];
const today = () => fmt(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return fmt(x); };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const isDue = (habit) => {
  const d = new Date();
  const di = (d.getDay() + 6) % 7;
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") return habit.daysOfWeek?.includes(di);
  if (habit.frequency === "monthly") return habit.daysOfMonth?.includes(d.getDate());
  return false;
};

const calcStreak = (h) => {
  if (!h.completions?.length) return 0;
  const sorted = [...h.completions].sort((a, b) => b.localeCompare(a));
  let count = 0, check = today();
  if (sorted[0] !== check) { check = addDays(check, -1); if (sorted[0] !== check) return 0; }
  for (let i = 0; i < 1000; i++) {
    if (sorted.includes(check)) { count++; check = addDays(check, -1); } else break;
  }
  return count;
};

const defaultData = () => ({ habits: [], rewards: [] });

// =============================================
// LOGIN
// =============================================
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email veya şifre hatalı.");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0F0A",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(122,158,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(122,158,100,0.03) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }} />
      <div style={{
        position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 300,
        background: "radial-gradient(ellipse, rgba(122,158,100,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💪</div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#7a9e64", textTransform: "uppercase", marginBottom: 12 }}>
            AI Agent Ekosistemi
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e8dcc8", marginBottom: 8 }}>Habit Tracker</div>
          <div style={{ fontSize: 14, color: "#4a5a3a", fontStyle: "italic" }}>Alışkanlıklarını takip et</div>
        </div>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(122,158,100,0.15)", borderRadius: 12, padding: "14px 18px", color: "#e8dcc8", fontSize: 15, outline: "none", fontFamily: "inherit" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(122,158,100,0.15)", borderRadius: 12, padding: "14px 18px", color: "#e8dcc8", fontSize: 15, outline: "none", fontFamily: "inherit" }} />
          {error && <div style={{ fontSize: 13, color: "#e85d5d", textAlign: "center" }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            background: loading ? "rgba(122,158,100,0.3)" : "linear-gradient(135deg, #7a9e64, #5a7e4a)",
            border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, fontFamily: "inherit",
          }}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================
// MAIN APP WRAPPER
// =============================================
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#0A0F0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a9e64", fontFamily: "Georgia, serif", fontSize: 14 }}>
      ⏳ Yükleniyor...
    </div>
  );

  if (!session) return <LoginScreen />;
  return <HabitTracker session={session} />;
}

// =============================================
// HABIT TRACKER MAIN
// =============================================
function HabitTracker({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editReward, setEditReward] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Load from Supabase
  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: row } = await supabase
        .from("user_data")
        .select("data")
        .eq("user_id", session.user.id)
        .single();
      setData(row?.data || defaultData());
    } catch {
      setData(defaultData());
    }
    setLoading(false);
  };

  const saveData = async (newData) => {
    setData(newData);
    await supabase.from("user_data").upsert({
      user_id: session.user.id,
      data: newData,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  };

  const toggleHabit = async (habitId) => {
    const t = today();
    const newData = {
      ...data,
      habits: data.habits.map(h => {
        if (h.id !== habitId) return h;
        const done = h.completions?.includes(t);
        return { ...h, completions: done ? h.completions.filter(c => c !== t) : [...(h.completions || []), t] };
      }),
    };
    await saveData(newData);
  };

  const saveHabit = async (habit) => {
    const exists = data.habits.find(h => h.id === habit.id);
    const newData = {
      ...data,
      habits: exists ? data.habits.map(h => h.id === habit.id ? habit : h) : [...data.habits, habit],
    };
    await saveData(newData);
    setShowHabitForm(false); setEditHabit(null);
    flash(exists ? "Habit güncellendi ✓" : "Habit eklendi ✓");
  };

  const deleteHabit = async (id) => {
    if (!window.confirm("Bu habit'i silmek istediğine emin misin?")) return;
    const newData = { ...data, habits: data.habits.filter(h => h.id !== id) };
    await saveData(newData);
    flash("Habit silindi");
  };

  const saveReward = async (reward) => {
    const exists = data.rewards?.find(r => r.id === reward.id);
    const newData = {
      ...data,
      rewards: exists
        ? (data.rewards || []).map(r => r.id === reward.id ? reward : r)
        : [...(data.rewards || []), reward],
    };
    await saveData(newData);
    setShowRewardForm(false); setEditReward(null);
    flash(exists ? "Ödül güncellendi ✓" : "Ödül eklendi ✓");
  };

  const deleteReward = async (id) => {
    if (!window.confirm("Bu ödülü silmek istediğine emin misin?")) return;
    const newData = { ...data, rewards: (data.rewards || []).filter(r => r.id !== id) };
    await saveData(newData);
    flash("Ödül silindi");
  };

  if (loading || !data) return (
    <div style={{ minHeight: "100vh", background: "#0A0F0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a9e64", fontFamily: "Georgia, serif", fontSize: 14 }}>
      ⏳ Veriler yükleniyor...
    </div>
  );

  const todayHabits = data.habits.filter(isDue);
  const completedToday = todayHabits.filter(h => h.completions?.includes(today()));
  const pct = todayHabits.length > 0 ? Math.round(completedToday.length / todayHabits.length * 100) : 0;
  const h = new Date().getHours();
  const greeting = h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
  const dateStr = `${new Date().getDate()} ${MONTHS_TR[new Date().getMonth()]} ${new Date().getFullYear()}`;

  const tabs = [
    { id: "today", label: "Bugün", emoji: "◉" },
    { id: "all", label: "Tümü", emoji: "☰" },
    { id: "rewards", label: "Ödüller", emoji: "🏆" },
    { id: "reports", label: "Rapor", emoji: "◧" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0F0A",
      fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#e8dcc8",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "rgba(122,158,100,0.15)" : "rgba(232,93,93,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(122,158,100,0.4)" : "rgba(232,93,93,0.4)"}`,
          borderRadius: 12, padding: "12px 20px", color: "#e8dcc8", fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0d1a0d 0%, #0a120a 100%)",
        padding: "20px 24px", borderBottom: "1px solid rgba(122,158,100,0.12)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#4a6a3a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 }}>{dateStr}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#e8dcc8" }}>{greeting} 💪</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Progress */}
              <div style={{
                background: "rgba(122,158,100,0.08)", border: "1px solid rgba(122,158,100,0.15)",
                borderRadius: 12, padding: "8px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#7a9e64" }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#4a6a3a" }}>{completedToday.length}/{todayHabits.length} bugün</div>
              </div>
              <button onClick={() => window.location.href = DASHBOARD_URL} style={{
                background: "transparent", border: "1px solid rgba(122,158,100,0.2)",
                borderRadius: 8, padding: "6px 12px", color: "#7a9e64",
                fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
              }}>← Ana Ekran</button>
              <button onClick={() => supabase.auth.signOut()} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "6px 12px", color: "#4a5a3a",
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              }}>Çıkış</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
                background: activeTab === tab.id ? "rgba(122,158,100,0.12)" : "transparent",
                color: activeTab === tab.id ? "#7a9e64" : "#4a5a3a",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "inherit",
              }}>{tab.emoji} {tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 80px" }}>

        {/* TODAY TAB */}
        {activeTab === "today" && (
          <div>
            {todayHabits.length === 0 ? (
              <EmptyState msg="Bugün için habit yok" sub="Habit eklemek için + butonuna tıkla" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {todayHabits.map(h => (
                  <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onEdit={(h) => { setEditHabit(h); setShowHabitForm(true); }} onDelete={deleteHabit} rewards={data.rewards || []} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL TAB */}
        {activeTab === "all" && (
          <div>
            {data.habits.length === 0 ? (
              <EmptyState msg="Henüz habit yok" sub="+ butonuna tıklayarak başla" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.habits.map(h => (
                  <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onEdit={(h) => { setEditHabit(h); setShowHabitForm(true); }} onDelete={deleteHabit} rewards={data.rewards || []} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === "rewards" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => { setEditReward(null); setShowRewardForm(true); }} style={{
                background: "linear-gradient(135deg, #7a9e64, #5a7e4a)",
                border: "none", borderRadius: 10, padding: "10px 20px",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>+ Yeni Ödül</button>
            </div>

            {(!data.rewards || data.rewards.length === 0) ? (
              <EmptyState msg="Henüz ödül yok" sub="Streak hedeflerin için ödüller belirle" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.rewards.map(reward => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    habits={data.habits}
                    onEdit={(r) => { setEditReward(r); setShowRewardForm(true); }}
                    onDelete={deleteReward}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && <ReportsView habits={data.habits} />}
      </div>

      {/* FAB - Add Habit */}
      {(activeTab === "today" || activeTab === "all") && (
        <button onClick={() => { setEditHabit(null); setShowHabitForm(true); }} style={{
          position: "fixed", bottom: 28, right: 28,
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, #7a9e64, #5a7e4a)",
          border: "none", color: "#fff", fontSize: 28,
          boxShadow: "0 8px 32px rgba(122,158,100,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 100, fontWeight: 300,
        }}>+</button>
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <Modal onClose={() => { setShowHabitForm(false); setEditHabit(null); }}>
          <HabitForm
            habit={editHabit}
            onSave={saveHabit}
            onCancel={() => { setShowHabitForm(false); setEditHabit(null); }}
          />
        </Modal>
      )}

      {/* Reward Form Modal */}
      {showRewardForm && (
        <Modal onClose={() => { setShowRewardForm(false); setEditReward(null); }}>
          <RewardForm
            reward={editReward}
            habits={data.habits}
            onSave={saveReward}
            onCancel={() => { setShowRewardForm(false); setEditReward(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

// =============================================
// HABIT CARD
// =============================================
function HabitCard({ habit, onToggle, onEdit, onDelete, rewards }) {
  const cat = CATS.find(c => c.v === habit.category) || CATS[8];
  const streak = calcStreak(habit);
  const done = habit.completions?.includes(today());
  const due = isDue(habit);

  // Check if any reward is unlocked for this habit
  const unlockedRewards = rewards.filter(r => {
    if (!r.linkedHabitIds?.includes(habit.id)) return false;
    return streak >= (r.streakDays || 0);
  });

  return (
    <div style={{
      background: done ? "rgba(122,158,100,0.08)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${done ? "rgba(122,158,100,0.25)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, padding: "18px 20px",
      opacity: !due ? 0.5 : 1, transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => due && onToggle(habit.id)} style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          border: done ? "none" : "2px solid rgba(122,158,100,0.3)",
          background: done ? "#7a9e64" : "transparent",
          cursor: due ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#0A0F0A", fontWeight: 700, transition: "all 0.3s",
        }}>
          {done ? "✓" : ""}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{cat.i}</span>
            <div style={{
              fontSize: 16, fontWeight: 600,
              color: done ? "#7a9e64" : "#e8dcc8",
              textDecoration: done ? "line-through" : "none",
            }}>{habit.name}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#4a6a3a", background: "rgba(122,158,100,0.08)", borderRadius: 20, padding: "2px 8px" }}>
              {FREQ.find(f => f.v === habit.frequency)?.l}
            </span>
            {habit.reminderTime && (
              <span style={{ fontSize: 11, color: "#4a6a3a" }}>⏰ {habit.reminderTime}</span>
            )}
            {!due && <span style={{ fontSize: 11, color: "#3a4a2a" }}>Bugün yok</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{streak > 0 ? "🔥" : "💤"}</div>
            <div style={{ fontSize: 11, color: streak > 0 ? "#7a9e64" : "#3a4a2a", fontWeight: 600 }}>{streak}g</div>
          </div>
          {habit.goalDays && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#4a6a3a" }}>Hedef</div>
              <div style={{ fontSize: 12, color: "#7a9e64", fontWeight: 600 }}>{streak}/{habit.goalDays}</div>
            </div>
          )}
        </div>
      </div>

      {/* Unlocked rewards */}
      {unlockedRewards.length > 0 && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(122,158,100,0.06)", borderRadius: 8, border: "1px solid rgba(122,158,100,0.15)" }}>
          {unlockedRewards.map(r => (
            <div key={r.id} style={{ fontSize: 12, color: "#7a9e64" }}>
              🎁 <strong>{r.name}</strong> ödülü kazanıldı!
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => onEdit(habit)} style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8, padding: "5px 12px", color: "#4a6a3a",
          fontSize: 11, cursor: "pointer", fontFamily: "inherit",
        }}>Düzenle</button>
        <button onClick={() => onDelete(habit.id)} style={{
          background: "transparent", border: "1px solid rgba(232,93,93,0.15)",
          borderRadius: 8, padding: "5px 12px", color: "#5a3a3a",
          fontSize: 11, cursor: "pointer", fontFamily: "inherit",
        }}>Sil</button>
      </div>
    </div>
  );
}

// =============================================
// REWARD CARD
// =============================================
function RewardCard({ reward, habits, onEdit, onDelete }) {
  const linkedHabits = habits.filter(h => reward.linkedHabitIds?.includes(h.id));
  const isUnlocked = linkedHabits.length > 0 && linkedHabits.every(h => calcStreak(h) >= (reward.streakDays || 0));
  const maxStreak = linkedHabits.length > 0 ? Math.max(...linkedHabits.map(h => calcStreak(h))) : 0;

  return (
    <div style={{
      background: isUnlocked ? "rgba(122,158,100,0.08)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isUnlocked ? "rgba(122,158,100,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>{reward.icon || "🎁"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: isUnlocked ? "#7a9e64" : "#e8dcc8" }}>
              {reward.name}
            </div>
            {isUnlocked && (
              <span style={{ fontSize: 10, background: "rgba(122,158,100,0.2)", color: "#7a9e64", borderRadius: 20, padding: "2px 8px", fontWeight: 700, letterSpacing: 1 }}>
                KAZANILDI!
              </span>
            )}
          </div>
          {reward.description && (
            <div style={{ fontSize: 13, color: "#4a6a3a", marginBottom: 8 }}>{reward.description}</div>
          )}
          <div style={{ fontSize: 12, color: "#3a5a2a" }}>
            🔥 {reward.streakDays} gün streak gerekli
            {linkedHabits.length > 0 && ` · ${linkedHabits.map(h => h.name).join(", ")}`}
          </div>
          {!isUnlocked && linkedHabits.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: "#7a9e64",
                  width: `${Math.min(100, Math.round(maxStreak / reward.streakDays * 100))}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#3a5a2a", marginTop: 4 }}>
                {maxStreak}/{reward.streakDays} gün
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => onEdit(reward)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 12px", color: "#4a6a3a", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Düzenle</button>
        <button onClick={() => onDelete(reward.id)} style={{ background: "transparent", border: "1px solid rgba(232,93,93,0.15)", borderRadius: 8, padding: "5px 12px", color: "#5a3a3a", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Sil</button>
      </div>
    </div>
  );
}

// =============================================
// HABIT FORM
// =============================================
function HabitForm({ habit, onSave, onCancel }) {
  const empty = { id: uid(), name: "", description: "", category: "health", frequency: "daily", daysOfWeek: [], daysOfMonth: [], reminderTime: "09:00", goalDays: 30 };
  const [form, setForm] = useState(habit || empty);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleDay = (d) => {
    const arr = form.daysOfWeek || [];
    set("daysOfWeek", arr.includes(d) ? arr.filter(x => x !== d) : [...arr, d]);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e8dcc8", marginBottom: 20 }}>
        {habit ? "Habit Düzenle" : "Yeni Habit"}
      </div>

      <Field label="Habit Adı">
        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="örn: Su iç (2L)" style={inputStyle} />
      </Field>

      <Field label="Açıklama (opsiyonel)">
        <input value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Neden önemli?" style={inputStyle} />
      </Field>

      <Field label="Kategori">
        <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
          {CATS.map(c => <option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
        </select>
      </Field>

      <Field label="Tekrar Sıklığı">
        <select value={form.frequency} onChange={e => set("frequency", e.target.value)} style={inputStyle}>
          {FREQ.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
      </Field>

      {form.frequency === "weekly" && (
        <Field label="Günler">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DAYS_TR.map((d, i) => (
              <button key={i} type="button" onClick={() => toggleDay(i)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                background: (form.daysOfWeek || []).includes(i) ? "#7a9e64" : "rgba(255,255,255,0.04)",
                border: `1px solid ${(form.daysOfWeek || []).includes(i) ? "#7a9e64" : "rgba(255,255,255,0.08)"}`,
                color: (form.daysOfWeek || []).includes(i) ? "#fff" : "#4a6a3a",
              }}>{d}</button>
            ))}
          </div>
        </Field>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Hatırlatıcı Saati">
          <input type="time" value={form.reminderTime || "09:00"} onChange={e => set("reminderTime", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Hedef Gün Sayısı">
          <input type="number" value={form.goalDays || 30} min={1} max={365} onChange={e => set("goalDays", parseInt(e.target.value))} style={inputStyle} />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={() => form.name.trim() && onSave(form)} style={{
          flex: 1, background: "linear-gradient(135deg, #7a9e64, #5a7e4a)",
          border: "none", borderRadius: 10, padding: "12px", color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>Kaydet</button>
        <button onClick={onCancel} style={{
          flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "12px", color: "#4a6a3a",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit",
        }}>İptal</button>
      </div>
    </div>
  );
}

// =============================================
// REWARD FORM
// =============================================
const REWARD_ICONS = ["🎁", "🏆", "⭐", "💎", "🎯", "🌟", "🎉", "👑", "🍰", "🛍️", "✈️", "💅", "🧖", "🎬", "📖", "💆"];

function RewardForm({ reward, habits, onSave, onCancel }) {
  const empty = { id: uid(), name: "", description: "", icon: "🎁", streakDays: 30, linkedHabitIds: [] };
  const [form, setForm] = useState(reward || empty);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleHabit = (id) => {
    const arr = form.linkedHabitIds || [];
    set("linkedHabitIds", arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e8dcc8", marginBottom: 20 }}>
        {reward ? "Ödülü Düzenle" : "Yeni Ödül"}
      </div>

      <Field label="Ödül Adı">
        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="örn: Spa günü" style={inputStyle} />
      </Field>

      <Field label="Açıklama (opsiyonel)">
        <input value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Kendine ver..." style={inputStyle} />
      </Field>

      <Field label="İkon">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {REWARD_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set("icon", ic)} style={{
              width: 36, height: 36, borderRadius: 8, fontSize: 20, cursor: "pointer",
              background: form.icon === ic ? "rgba(122,158,100,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${form.icon === ic ? "#7a9e64" : "rgba(255,255,255,0.08)"}`,
            }}>{ic}</button>
          ))}
        </div>
      </Field>

      <Field label="Streak Hedefi (gün)">
        <input type="number" value={form.streakDays || 30} min={1} max={365} onChange={e => set("streakDays", parseInt(e.target.value))} style={inputStyle} />
      </Field>

      <Field label="Bağlı Habit'ler (bir veya birden fazla)">
        {habits.length === 0 ? (
          <div style={{ fontSize: 13, color: "#3a5a2a" }}>Önce habit ekle</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {habits.map(h => {
              const cat = CATS.find(c => c.v === h.category) || CATS[8];
              const selected = (form.linkedHabitIds || []).includes(h.id);
              return (
                <button key={h.id} type="button" onClick={() => toggleHabit(h.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: selected ? "rgba(122,158,100,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selected ? "rgba(122,158,100,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}>
                  <span style={{ fontSize: 16 }}>{selected ? "✓" : "○"}</span>
                  <span style={{ fontSize: 14 }}>{cat.i}</span>
                  <span style={{ fontSize: 14, color: selected ? "#7a9e64" : "#e8dcc8" }}>{h.name}</span>
                  <span style={{ fontSize: 11, color: "#4a6a3a", marginLeft: "auto" }}>🔥 {calcStreak(h)}g</span>
                </button>
              );
            })}
          </div>
        )}
      </Field>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={() => form.name.trim() && onSave(form)} style={{
          flex: 1, background: "linear-gradient(135deg, #7a9e64, #5a7e4a)",
          border: "none", borderRadius: 10, padding: "12px", color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>Kaydet</button>
        <button onClick={onCancel} style={{
          flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "12px", color: "#4a6a3a",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit",
        }}>İptal</button>
      </div>
    </div>
  );
}

// =============================================
// REPORTS VIEW
// =============================================
function ReportsView({ habits }) {
  const [range, setRange] = useState(7);

  const stats = habits.map(h => {
    const streak = calcStreak(h);
    const start = addDays(today(), -range);
    const inRange = (h.completions || []).filter(c => c > start && c <= today());
    let due = 0;
    for (let i = 0; i < range; i++) {
      const d = addDays(start, i + 1);
      const dow = (new Date(d).getDay() + 6) % 7;
      const isDueDay = h.frequency === "daily" || (h.frequency === "weekly" && h.daysOfWeek?.includes(dow)) || (h.frequency === "monthly" && h.daysOfMonth?.includes(new Date(d).getDate()));
      if (isDueDay) due++;
    }
    const rate = due > 0 ? Math.round(inRange.length / due * 100) : 0;
    return { ...h, streak, done: inRange.length, due, rate };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[7, 14, 30].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: "8px 16px", borderRadius: 20, border: "none",
            background: range === r ? "rgba(122,158,100,0.15)" : "rgba(255,255,255,0.04)",
            color: range === r ? "#7a9e64" : "#4a6a3a",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>Son {r} gün</button>
        ))}
      </div>

      {stats.length === 0 ? (
        <EmptyState msg="Rapor için habit ekle" sub="Habit ekleyip tamamlamaya başla" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stats.map(h => {
            const cat = CATS.find(c => c.v === h.category) || CATS[8];
            return (
              <div key={h.id} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{cat.i}</span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{h.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#4a6a3a" }}>
                    <span>🔥 {h.streak}g streak</span>
                    <span style={{ color: h.rate >= 80 ? "#7a9e64" : h.rate >= 50 ? "#c9a961" : "#e85d5d", fontWeight: 700 }}>
                      %{h.rate}
                    </span>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, transition: "width 0.6s ease",
                    background: h.rate >= 80 ? "#7a9e64" : h.rate >= 50 ? "#c9a961" : "#e85d5d",
                    width: `${h.rate}%`,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#3a5a2a", marginTop: 6 }}>
                  {h.done}/{h.due} tamamlandı
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================
// HELPERS
// =============================================
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(122,158,100,0.15)", borderRadius: 10,
  padding: "10px 14px", color: "#e8dcc8", fontSize: 14,
  outline: "none", fontFamily: "'Cormorant Garamond', Georgia, serif",
  boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#4a6a3a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}

function EmptyState({ msg, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💪</div>
      <div style={{ fontSize: 18, color: "#4a6a3a", fontWeight: 600, marginBottom: 6 }}>{msg}</div>
      <div style={{ fontSize: 13, color: "#2a3a1a" }}>{sub}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0d1a0d", border: "1px solid rgba(122,158,100,0.15)",
        borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 480,
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {children}
      </div>
    </div>
  );
}
