"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("E-posta ve şifre gerekli"); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) { setError(err.message); setLoading(false); return; }
        if (data?.user?.identities?.length === 0) {
          setError("Bu e-posta zaten kayıtlı");
        } else {
          setSuccess("Kayıt başarılı! E-postanı kontrol et veya doğrudan giriş yap.");
          setMode("login");
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          if (err.message.includes("Invalid login")) setError("Hatalı e-posta veya şifre");
          else setError(err.message);
          setLoading(false);
          return;
        }
        if (data?.user) onAuth(data.user);
      }
    } catch (err) {
      setError("Bağlantı hatası. Lütfen tekrar dene.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0D0A", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 400, animation: "slideUp 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 36,
            fontWeight: 600, color: "#E8DCC8", margin: 0, letterSpacing: -1,
          }}>Habit Vault</h1>
          <p style={{ color: "#665e52", fontSize: 14, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
            Alışkanlıklarını takip et, hedeflerine ulaş
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "32px 28px",
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 22,
            fontWeight: 600, color: "#E8DCC8", margin: "0 0 24px",
          }}>
            {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
          </h2>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.2)",
              color: "#E85D5D", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)",
              color: "#7A9E7E", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}>{success}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", marginBottom: 6, color: "#998E7E",
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 1, textTransform: "uppercase",
            }}>E-posta</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com" autoComplete="email"
              style={{
                width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,169,110,0.12)", borderRadius: 12,
                color: "#E8DCC8", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block", marginBottom: 6, color: "#998E7E",
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 1, textTransform: "uppercase",
            }}>Şifre</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={{
                width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,169,110,0.12)", borderRadius: 12,
                color: "#E8DCC8", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? "rgba(201,169,110,0.5)" : "#C9A96E",
            color: "#0F0D0A", fontSize: 15, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif", cursor: loading ? "wait" : "pointer",
            transition: "all 0.2s",
          }}>
            {loading ? "..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              style={{
                background: "none", border: "none", color: "#C9A96E",
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>
              {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
