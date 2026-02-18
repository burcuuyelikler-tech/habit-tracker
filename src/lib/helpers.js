export const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export const FREQ = [
  { v: "daily", l: "Günlük" },
  { v: "weekly", l: "Haftalık" },
  { v: "monthly", l: "Aylık" },
  { v: "custom", l: "Özel Günler" },
];

export const CATS = [
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

export const RICONS = ["🎁", "🏆", "⭐", "💎", "🎯", "🌟", "🎉", "👑", "🍰", "🛍️", "✈️", "📱", "💅", "🧖", "🎬", "📖"];

export const fmt = (d) => new Date(d).toISOString().split("T")[0];
export const today = () => fmt(new Date());
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return fmt(x);
};

export const fmtTR = (d) => {
  const x = new Date(d);
  return `${x.getDate()} ${MONTHS_TR[x.getMonth()]} ${x.getFullYear()}`;
};

export const uid = () =>
  crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);

export const isDue = (habit) => {
  const d = new Date();
  const di = (d.getDay() + 6) % 7;
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") return habit.daysOfWeek?.includes(di);
  if (habit.frequency === "monthly") return habit.daysOfMonth?.includes(d.getDate());
  if (habit.frequency === "custom") return habit.customDays?.includes(di);
  return false;
};

export const calcStreak = (h) => {
  if (!h.completions?.length) return 0;
  const sorted = [...h.completions].sort((a, b) => b.localeCompare(a));
  let count = 0;
  let check = today();
  if (sorted[0] !== check) {
    check = addDays(check, -1);
    if (sorted[0] !== check) return 0;
  }
  for (let i = 0; i < 1000; i++) {
    if (sorted.includes(check)) {
      count++;
      check = addDays(check, -1);
    } else break;
  }
  return count;
};

export const calcProgress = (h) => {
  if (!h.goalDays || h.goalDays <= 0) return null;
  const s = calcStreak(h);
  return {
    cur: s,
    goal: h.goalDays,
    pct: Math.min(100, Math.round((s / h.goalDays) * 100)),
    done: s >= h.goalDays,
  };
};

export const emptyHabit = () => ({
  id: uid(),
  name: "",
  description: "",
  category: "health",
  frequency: "daily",
  daysOfWeek: [],
  daysOfMonth: [],
  customDays: [],
  reminderTime: "09:00",
  goalDays: 30,
  maxMissDays: 2,
  reward: "",
  completions: [],
  createdAt: today(),
});

export const emptyReward = () => ({
  id: "",
  name: "",
  description: "",
  linkedHabitId: "",
  criteria: "",
  icon: "🎁",
});

export const defaultState = () => ({
  habits: [],
  rewards: [],
  settings: { notif: false },
});

export const requestNotifPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

export const scheduleNotification = (habit) => {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!habit.reminderTime || !isDue(habit)) return;
  const [h, m] = habit.reminderTime.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  const diff = target - now;
  if (diff > 0 && diff < 86400000) {
    setTimeout(() => {
      new Notification(`⏰ ${habit.name}`, {
        body: habit.description || "Bugünkü görevini tamamla!",
      });
    }, diff);
  }
};
