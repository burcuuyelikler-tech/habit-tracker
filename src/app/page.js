"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { today, fmtTR, isDue, defaultState, requestNotifPermission, scheduleNotification, CATS } from "@/lib/helpers";
import { loadData, saveData } from "@/lib/storage";
import { ProgressRing } from "@/components/ui";
import HabitCard from "@/components/HabitCard";
import ManageView from "@/components/ManageView";
import ReportsView from "@/components/ReportsView";
import AuthScreen from "@/components/AuthScreen";

export default function Home() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("today");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const saveTimer = useRef(null);

  // Check session on mount
  useEffect(() => {
    if (!supabase) {
      // No Supabase configured — skip auth, load local
      setAuthChecked(true);
      const d = loadData(null);
      if (d && d.then) d.then((r) => { setData(r || defaultState()); setLoading(false); });
      else { setData(d || defaultState()); setLoading(false); }
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user is set
  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    const uid = user?.id || null;
    loadData(uid).then((d) => {
      setData(d || defaultState());
      setLoading(false);
    }).catch(() => {
      setData(defaultState());
      setLoading(false);
    });
  }, [user, authChecked]);

  // Debounced save
  useEffect(() => {
    if (loading || !data || !authChecked) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData(data, user?.id || null);
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, loading, user, authChecked]);

  // Notifications
  useEffect(() => {
    if (data?.settings?.notif) {
      requestNotifPermission();
      data.habits.forEach(scheduleNotification);
    }
  }, [data?.habits, data?.settings?.notif]);

  const toggle = useCallback((id) => {
    setData((p) => ({
      ...p,
      habits: p.habits.map((h) => {
        if (h.id !== id) return h;
        const t = today();
        const done = h.completions?.includes(t);
        return { ...h, completions: done ? h.completions.filter((c) => c !== t) : [...(h.completions || []), t] };
      }),
    }));
  }, []);

  const saveH = useCallback((habit) => {
    setData((p) => {
      const ex = p.habits.find((h) => h.id === habit.id);
      return { ...p, habits: ex ? p.habits.map((h) => h.id === habit.id ? habit : h) : [...p.habits, habit] };
    });
  }, []);

  const delH = useCallback((id) => {
    if (confirm("Bu habit'i silmek istediğinize emin misiniz?")) {
      setData((p) => ({ ...p, habits: p.habits.filter((h) => h.id !== id) }));
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setData(defaultState());
  };

  // Auth screen (only if Supabase is configured)
  if (supabase && authChecked && !user) {
    return <AuthScreen onAuth={(u) => setUser(u)} />;
  }

  // Loading
  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40, animation: "pulse 1.5s ease infinite" }}>✦</div>
        <div style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600 }}>Habit Vault</div>
        <div style={{ color: "var(--dim)", fontSize: 13 }}>Yükleniyor...</div>
      </div>
    );
  }

  const todayH = data.habits.filter(isDue);
  const compToday = todayH.filter((h) => h.completions?.includes(today()));
  let dispH = view === "today" ? todayH : data.habits;
  if (filter !== "all") dispH = dispH.filter((h) => h.category === filter);
  if (search) dispH = dispH.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));
  const todayPct = todayH.length > 0 ? Math.round(compToday.length / todayH.length * 100) : 0;
  const now = new Date();
  const greet = now.getHours() < 12 ? "Günaydın" : now.getHours() < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header style={{ padding: "24px 20px 0", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{fmtTR(today())}</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, color: "var(--text)", margin: 0, letterSpacing: -0.5 }}>{greet} ✦</h1>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => window.location.href = "https://dashboard-chi-woad-48.vercel.app"} style={{
                background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: 8, padding: "6px 10px", color: "#C9A96E", fontSize: 11, cursor: "pointer",
                fontWeight: 600,
              }}>← Ana Ekran</button>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--sub)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>☁️ Senkronize</div>
                <div style={{ color: "var(--dim)", fontSize: 10 }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 10px", color: "var(--dim)", fontSize: 11, cursor: "pointer",
              }}>Çıkış</button>
            </div>
          )}
        </div>

        {(view === "today" || view === "all") && (
          <div style={{
            display: "flex", alignItems: "center", gap: 16, margin: "20px 0",
            padding: "16px 20px", borderRadius: 14,
            background: "linear-gradient(135deg,rgba(201,169,110,0.08) 0%,rgba(201,169,110,0.02) 100%)",
            border: "1px solid rgba(201,169,110,0.1)",
          }}>
            <ProgressRing pct={todayPct} size={64} sw={5} />
            <div>
              <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600, fontFamily: "var(--serif)" }}>Bugünün Durumu</div>
              <div style={{ color: "var(--sub)", fontSize: 13 }}>{compToday.length} / {todayH.length} tamamlandı</div>
            </div>
            {todayPct === 100 && todayH.length > 0 && <div style={{ marginLeft: "auto", fontSize: 28, animation: "fadeIn 0.5s" }}>🌟</div>}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[
            { id: "today", l: "Bugün", ic: "◉" },
            { id: "all", l: "Tümü", ic: "☰" },
            { id: "manage", l: "Yönetim", ic: "✦" },
            { id: "reports", l: "Raporlar", ic: "◧" },
          ].map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              flex: 1, padding: 10, borderRadius: 10, border: "none",
              background: view === t.id ? "var(--gold-dim)" : "transparent",
              color: view === t.id ? "var(--gold)" : "var(--dim)",
              fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            }}>{t.ic} {t.l}</button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 100px" }}>
        {view === "reports" && <ReportsView habits={data.habits} />}
        {view === "manage" && <ManageView data={data} setData={setData} saveH={saveH} delH={delH} />}

        {(view === "today" || view === "all") && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              <button onClick={() => setFilter("all")} style={{
                padding: "6px 14px", borderRadius: 20,
                border: filter === "all" ? "1px solid var(--gold)" : "1px solid var(--border)",
                background: filter === "all" ? "var(--gold-dim)" : "transparent",
                color: filter === "all" ? "var(--gold)" : "var(--dim)",
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              }}>Hepsi</button>
              {CATS.map((c) => {
                const n = (view === "today" ? todayH : data.habits).filter((h) => h.category === c.v).length;
                if (n === 0 && filter !== c.v) return null;
                return (
                  <button key={c.v} onClick={() => setFilter((f) => f === c.v ? "all" : c.v)} style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: filter === c.v ? "1px solid var(--gold)" : "1px solid var(--border)",
                    background: filter === c.v ? "var(--gold-dim)" : "transparent",
                    color: filter === c.v ? "var(--gold)" : "var(--dim)",
                    fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                  }}>{c.i} {c.l}</button>
                );
              })}
            </div>

            {data.habits.length > 3 && (
              <div style={{ marginBottom: 16 }}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Habit ara..."
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dispH.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--dim)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--sub)", marginBottom: 8 }}>
                    {view === "today" ? "Bugün için görev yok" : "Henüz habit eklenmemiş"}
                  </div>
                  <div style={{ fontSize: 13 }}>Yönetim sekmesinden yeni habit ekle</div>
                </div>
              )}
              {dispH.map((h) => <HabitCard key={h.id} habit={h} onToggle={toggle} />)}
            </div>
          </>
        )}
      </main>

      <button onClick={() => setView("manage")} style={{
        position: "fixed", bottom: 28, right: 28, width: 56, height: 56, borderRadius: 16,
        background: "var(--gold)", border: "none", color: "var(--bg)", fontSize: 26,
        boxShadow: "0 8px 32px rgba(201,169,110,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.2s", zIndex: 100,
      }} title="Yönetim">✦</button>
    </div>
  );
}
