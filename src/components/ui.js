"use client";
import { useState } from "react";
import { addDays, today, fmtTR, DAYS_TR } from "@/lib/helpers";

export function ProgressRing({ pct, size = 60, sw = 5, color = "var(--gold)" }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--text)" fontSize={size * 0.22} fontFamily="var(--serif)"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{pct}%</text>
    </svg>
  );
}

export function StreakFire({ streak }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 18 }}>{streak > 0 ? "🔥" : "💤"}</span>
      <span style={{ color: streak > 0 ? "var(--gold)" : "var(--dim)", fontWeight: 600, fontSize: 14 }}>
        {streak} gün
      </span>
    </div>
  );
}

export function HeatmapMini({ completions = [], days = 28 }) {
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today(), -i);
    cells.push(
      <div key={d} title={fmtTR(d)} style={{
        width: 10, height: 10, borderRadius: 2,
        background: completions.includes(d) ? "var(--gold)" : "rgba(255,255,255,0.04)",
      }} />
    );
  }
  return <div style={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 120 }}>{cells}</div>;
}

export function Badge({ children, color = "var(--gold)" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: color === "var(--gold)" ? "rgba(201,169,110,0.1)" : color === "var(--green)" ? "rgba(122,158,126,0.1)" : "rgba(102,94,82,0.15)",
      color, fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    }}>{children}</span>
  );
}

export function Btn({ children, variant = "primary", ...props }) {
  const styles = {
    primary: { background: "var(--gold)", color: "var(--bg)", fontWeight: 700 },
    secondary: { background: "rgba(255,255,255,0.05)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.2)" },
    danger: { background: "rgba(220,50,50,0.12)", color: "var(--danger)" },
    ghost: { background: "transparent", color: "var(--sub)" },
  };
  return (
    <button {...props} style={{
      padding: "10px 20px", borderRadius: 10, border: "none", fontSize: 13,
      letterSpacing: 0.5, transition: "all 0.2s", ...styles[variant], ...(props.style || {}),
    }}>{children}</button>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: "block", marginBottom: 6, color: "var(--sub)",
          fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
        }}>{label}</label>
      )}
      {children}
    </div>
  );
}

export function DayPicker({ selected = [], onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
      {DAYS_TR.map((label, i) => {
        const active = selected.includes(i);
        return (
          <button key={i} type="button"
            onClick={() => onChange(active ? selected.filter(d => d !== i) : [...selected, i])}
            style={{
              padding: "6px 12px", borderRadius: 8,
              border: active ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.03)",
              color: active ? "var(--gold)" : "var(--dim)", fontSize: 12, fontWeight: 600,
              transition: "all 0.2s",
            }}>{label}</button>
        );
      })}
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      background: "#1A1814", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 12,
      padding: "10px 24px", color: "var(--gold)", fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "slideUp 0.3s ease", zIndex: 1001,
    }}>✓ {msg}</div>
  );
}

export function SectionCard({ title, subtitle, icon, children, actions, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 16, overflow: "hidden", marginBottom: 16,
    }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px", cursor: "pointer", userSelect: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
          <div>
            <h3 style={{ margin: 0, color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600 }}>{title}</h3>
            {subtitle && <div style={{ color: "var(--dim)", fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          <span style={{ color: "var(--dim)", fontSize: 14, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>
      {open && <div style={{ padding: "0 22px 22px" }}>{children}</div>}
    </div>
  );
}
