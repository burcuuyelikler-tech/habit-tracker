"use client";
import { useState } from "react";
import { FREQ, CATS, RICONS, calcStreak, calcProgress, fmtTR, uid, emptyReward, defaultState } from "@/lib/helpers";
import { exportData, importData } from "@/lib/storage";
import { Btn, Badge, HeatmapMini, Toast, FormField } from "@/components/ui";
import HabitForm from "@/components/HabitForm";

export default function ManageView({ data, setData, saveH, delH }) {
  const [sub, setSub] = useState("habits");
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showNewR, setShowNewR] = useState(false);
  const [editRId, setEditRId] = useState(null);
  const [rForm, setRForm] = useState(emptyReward());
  const [toast, setToast] = useState(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const saveR = (r) => {
    const rr = { ...r, id: r.id || uid() };
    setData((p) => {
      const ex = p.rewards?.find((x) => x.id === rr.id);
      return { ...p, rewards: ex ? p.rewards.map((x) => x.id === rr.id ? rr : x) : [...(p.rewards || []), rr] };
    });
    setShowNewR(false); setEditRId(null); flash("Ödül kaydedildi");
  };

  const delR = (id) => {
    if (confirm("Bu ödülü silmek istediğinize emin misiniz?")) {
      setData((p) => ({ ...p, rewards: (p.rewards || []).filter((r) => r.id !== id) }));
      flash("Ödül silindi");
    }
  };

  const RewardForm = ({ reward, onSave, onCancel }) => {
    const [f, setF] = useState(reward);
    return (
      <div style={{ background: "rgba(201,169,110,0.04)", border: "1px dashed rgba(201,169,110,0.2)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{f.icon}</span>
          <span style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600 }}>{f.id ? "Ödül Düzenle" : "Yeni Ödül"}</span>
        </div>
        <FormField label="İkon">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RICONS.map((ic) => (
              <button key={ic} type="button" onClick={() => setF((r) => ({ ...r, icon: ic }))} style={{
                width: 36, height: 36, borderRadius: 8,
                border: f.icon === ic ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.06)",
                background: f.icon === ic ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.02)",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{ic}</button>
            ))}
          </div>
        </FormField>
        <FormField label="Ödül Adı"><input value={f.name} onChange={(e) => setF((r) => ({ ...r, name: e.target.value }))} placeholder="örn: Yeni cilt bakım seti" /></FormField>
        <FormField label="Açıklama"><textarea value={f.description} onChange={(e) => setF((r) => ({ ...r, description: e.target.value }))} placeholder="Notlar..." /></FormField>
        <FormField label="Bağlı Habit">
          <select value={f.linkedHabitId} onChange={(e) => setF((r) => ({ ...r, linkedHabitId: e.target.value }))}>
            <option value="">— Habit seçin —</option>
            {data.habits.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </FormField>
        <FormField label="Başarı Kriteri"><input value={f.criteria} onChange={(e) => setF((r) => ({ ...r, criteria: e.target.value }))} placeholder="örn: 30 gün kesintisiz" /></FormField>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>İptal</Btn>
          <Btn onClick={() => { if (f.name.trim()) onSave(f); }}>🎁 Kaydet</Btn>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "var(--card)", borderRadius: 12, padding: 4, border: "1px solid var(--border)" }}>
        {[{ id: "habits", l: "Habitler", ic: "◎", n: data.habits.length }, { id: "rewards", l: "Ödüller", ic: "🎁", n: (data.rewards || []).length }, { id: "settings", l: "Ayarlar", ic: "⚙" }].map((t) => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 9, border: "none",
            background: sub === t.id ? "var(--gold-dim)" : "transparent",
            color: sub === t.id ? "var(--gold)" : "var(--dim)",
            fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span>{t.ic}</span><span>{t.l}</span>
            {t.n !== undefined && <span style={{ background: sub === t.id ? "rgba(201,169,110,0.2)" : "rgba(255,255,255,0.06)", padding: "1px 7px", borderRadius: 10, fontSize: 11 }}>{t.n}</span>}
          </button>
        ))}
      </div>

      {/* HABITS */}
      {sub === "habits" && (
        <div>
          {!showNew && (
            <button onClick={() => { setShowNew(true); setEditId(null); }} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "2px dashed rgba(201,169,110,0.2)",
              background: "rgba(201,169,110,0.03)", color: "var(--gold)", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20,
            }}><span style={{ fontSize: 20 }}>+</span> Yeni Habit Ekle</button>
          )}
          {showNew && (
            <div style={{ marginBottom: 20 }}>
              <HabitForm isNew onSave={(h) => { saveH(h); setShowNew(false); flash("Habit eklendi"); }} onCancel={() => setShowNew(false)} />
            </div>
          )}
          {data.habits.length === 0 && !showNew && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--dim)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✦</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--sub)" }}>Henüz habit yok</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Yukarıdan ilk habit'ini ekle</div>
            </div>
          )}
          {data.habits.map((h) => {
            const cat = CATS.find((c) => c.v === h.category) || CATS[8];
            const s = calcStreak(h), p = calcProgress(h), isE = editId === h.id;
            return (
              <div key={h.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{cat.i}</span>
                    <div>
                      <h3 style={{ margin: 0, color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600 }}>{h.name}</h3>
                      <div style={{ color: "var(--dim)", fontSize: 12, marginTop: 2 }}>{FREQ.find((f) => f.v === h.frequency)?.l} · 🔥 {s} gün · {h.completions?.length || 0} toplam</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setEditId(isE ? null : h.id)} style={{
                      background: isE ? "var(--gold-dim)" : "rgba(255,255,255,0.04)", border: "none", borderRadius: 8,
                      padding: "5px 10px", color: isE ? "var(--gold)" : "var(--sub)", fontSize: 12,
                    }}>{isE ? "✕ Kapat" : "✎ Düzenle"}</button>
                    <button onClick={() => { delH(h.id); flash("Habit silindi"); }} style={{
                      background: "rgba(220,50,50,0.08)", border: "none", borderRadius: 8,
                      padding: "5px 10px", color: "var(--danger)", fontSize: 12,
                    }}>🗑</button>
                  </div>
                </div>
                <div style={{ padding: "0 22px 22px" }}>
                  {isE ? (
                    <HabitForm habit={h} onSave={(x) => { saveH(x); setEditId(null); flash("Güncellendi"); }} onCancel={() => setEditId(null)} />
                  ) : (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 14 }}>
                        {[
                          { l: "Kategori", v: `${cat.i} ${cat.l}` },
                          { l: "Hatırlatma", v: h.reminderTime || "Yok" },
                          { l: "Hedef", v: `${h.goalDays} gün` },
                          { l: "Max Aksatma", v: `${h.maxMissDays ?? 2} gün` },
                          { l: "Başlangıç", v: fmtTR(h.createdAt) },
                        ].map((x, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ color: "var(--dim)", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{x.l}</div>
                            <div style={{ color: "var(--text)", fontSize: 13 }}>{x.v}</div>
                          </div>
                        ))}
                      </div>
                      {p && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "var(--sub)", fontSize: 12 }}>İlerleme</span>
                            <span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700 }}>{p.cur}/{p.goal} gün</span>
                          </div>
                          <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${p.pct}%`, height: "100%", background: p.done ? "linear-gradient(90deg,#C9A96E,#E8D5A8)" : "var(--gold)", borderRadius: 4, transition: "width 0.6s" }} />
                          </div>
                          {p.done && <div style={{ color: "var(--gold)", fontSize: 12, marginTop: 6, fontWeight: 600 }}>🏆 Hedef tamamlandı!</div>}
                        </div>
                      )}
                      {h.reward && (
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: p?.done ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${p?.done ? "rgba(201,169,110,0.2)" : "var(--border)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{p?.done ? "🎉" : "🎁"}</span>
                          <div>
                            <div style={{ color: "var(--dim)", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Ödül</div>
                            <div style={{ color: p?.done ? "var(--gold)" : "var(--text)", fontSize: 13 }}>{h.reward}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ color: "var(--dim)", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Son 28 gün</div>
                        <HeatmapMini completions={h.completions} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REWARDS */}
      {sub === "rewards" && (
        <div>
          <p style={{ color: "var(--sub)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            Habit'lerine bağlı veya bağımsız ödüller tanımla. Hedefe ulaştığında kendini ödüllendir.
          </p>
          {!showNewR && (
            <button onClick={() => setShowNewR(true)} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "2px dashed rgba(201,169,110,0.2)",
              background: "rgba(201,169,110,0.03)", color: "var(--gold)", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20,
            }}><span style={{ fontSize: 20 }}>+</span> Yeni Ödül Tanımla</button>
          )}
          {showNewR && <RewardForm reward={emptyReward()} onSave={saveR} onCancel={() => setShowNewR(false)} />}
          {(data.rewards || []).length === 0 && !showNewR && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--dim)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--sub)" }}>Henüz ödül yok</div>
            </div>
          )}
          {(data.rewards || []).map((rw) => {
            const lh = data.habits.find((x) => x.id === rw.linkedHabitId);
            const p = lh ? calcProgress(lh) : null;
            const isE = editRId === rw.id;
            return (
              <div key={rw.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                {isE ? <RewardForm reward={rw} onSave={saveR} onCancel={() => setEditRId(null)} /> : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{rw.icon || "🎁"}</span>
                        <div>
                          <h4 style={{ margin: 0, color: "var(--text)", fontFamily: "var(--serif)", fontSize: 17, fontWeight: 600 }}>{rw.name}</h4>
                          {rw.description && <div style={{ color: "var(--sub)", fontSize: 12, marginTop: 2 }}>{rw.description}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setEditRId(rw.id)} style={{ background: "rgba(255,255,255,0.04)", border: "none", borderRadius: 8, padding: "5px 10px", color: "var(--sub)", fontSize: 12 }}>✎</button>
                        <button onClick={() => delR(rw.id)} style={{ background: "rgba(220,50,50,0.08)", border: "none", borderRadius: 8, padding: "5px 10px", color: "var(--danger)", fontSize: 12 }}>🗑</button>
                      </div>
                    </div>
                    {lh && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}><Badge>🔗 {lh.name}</Badge>{rw.criteria && <Badge color="var(--green)">{rw.criteria}</Badge>}</div>
                        {p && (
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${p.pct}%`, height: "100%", background: p.done ? "var(--gold)" : "rgba(201,169,110,0.5)", borderRadius: 3, transition: "width 0.6s" }} />
                            </div>
                            <span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700 }}>{p.pct}%</span>
                            {p.done && <span style={{ fontSize: 16 }}>✅</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SETTINGS */}
      {sub === "settings" && (
        <div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>🔔 Bildirimler</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "var(--text)", fontSize: 14 }}>Push Bildirimleri</div>
                <div style={{ color: "var(--dim)", fontSize: 12 }}>Tarayıcı hatırlatmaları</div>
              </div>
              <button onClick={() => setData((p) => ({ ...p, settings: { ...p.settings, notif: !p.settings?.notif } }))} style={{
                width: 48, height: 28, borderRadius: 14, border: "none",
                background: data.settings?.notif ? "var(--gold)" : "rgba(255,255,255,0.1)",
                position: "relative", transition: "background 0.3s",
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute", top: 3, left: data.settings?.notif ? 23 : 3, transition: "left 0.3s" }} />
              </button>
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>💾 Veri Yönetimi</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn variant="secondary" onClick={() => { exportData(data); flash("Dışa aktarıldı"); }} style={{ width: "100%" }}>📤 Dışa Aktar (JSON)</Btn>
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.05)", color: "var(--gold)",
                border: "1px solid rgba(201,169,110,0.2)", fontSize: 13, fontWeight: 600,
              }}>
                📥 İçe Aktar
                <input type="file" accept=".json" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try { const d = await importData(file); setData(d); flash("İçe aktarıldı"); }
                  catch { flash("Geçersiz dosya"); }
                }} />
              </label>
              <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
              <Btn variant="danger" onClick={() => {
                if (confirm("TÜM verileri silmek istediğinize emin misiniz?")) {
                  setData(defaultState());
                  flash("Sıfırlandı");
                }
              }} style={{ width: "100%" }}>🗑 Tüm Verileri Sıfırla</Btn>
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 18 }}>📊 İstatistikler</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "Toplam Habit", v: data.habits.length },
                { l: "Toplam Ödül", v: (data.rewards || []).length },
                { l: "Tamamlama", v: data.habits.reduce((s, h) => s + (h.completions?.length || 0), 0) },
                { l: "En Uzun Seri", v: `${Math.max(0, ...data.habits.map(calcStreak))} gün` },
              ].map((x, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ color: "var(--gold)", fontSize: 22, fontFamily: "var(--serif)", fontWeight: 700 }}>{x.v}</div>
                  <div style={{ color: "var(--dim)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Toast msg={toast} />
    </div>
  );
}
