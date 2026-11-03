import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminUser } from "@/lib/auth";
import { db } from "@/lib/mongo";

export const metadata = { title: "Admin · Richi's PET Stuff" };

async function Gate({ children }: { children: React.ReactNode }) {
  const me = await adminUser();
  if (!me) redirect("/login");
  const d = await db();
  const [orders, shops] = await Promise.all([
    d.collection("orders").countDocuments({ status: "placed" }),
    d.collection("shops").countDocuments({ status: "pending" }),
  ]);
  return <AdminShell name={me.name} badges={{ orders, shops }}>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-surface text-sm text-neutral-500">Loading dashboard…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
