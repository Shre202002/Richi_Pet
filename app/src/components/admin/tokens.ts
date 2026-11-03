// Plain (non-client) constants so server and client components can both import them.
export const inp =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10";
export const card = "rounded-2xl bg-white p-4 shadow-sm";
export const btn = "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-95 disabled:opacity-50";
export const btnDark = `${btn} bg-ink text-white hover:bg-neutral-800`;
export const btnAccent = `${btn} bg-accent text-white hover:brightness-95`;
export const btnLight = `${btn} bg-neutral-100 text-ink hover:bg-neutral-200`;
export const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
