"use client";
import { ArrowLeft, ArrowRight, FileSpreadsheet, ImagePlus, Pencil, Plus, Search, Star, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { inr } from "@/lib/catalog";
import { btnAccent, btnDark, btnLight, card, inp } from "./tokens";
import { ConfirmBtn, Chips, Empty, Field, Sheet, useAdminApi } from "./ui";

export type AdminCategory = { id: string; name: string; sort: number };
export type AdminVariant = { id?: string; label: string; price: number; mrp: number | null; packSize: string; image: string };
export type AdminProduct = {
  id: string; categoryId: string; name: string; description: string;
  price: number; gstPercent: number; image: string; images?: string[]; variants?: AdminVariant[];
  details?: string; features?: string[]; specs?: { label: string; value: string }[]; active: boolean;
};

const imgs = (p: Partial<AdminProduct>) => (p.images?.length ? p.images : p.image ? [p.image] : []);

const blank = (categoryId: string): Partial<AdminProduct> => ({ categoryId, name: "", description: "", price: 0, variants: [{ label: "", price: 0, mrp: null, packSize: "", image: "" }], gstPercent: 0, image: "", images: [], details: "", features: [], specs: [], active: true });

export default function ProductsClient({ products, categories }: { products: AdminProduct[]; categories: AdminCategory[] }) {
  const { call, busy, toast } = useAdminApi();
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [edit, setEdit] = useState<(Partial<AdminProduct> & { isNew?: boolean }) | null>(null);
  const [catEdit, setCatEdit] = useState<(Partial<AdminCategory> & { isNew?: boolean }) | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [urlIn, setUrlIn] = useState("");
  const xl = useRef<HTMLInputElement>(null);

  const shown = useMemo(
    () => products.filter((p) => (cat === "all" || p.categoryId === cat) && (!q || `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()))),
    [products, cat, q],
  );
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit) return;
    const body = { ...edit, images: imgs(edit), isNew: undefined };
    const ok = edit.isNew ? await call("POST", "products", body, "Product added") : await call("PATCH", "products", body, "Product updated");
    if (ok) setEdit(null);
  }

  const setImgs = (images: string[]) => setEdit((x) => x && { ...x, images, image: images[0] ?? "" });
  const move = (i: number, d: number) => {
    const a = [...imgs(edit!)];
    const k = i + d;
    if (k < 0 || k >= a.length) return;
    [a[i], a[k]] = [a[k], a[i]];
    setImgs(a);
  };

  async function upload(files: FileList) {
    setUploading(true);
    setUploadErr("");
    const fd = new FormData();
    [...files].forEach((f) => fd.append("file", f));
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setUploading(false);
    if (!r.ok) return setUploadErr(j.error || "Upload failed");
    setEdit((x) => {
      if (!x) return x;
      const images = [...imgs(x), ...(j.urls as string[])].slice(0, 10);
      return { ...x, images, image: images[0] ?? "" };
    });
  }

  async function importXlsx(file: File) {
    // Columns: name, size (optional, for multi-size products), price, mrp (optional).
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer());
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
    const get = (r: Record<string, unknown>, k: string) => r[Object.keys(r).find((x) => x.trim().toLowerCase() === k) ?? ""];
    const bulk = data
      .map((r) => ({ name: String(get(r, "name") ?? ""), size: get(r, "size") === undefined ? undefined : String(get(r, "size")), price: Number(get(r, "price")), mrp: get(r, "mrp") === undefined ? undefined : Number(get(r, "mrp")) }))
      .filter((r) => r.name && Number.isFinite(r.price));
    const res = await call("POST", "products", { bulk }, `Imported ${bulk.length} rows`);
    if (res) alert(`Updated ${res.updated} of ${bulk.length} products (matched by name).`);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Catalog</h1>
        <div className="flex gap-2">
          {tab === "products" && (
            <>
              <input ref={xl} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => e.target.files?.[0] && importXlsx(e.target.files[0])} />
              <button onClick={() => xl.current?.click()} className={`${btnLight} bg-white`} title="Import prices (columns: name, size, price, mrp)"><FileSpreadsheet size={18} /><span className="hidden sm:inline">Import prices</span></button>
            </>
          )}
          <button onClick={() => (tab === "products" ? setEdit({ ...blank(cat === "all" ? categories[0]?.id : cat), isNew: true }) : setCatEdit({ name: "", sort: categories.length, isNew: true }))} className={btnAccent}>
            <Plus size={18} />Add {tab === "products" ? "product" : "category"}
          </button>
        </div>
      </div>

      <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
        {(["products", "categories"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-white" : "text-neutral-600"}`}>{t} {t === "products" ? products.length : categories.length}</button>
        ))}
      </div>

      {tab === "products" ? (
        <>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3 text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={`${inp} pl-10`} />
          </div>
          <Chips value={cat} onChange={setCat} options={[{ v: "all", label: "All" }, ...categories.map((c) => ({ v: c.id, label: c.name }))]} />
          {shown.length === 0 ? <Empty text="No products found." /> : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <li key={p.id} className={`${card} flex gap-3 ${p.active ? "" : "opacity-60"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="relative shrink-0"><img src={p.image || "/logo.png"} alt="" className="size-20 rounded-xl bg-neutral-100 object-cover" />{(p.images?.length ?? 0) > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 text-[10px] font-bold text-white">{p.images!.length} photos</span>}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="truncate text-xs text-neutral-500">{catName(p.categoryId)}{(p.variants?.length ?? 0) > 1 && ` · ${p.variants!.length} sizes`}</p>
                    <p className="mt-1 font-extrabold">{(p.variants?.length ?? 0) > 1 && <span className="mr-1 text-xs font-semibold text-neutral-500">from</span>}{inr(p.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => call("PATCH", "products", { ...p, active: !p.active }, p.active ? "Hidden from store" : "Visible in store")}
                        className={`h-7 rounded-full px-3 text-xs font-bold ${p.active ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}>{p.active ? "Active" : "Hidden"}</button>
                      <button onClick={() => setEdit(p)} className="grid size-8 place-items-center rounded-full bg-neutral-100" aria-label={`Edit ${p.name}`}><Pencil size={14} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <li key={c.id} className={`${card} flex items-center justify-between gap-3`}>
              <div><p className="font-bold">{c.name}</p><p className="text-xs text-neutral-500">{products.filter((p) => p.categoryId === c.id).length} products · order {c.sort}</p></div>
              <div className="flex gap-2">
                <button onClick={() => setCatEdit(c)} className="grid size-9 place-items-center rounded-full bg-neutral-100" aria-label={`Edit ${c.name}`}><Pencil size={15} /></button>
                <ConfirmBtn onConfirm={() => call("DELETE", "categories", c.id, "Category deleted")} className="!h-9 !px-3 text-xs" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {edit && (
        <Sheet title={edit.isNew ? "Add product" : "Edit product"} onClose={() => setEdit(null)}>
          <form onSubmit={saveProduct} className="space-y-3">
            <Field label="Name"><input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inp} /></Field>
            <Field label="Category">
              <select required value={edit.categoryId} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })} className={inp}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Description"><textarea rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className={`${inp} h-auto py-2`} /></Field>
            <Field label="Sizes & prices (each size has its own price - shown like Blinkit options)">
              <div className="space-y-2">
                {(edit.variants ?? []).map((v, i) => {
                  const set = (patch: Partial<AdminVariant>) => setEdit({ ...edit, variants: (edit.variants ?? []).map((x, k) => (k === i ? { ...x, ...patch } : x)) });
                  const many = (edit.variants?.length ?? 0) > 1;
                  return (
                    <div key={v.id ?? i} className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex gap-2">
                        <input value={v.label} onChange={(e) => set({ label: e.target.value })} placeholder={many ? 'Size, e.g. 1"' : "Size (optional)"} required={many} className={inp} />
                        {many && <button type="button" aria-label="Remove size" onClick={() => setEdit({ ...edit, variants: (edit.variants ?? []).filter((_, k) => k !== i) })} className="grid size-11 shrink-0 place-items-center rounded-xl bg-white"><X size={16} /></button>}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input required type="number" min={0} step="0.01" inputMode="decimal" value={v.price} onChange={(e) => set({ price: Number(e.target.value) })} placeholder="Price" aria-label="Wholesale price" className={inp} />
                        <input type="number" min={0} step="0.01" inputMode="decimal" value={v.mrp ?? ""} onChange={(e) => set({ mrp: e.target.value === "" ? null : Number(e.target.value) })} placeholder="MRP" aria-label="MRP" className={inp} />
                        <input value={v.packSize} onChange={(e) => set({ packSize: e.target.value })} placeholder="Pack" aria-label="Pack size" className={inp} />
                      </div>
                      <select value={v.image} onChange={(e) => set({ image: e.target.value })} aria-label="Picture for this size" className={inp}>
                        <option value="">Picture: use cover image</option>
                        {imgs(edit).map((src, k) => <option key={src + k} value={src}>Picture {k + 1}</option>)}
                      </select>
                    </div>
                  );
                })}
                <button type="button" onClick={() => setEdit({ ...edit, variants: [...(edit.variants ?? []), { label: "", price: edit.variants?.[0]?.price ?? 0, mrp: null, packSize: "", image: "" }] })} className={`${btnLight} h-9 px-4`}><Plus size={14} />Add another size</button>
              </div>
            </Field>
            <Field label="GST %"><input type="number" min={0} max={100} step="0.1" inputMode="decimal" value={edit.gstPercent} onChange={(e) => setEdit({ ...edit, gstPercent: Number(e.target.value) })} className={inp} /></Field>
            <Field label={`Images (${imgs(edit).length}/10) - first is the cover`}>
              <div className="space-y-2">
                {imgs(edit).length > 0 && (
                  <ul className="grid grid-cols-3 gap-2">
                    {imgs(edit).map((src, i) => (
                      <li key={src + i} className={`relative overflow-hidden rounded-xl border-2 bg-neutral-50 ${i === 0 ? "border-accent" : "border-transparent"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="aspect-square w-full object-cover" />
                        {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>}
                        <button type="button" onClick={() => setImgs(imgs(edit).filter((_, k) => k !== i))} aria-label="Remove image" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"><X size={14} /></button>
                        <div className="flex justify-between bg-white/90 px-1 py-0.5">
                          <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left" className="grid size-6 place-items-center disabled:opacity-30"><ArrowLeft size={14} /></button>
                          {i > 0 && <button type="button" onClick={() => move(i, -i)} aria-label="Make cover" className="grid size-6 place-items-center"><Star size={14} /></button>}
                          <button type="button" disabled={i === imgs(edit).length - 1} onClick={() => move(i, 1)} aria-label="Move right" className="grid size-6 place-items-center disabled:opacity-30"><ArrowRight size={14} /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <label className={`${btnLight} cursor-pointer`}><ImagePlus size={16} />{uploading ? "Uploading..." : "Upload images (select many)"}
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
                </label>
                <div className="flex gap-2">
                  <input value={urlIn} onChange={(e) => setUrlIn(e.target.value)} placeholder="...or paste an image URL" className={inp} />
                  <button type="button" onClick={() => { if (urlIn.trim()) { setImgs([...imgs(edit), urlIn.trim()].slice(0, 10)); setUrlIn(""); } }} className={`${btnLight} shrink-0`}>Add</button>
                </div>
                {uploadErr && <p className="text-xs text-red-600">{uploadErr}</p>}
              </div>
            </Field>
            <Field label="Full details (shown on the product page)"><textarea rows={4} value={edit.details ?? ""} onChange={(e) => setEdit({ ...edit, details: e.target.value })} className={`${inp} h-auto py-2`} /></Field>
            <Field label="Key features">
              <div className="space-y-2">
                {(edit.features ?? []).map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={f} onChange={(e) => setEdit({ ...edit, features: (edit.features ?? []).map((x, k) => (k === i ? e.target.value : x)) })} className={inp} placeholder="e.g. Heavy duty D-ring" />
                    <button type="button" aria-label="Remove feature" onClick={() => setEdit({ ...edit, features: (edit.features ?? []).filter((_, k) => k !== i) })} className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-100"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEdit({ ...edit, features: [...(edit.features ?? []), ""] })} className={`${btnLight} h-9 px-4`}><Plus size={14} />Add feature</button>
              </div>
            </Field>
            <Field label="Specifications">
              <div className="space-y-2">
                {(edit.specs ?? []).map((sp, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={sp.label} onChange={(e) => setEdit({ ...edit, specs: (edit.specs ?? []).map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} className={inp} placeholder="Material" />
                    <input value={sp.value} onChange={(e) => setEdit({ ...edit, specs: (edit.specs ?? []).map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} className={inp} placeholder="Nylon" />
                    <button type="button" aria-label="Remove spec" onClick={() => setEdit({ ...edit, specs: (edit.specs ?? []).filter((_, k) => k !== i) })} className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-100"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEdit({ ...edit, specs: [...(edit.specs ?? []), { label: "", value: "" }] })} className={`${btnLight} h-9 px-4`}><Plus size={14} />Add specification</button>
              </div>
            </Field>
            <label className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 text-sm font-semibold">
              <input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} className="size-5 accent-[var(--color-accent)]" />
              Visible in the shop
            </label>
            <div className="flex gap-2 pt-2">
              {!edit.isNew && <ConfirmBtn label="Delete" onConfirm={async () => (await call("DELETE", "products", edit.id, "Product deleted")) && setEdit(null)} />}
              <button disabled={busy} className={`${btnDark} flex-1`}>{edit.isNew ? "Add product" : "Save changes"}</button>
            </div>
          </form>
        </Sheet>
      )}

      {catEdit && (
        <Sheet title={catEdit.isNew ? "Add category" : "Edit category"} onClose={() => setCatEdit(null)}>
          <form onSubmit={async (e) => { e.preventDefault(); if (await call(catEdit.isNew ? "POST" : "PATCH", "categories", catEdit, "Category saved")) setCatEdit(null); }} className="space-y-3">
            <Field label="Name"><input required value={catEdit.name} onChange={(e) => setCatEdit({ ...catEdit, name: e.target.value })} className={inp} /></Field>
            <Field label="Display order (lower shows first)"><input type="number" min={0} value={catEdit.sort} onChange={(e) => setCatEdit({ ...catEdit, sort: Number(e.target.value) })} className={inp} /></Field>
            <button disabled={busy} className={`${btnDark} w-full`}>Save</button>
          </form>
        </Sheet>
      )}
      {toast}
    </div>
  );
}
