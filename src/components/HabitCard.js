"use client";
import { FREQ, CATS, today, isDue, calcStreak, calcProgress } from "@/lib/helpers";
import { ProgressRing, StreakFire, HeatmapMini, Badge } from "@/components/ui";

export default function HabitCard({ habit, onToggle }) {
  const cat = CATS.find((c) => c.v === habit.category) || CATS[8];
  const s = calcStreak(habit);
  const p = calcProgress(habit);
  const done = habit.completions?.includes(today());
  const due = isDue(habit);

  return (
    <div style={{
      background: done ? "rgba(201,169,110,0.06)" : "var(--card)",
      border: `1px solid ${done ? "rgba(201,169,110,0.2)" : "var(--border)"}`,
      borderRadius: 16, padding: "20px 22px", transition: "all 0.3s",
      opacity: !due && !done ? 0.5 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button onClick={() => due && onToggle(habit.id)} style={{
          width: 36, height: 36, borderRadius: 10,
          border: done ? "none" : "2px solid rgba(201,169,110,0.3)",
          background: done ? "var(--gold)" : "transparent",
          cursor: due ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0, color: "var(--bg)", fontWeight: 700,
          transition: "all 0.3s",
        }}>
          {done ? "✓" : ""}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15 }}>{cat.i}</span>
            <h3 style={{
              margin: 0, color: done ? "var(--gold)" : "var(--text)",
              fontSize: 16, fontFamily: "var(--serif)", fontWeight: 600,
              textDecoration: done ? "line-through" : "none",
              textDecorationColor: "rgba(201,169,110,0.3)",
            }}>{habit.name}</h3>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge>{FREQ.find((f) => f.v === habit.frequency)?.l}</Badge>
            {habit.reminderTime && <Badge color="var(--green)">⏰ {habit.reminderTime}</Badge>}
            {!due && <Badge color="var(--dim)">Bugün yok</Badge>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StreakFire streak={s} />
          <HeatmapMini completions={habit.completions} />
        </div>
        {p && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProgressRing pct={p.pct} size={50} sw={4} />
            {p.done && <span style={{ fontSize: 20 }}>🏆</span>}
          </div>
        )}
      </div>

      {habit.reward && p && !p.done && (
        <div style={{
          marginTop: 12, padding: "8px 12px", borderRadius: 8,
          background: "rgba(201,169,110,0.06)", fontSize: 12, color: "var(--sub)",
        }}>
          🎁 Ödül: <span style={{ color: "var(--gold)" }}>{habit.reward}</span>
          <span style={{ float: "right" }}>{p.cur}/{p.goal} gün</span>
        </div>
      )}

      {p?.done && habit.reward && (
        <div style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 8,
          background: "rgba(201,169,110,0.12)", fontSize: 13,
          color: "var(--gold)", fontWeight: 600, textAlign: "center",
        }}>
          🎉 Tebrikler! Ödülünü hak ettin: {habit.reward}
        </div>
      )}
    </div>
  );
}
