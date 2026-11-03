// Shared types + helpers (client-safe). DB access is in catalog.server.ts.
export type Category = { id: string; slug: string; name: string; image: string };
// One size/pack of a product. `id` is the cart + order key.
export type Variant = { id: string; label: string; price: number; mrp: number | null; packSize: string; image: string };
export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string; // cover (= images[0])
  images: string[];
  details: string;
  features: string[];
  specs: { label: string; value: string }[];
  variants: Variant[]; // always >= 1
  price: number; // cheapest variant (wholesale)
};

// Flip to false once real prices are imported; hides the "sample prices" notice.
export const PRICES_ARE_SAMPLE = true;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const hasOptions = (p: Product) => p.variants.length > 1;
export const pctOff = (price: number, mrp: number | null) => (mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
