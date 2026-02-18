"use client";
import { useState } from "react";
import { emptyHabit, FREQ, CATS } from "@/lib/helpers";
import { Btn, FormField, DayPicker } from "@/components/ui";

export default function HabitForm({ habit, onSave, onCancel, isNew }) {
  const [f, setF] = useState(habit || emptyHabit());
  const s = (k, v) => setF((x) => ({ ...x, [k]: v }));

  return (
    <div style={{
      background: isNew ? "rgba(201,169,110,0.04)" : "transparent",
      border: isNew ? "1px dashed rgba(201,169,110,0.2)" : "none",
      borderRadius: 14, padding: isNew ? 20 : 0,
    }}>
      {isNew && (
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <span style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600 }}>
            Yeni Habit Oluştur
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1/-1" }}>
          <FormField label="Habit Adı">
            <input value={f.name} onChange={(e) => s("name", e.target.value)} placeholder="örn: Cilt bakımı rutini" />
          </FormField>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <FormField label="Açıklama">
            <textarea value={f.description} onChange={(e) => s("description", e.target.value)} placeholder="Bu habit hakkında notlar..." />
          </FormField>
        </div>
        <FormField label="Kategori">
          <select value={f.category} onChange={(e) => s("category", e.target.value)}>
            {CATS.map((c) => <option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
          </select>
        </FormField>
        <FormField label="Sıklık">
          <select value={f.frequency} onChange={(e) => s("frequency", e.target.value)}>
            {FREQ.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
          </select>
        </FormField>
      </div>

      {(f.frequency === "weekly" || f.frequency === "custom") && (
        <FormField label={f.frequency === "weekly" ? "Haftanın Günleri" : "Özel Günler"}>
          <DayPicker
            selected={f.frequency === "weekly" ? f.daysOfWeek : f.customDays}
            onChange={(v) => s(f.frequency === "weekly" ? "daysOfWeek" : "customDays", v)}
          />
        </FormField>
      )}

      {f.frequency === "monthly" && (
        <FormField label="Ayın Günleri">
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const active = f.daysOfMonth?.includes(d);
              return (
                <button key={d} type="button"
                  onClick={() => s("daysOfMonth", active ? f.daysOfMonth.filter((x) => x !== d) : [...(f.daysOfMonth || []), d])}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    border: active ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.06)",
                    background: active ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.02)",
                    color: active ? "var(--gold)" : "var(--dim)", fontSize: 11,
                  }}>{d}</button>
              );
            })}
          </div>
        </FormField>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <FormField label="Hatırlatma">
          <input type="time" value={f.reminderTime} onChange={(e) => s("reminderTime", e.target.value)} />
        </FormField>
        <FormField label="Hedef (Gün)">
          <input type="number" min={1} value={f.goalDays} onChange={(e) => s("goalDays", parseInt(e.target.value) || 0)} />
        </FormField>
        <FormField label="Max Aksatma">
          <input type="number" min={0} value={f.maxMissDays} onChange={(e) => s("maxMissDays", parseInt(e.target.value) || 0)} />
        </FormField>
      </div>

      <FormField label="Ödül 🎁">
        <input value={f.reward} onChange={(e) => s("reward", e.target.value)} placeholder="Hedefe ulaşınca ne ödül vereceksin?" />
      </FormField>

      <div style={{ display: "flex", gap: 12, marginTop: 4, justifyContent: "flex-end" }}>
        {onCancel && <Btn variant="ghost" onClick={onCancel}>İptal</Btn>}
        <Btn onClick={() => { if (f.name.trim()) onSave(f); }} style={{ minWidth: 140 }}>
          {isNew ? "✦ Habit Ekle" : "Kaydet"}
        </Btn>
      </div>
    </div>
  );
}
