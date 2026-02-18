import { supabase } from "./supabase";

const LOCAL_KEY = "habit-vault-data";

function localLoad() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || null; } catch { return null; }
}

function localSave(data) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

async function cloudLoad(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("Cloud load error:", error);
      return null;
    }
    return data?.data || null;
  } catch (e) {
    console.error("Cloud load:", e);
    return null;
  }
}

async function cloudSave(userId, payload) {
  if (!supabase || !userId) return;
  try {
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) console.error("Cloud save error:", error);
  } catch (e) {
    console.error("Cloud save:", e);
  }
}

export async function loadData(userId) {
  if (userId) {
    const cloud = await cloudLoad(userId);
    if (cloud) { localSave(cloud); return cloud; }
  }
  return localLoad();
}

export async function saveData(data, userId) {
  localSave(data);
  if (userId) await cloudSave(userId, data);
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habit-vault-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const d = JSON.parse(e.target.result);
        if (d && d.habits) resolve(d);
        else reject(new Error("Invalid"));
      } catch { reject(new Error("Parse error")); }
    };
    reader.onerror = () => reject(new Error("Read error"));
    reader.readAsText(file);
  });
}
