export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function extractMeetingLink(text: string): string | null {
  const regex =
    /https?:\/\/(zoom\.us\/j|meet\.google\.com)\/[^\s"<>]+/i;
  const match = text.match(regex);
  return match ? match[0] : null;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateStr(d);
}

export function calculateSavings(
  stipend: number,
  expenses: number
): {
  monthly: number;
  threeMonth: number;
  sixMonth: number;
  yearly: number;
  weeklySpend: number;
} {
  const monthly = stipend - expenses;
  return {
    monthly,
    threeMonth: monthly * 3,
    sixMonth: monthly * 6,
    yearly: monthly * 12,
    weeklySpend: expenses / 4.33,
  };
}