"use client";
import { Check, KeyRound, Pencil, Plus, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { inr } from "@/lib/catalog";
import { btnAccent, btnDark, btnLight, card, inp } from "./tokens";
import { Badge, Chips, ConfirmBtn, Empty, Field, Sheet, useAdminApi } from "./ui";

export type AdminUser = { id: string; name: string; email: string; phone: string; role: "admin" | "salesperson" | "shop" };
export type AdminShop = {
  id: string; name: string; gstin: string | null; address: string; phone: string; status: "pending" | "approved" | "blocked";
  salespersonId: string | null; owner: { name: string; email: string } | null; orders: number; outstanding: number;
};

type ShopForm = { id?: string; shop: string; owner: string; phone: string; email: string; password: string; gstin: string; address: string; status: string; salespersonId: string };
type UserForm = { id?: string; name: string; email: string; phone: string; password: string; role: string };

export default function ShopsClient({ shops, team }: { shops: AdminShop[]; team: AdminUser[] }) {
  const { call, busy, toast } = useAdminApi();
  const [tab, setTab] = useState<"shops" | "team">("shops");
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");
  const [shopForm, setShopForm] = useState<ShopForm | null>(null);
  const [userForm, setUserForm] = useState<UserForm | null>(null);
  const reps = team.filter((t) => t.role === "salesperson");

  const shown = useMemo(
    () => shops.filter((s) => (f === "all" || s.status === f) && (!q || `${s.name} ${s.phone} ${s.owner?.name} ${s.owner?.email}`.toLowerCase().includes(q.toLowerCase()))),
    [shops, f, q],
  );
  const n = (s: string) => shops.filter((x) => x.status === s).length;

  const newShop = (): ShopForm => ({ shop: "", owner: "", phone: "", email: "", password: "", gstin: "", address: "", status: "approved", salespersonId: "" });
  const editShop = (s: AdminShop): ShopForm => ({
    id: s.id, shop: s.name, owner: s.owner?.name ?? "", phone: s.phone, email: s.owner?.email ?? "", password: "",
    gstin: s.gstin ?? "", address: s.address, status: s.status, salespersonId: s.salespersonId ?? "",
  });

  async function saveShop(e: React.FormEvent) {
    e.preventDefault();
    if (!shopForm) return;
    const body = { ...shopForm, password: shopForm.password || undefined };
    if (await call(shopForm.id ? "PATCH" : "POST", "shops", body, shopForm.id ? "Shop updated" : "Shop added")) setShopForm(null);
  }
  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!userForm) return;
    const body = { ...userForm, password: userForm.password || undefined };
    if (await call(userForm.id ? "PATCH" : "POST", "users", body, userForm.id ? "User updated" : "User added")) setUserForm(null);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Shops &amp; team</h1>
        <button onClick={() => (tab === "shops" ? setShopForm(newShop()) : setUserForm({ name: "", email: "", phone: "", password: "", role: "salesperson" }))} className={btnAccent}>
          <Plus size={18} />{tab === "shops" ? "Add shop" : "Add user"}
        </button>
      </div>
      <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
        {(["shops", "team"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-white" : "text-neutral-600"}`}>{t === "team" ? "Team & sellers" : "Shop keepers"}</button>
        ))}
      </div>

      {tab === "shops" ? (
        <>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3 text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shop, owner, phone or email" className={`${inp} pl-10`} />
          </div>
          <Chips value={f} onChange={setF} options={[
            { v: "all", label: "All", n: shops.length }, { v: "pending", label: "Pending", n: n("pending") },
            { v: "approved", label: "Approved", n: n("approved") }, { v: "blocked", label: "Blocked", n: n("blocked") },
          ]} />
          {shown.length === 0 ? <Empty text="No shops found." /> : (
            <ul className="grid gap-3 md:grid-cols-2">
              {shown.map((s) => (
                <li key={s.id} className={card}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{s.name}</p>
                      <p className="truncate text-xs text-neutral-500">{s.owner?.name} · {s.phone}</p>
                      <p className="truncate text-xs text-neutral-500">{s.owner?.email}</p>
                    </div>
                    <Badge s={s.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>{s.orders} orders</span>
                    <span className={s.outstanding > 0 ? "font-bold text-accent" : ""}>Due {inr(s.outstanding)}</span>
                    <span>{reps.find((r) => r.id === s.salespersonId)?.name ?? "No rep"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {s.status !== "approved" && <button disabled={busy} onClick={() => call("PATCH", "shops", { ...editShop(s), status: "approved", password: undefined }, "Shop approved")} className={`${btnDark} h-10 flex-1`}><Check size={16} />Approve</button>}
                    {s.status === "approved" && <button disabled={busy} onClick={() => call("PATCH", "shops", { ...editShop(s), status: "blocked", password: undefined }, "Shop blocked")} className={`${btnLight} h-10 flex-1`}>Block</button>}
                    <button onClick={() => setShopForm(editShop(s))} className={`${btnLight} h-10 flex-1`}><Pencil size={15} />Edit</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {team.map((t) => (
            <li key={t.id} className={`${card} flex items-center gap-3`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"><UserRound size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{t.name}</p>
                <p className="truncate text-xs text-neutral-500">{t.email}{t.phone && ` · ${t.phone}`}</p>
                <div className="mt-1 flex items-center gap-2"><Badge s={t.role} /><span className="text-xs text-neutral-500">{t.role === "salesperson" ? `${shops.filter((s) => s.salespersonId === t.id).length} shops` : ""}</span></div>
              </div>
              <button onClick={() => setUserForm({ id: t.id, name: t.name, email: t.email, phone: t.phone ?? "", password: "", role: t.role })} className="grid size-10 place-items-center rounded-full bg-neutral-100" aria-label={`Edit ${t.name}`}><Pencil size={16} /></button>
            </li>
          ))}
        </ul>
      )}

      {shopForm && (
        <Sheet title={shopForm.id ? "Edit shop" : "Add shop keeper"} onClose={() => setShopForm(null)}>
          <form onSubmit={saveShop} className="space-y-3">
            <Field label="Shop name"><input required value={shopForm.shop} onChange={(e) => setShopForm({ ...shopForm, shop: e.target.value })} className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Owner name"><input required value={shopForm.owner} onChange={(e) => setShopForm({ ...shopForm, owner: e.target.value })} className={inp} /></Field>
              <Field label="Phone"><input required type="tel" inputMode="tel" value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} className={inp} /></Field>
            </div>
            <Field label="Login email"><input required type="email" value={shopForm.email} onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })} className={inp} /></Field>
            <Field label={shopForm.id ? "New password (leave blank to keep)" : "Password (8+ chars)"}>
              <div className="relative"><KeyRound size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
                <input required={!shopForm.id} minLength={8} type="text" autoComplete="off" value={shopForm.password} onChange={(e) => setShopForm({ ...shopForm, password: e.target.value })} className={`${inp} pl-10`} /></div>
            </Field>
            <Field label="GSTIN (optional)"><input value={shopForm.gstin} onChange={(e) => setShopForm({ ...shopForm, gstin: e.target.value })} className={inp} /></Field>
            <Field label="Address"><textarea rows={2} value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} className={`${inp} h-auto py-2`} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={shopForm.status} onChange={(e) => setShopForm({ ...shopForm, status: e.target.value })} className={inp}>
                  <option value="approved">Approved</option><option value="pending">Pending</option><option value="blocked">Blocked</option>
                </select>
              </Field>
              <Field label="Salesperson">
                <select value={shopForm.salespersonId} onChange={(e) => setShopForm({ ...shopForm, salespersonId: e.target.value })} className={inp}>
                  <option value="">None</option>{reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex gap-2 pt-2">
              {shopForm.id && <ConfirmBtn onConfirm={async () => (await call("DELETE", "shops", shopForm.id, "Shop deleted")) && setShopForm(null)} />}
              <button disabled={busy} className={`${btnDark} flex-1`}>{shopForm.id ? "Save changes" : "Add shop"}</button>
            </div>
          </form>
        </Sheet>
      )}

      {userForm && (
        <Sheet title={userForm.id ? "Edit user" : "Add user"} onClose={() => setUserForm(null)}>
          <form onSubmit={saveUser} className="space-y-3">
            <Field label="Name"><input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className={inp} /></Field>
            <Field label="Email"><input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className={inp} /></Field>
              <Field label="Role">
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={inp}>
                  <option value="salesperson">Salesperson</option><option value="admin">Admin</option>
                </select>
              </Field>
            </div>
            <Field label={userForm.id ? "New password (leave blank to keep)" : "Password (8+ chars)"}>
              <input required={!userForm.id} minLength={8} type="text" autoComplete="off" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className={inp} />
            </Field>
            <div className="flex gap-2 pt-2">
              {userForm.id && <ConfirmBtn onConfirm={async () => (await call("DELETE", "users", userForm.id, "User deleted")) && setUserForm(null)} />}
              <button disabled={busy} className={`${btnDark} flex-1`}>{userForm.id ? "Save changes" : "Add user"}</button>
            </div>
          </form>
        </Sheet>
      )}
      {toast}
    </div>
  );
}
