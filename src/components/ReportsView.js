"use client";
import { useState, useMemo } from "react";
import { CATS, FREQ, today, addDays, isDue, calcStreak } from "@/lib/helpers";
import { StreakFire } from "@/components/ui";

export default function ReportsView({ habits }) {
  const [selH, setSelH] = useState("all");
  const [range, setRange] = useState(30);
  const fh = selH === "all" ? habits : habits.filter((h) => h.id === selH);

  const stats = useMemo(() => {
    const now = today(), start = addDays(now, -range);
    let tDue = 0, tDone = 0;
    const daily = {}, catData = {}, hStats = [];
    for (let i = 0; i < range; i++) { const d = addDays(start, i + 1); daily[d] = { due: 0, done: 0 }; }
    fh.forEach((h) => {
      const comp = (h.completions || []).filter((c) => c > start && c <= now);
      const s = calcStreak(h), cat = CATS.find((c) => c.v === h.category);
      let due = 0;
      for (let i = 0; i < range; i++) {
        const d = addDays(start, i + 1), dow = (new Date(d).getDay() + 6) % 7;
        let isDueDay = h.frequency === "daily" || (h.frequency === "weekly" && h.daysOfWeek?.includes(dow)) || (h.frequency === "custom" && h.customDays?.includes(dow)) || (h.frequency === "monthly" && h.daysOfMonth?.includes(new Date(d).getDate()));
        if (isDueDay) { due++; daily[d].due++; }
        if (comp.includes(d)) daily[d].done++;
      }
      tDue += due; tDone += comp.length;
      if (!catData[h.category]) catData[h.category] = { done: 0, due: 0, l: cat?.l, i: cat?.i };
      catData[h.category].done += comp.length; catData[h.category].due += due;
      hStats.push({ ...h, streak: s, compR: comp.length, dueR: due, rate: due > 0 ? Math.round(comp.length / due * 100) : 0 });
    });
    return { tDue, tDone, rate: tDue > 0 ? Math.round(tDone / tDue * 100) : 0, daily, catData, hStats };
  }, [fh, range]);

  const barMax = Math.max(...Object.values(stats.daily).map((d) => d.due), 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={selH} onChange={(e) => setSelH(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">Tüm Habitler</option>
          {habits.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        {[7, 14, 30, 60, 90].map((d) => (
          <button key={d} onClick={() => setRange(d)} style={{
            padding: "8px 14px", borderRadius: 10,
            border: range === d ? "1px solid var(--gold)" : "1px solid var(--border)",
            background: range === d ? "var(--gold-dim)" : "rgba(255,255,255,0.03)",
            color: range === d ? "var(--gold)" : "var(--dim)", fontSize: 12, fontWeight: 600,
          }}>{d}g</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { l: "Tamamlanma", v: `${stats.rate}%`, s: `${stats.tDone}/${stats.tDue}` },
          { l: "En Uzun Seri", v: `${Math.max(0, ...fh.map(calcStreak))}`, s: "gün" },
          { l: "Toplam Habit", v: fh.length, s: "aktif" },
          { l: "Bugün", v: fh.filter((h) => h.completions?.includes(today())).length, s: `/ ${fh.filter(isDue).length} görev` },
        ].map((c, i) => (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
            <div style={{ color: "var(--sub)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{c.l}</div>
            <div style={{ color: "var(--gold)", fontSize: 28, fontFamily: "var(--serif)", fontWeight: 700 }}>{c.v}</div>
            <div style={{ color: "var(--dim)", fontSize: 12 }}>{c.s}</div>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>Günlük Tamamlanma</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, overflowX: "auto" }}>
          {Object.entries(stats.daily).map(([d, v]) => (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 0 auto", minWidth: range <= 14 ? 30 : 8 }}>
              <div style={{ width: "100%", maxWidth: 24, position: "relative", height: 100 }}>
                <div style={{ position: "absolute", bottom: 0, width: "100%", borderRadius: "4px 4px 0 0", height: `${(v.due / barMax) * 100}%`, background: "rgba(255,255,255,0.04)" }} />
                <div style={{ position: "absolute", bottom: 0, width: "100%", borderRadius: "4px 4px 0 0", height: `${(v.done / barMax) * 100}%`, background: v.done >= v.due && v.due > 0 ? "var(--gold)" : "rgba(201,169,110,0.4)", transition: "height 0.5s" }} />
              </div>
              {range <= 14 && <span style={{ fontSize: 9, color: "var(--dim)", marginTop: 4 }}>{new Date(d).getDate()}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Category bars */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>Kategori Bazında</h3>
        {Object.entries(stats.catData).map(([k, v]) => {
          const pct = v.due > 0 ? Math.round(v.done / v.due * 100) : 0;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 16, width: 24 }}>{v.i}</span>
              <span style={{ color: "var(--text)", fontSize: 13, width: 80 }}>{v.l}</span>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", borderRadius: 4, transition: "width 0.6s" }} />
              </div>
              <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600, width: 40, textAlign: "right" }}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Ranking */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>Habit Sıralaması</h3>
        {stats.hStats.sort((a, b) => b.rate - a.rate).map((h, i) => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < stats.hStats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ color: "var(--dim)", fontSize: 12, width: 20 }}>#{i + 1}</span>
            <span style={{ color: "var(--text)", fontSize: 14, flex: 1 }}>{h.name}</span>
            <StreakFire streak={h.streak} />
            <span style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700, width: 50, textAlign: "right" }}>{h.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
