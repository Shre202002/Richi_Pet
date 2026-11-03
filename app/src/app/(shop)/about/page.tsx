import { Clock, ExternalLink, Globe, Handshake, Heart, Mail, MapPin, Package, Phone, ShieldCheck, Store } from "lucide-react";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "About | Richi's PET Stuff" };

// Content from the client's WhatsApp Business profile.
const ADDRESS = "Mhada Colony Road, Sant Dnyaneshwar Nagar, Pimpri Chinchwad 411018, Maharashtra, India";
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

const VALUES = [
  { Icon: ShieldCheck, t: "Quality", d: "Pet essentials, treats, chew sticks, toys & accessories you can trust." },
  { Icon: Heart, t: "Care", d: "Where quality meets care, for your beloved pets." },
  { Icon: Handshake, t: "Trust", d: "Premium pet products with dependable service." },
];
const OFFERS = [
  { Icon: Store, t: "Retail & wholesale enquiries" },
  { Icon: Package, t: "Bulk orders welcome" },
  { Icon: Globe, t: "Serving pet lovers & businesses across India" },
];

export default function AboutPage() {
  const row = "flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4";
  return (
    <>
      <PageHeader title="About us" />
      <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6 lg:py-10">
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-ink p-6 text-center text-white md:flex-row md:text-left">
          <Logo size={120} />
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">Richi&apos;s PET Stuff®</h1>
            <p className="mt-1 font-semibold text-brand-logo">Premium Pet Products | Quality You Can Trust</p>
            <p className="mt-3 text-white/80">
              Discover quality pet essentials, treats, chew sticks, toys &amp; accessories for your beloved pets.
            </p>
          </div>
        </section>

        <section aria-label="Our values" className="grid gap-3 md:grid-cols-3">
          {VALUES.map(({ Icon, t, d }) => (
            <div key={t} className={row}>
              <Icon className="mt-0.5 shrink-0 text-brand" size={24} aria-hidden />
              <div><h2 className="font-extrabold">{t}</h2><p className="text-sm text-neutral-600">{d}</p></div>
            </div>
          ))}
        </section>

        <section aria-label="What we offer" className="grid gap-3 md:grid-cols-3">
          {OFFERS.map(({ Icon, t }) => (
            <div key={t} className={`${row} items-center`}>
              <Icon className="shrink-0 text-brand" size={24} aria-hidden />
              <p className="font-semibold">{t}</p>
            </div>
          ))}
        </section>

        <section aria-label="Contact" className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-extrabold">Visit or contact us</h2>
          <p className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-brand" size={20} aria-hidden /><span>{ADDRESS}</span></p>
          <p className="flex gap-3"><Clock className="shrink-0 text-brand" size={20} aria-hidden /><span>Tuesday: 11:00 – 18:00</span></p>
          <p className="flex gap-3"><Phone className="shrink-0 text-brand" size={20} aria-hidden /><a href="tel:+917275788799" className="font-semibold underline">+91 72757 88799</a></p>
          <p className="flex gap-3"><Mail className="shrink-0 text-brand" size={20} aria-hidden /><a href="mailto:risshabhgupta@gmail.com" className="break-all font-semibold underline">risshabhgupta@gmail.com</a></p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-bold text-white hover:bg-brand-dark">
              <MapPin size={18} aria-hidden /> Open in Google Maps
            </a>
            <a href="https://linktr.ee/Richispetstuff" target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 font-bold">
              <ExternalLink size={18} aria-hidden /> More links
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
