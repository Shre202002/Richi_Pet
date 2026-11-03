export default function Loading() {
  return (
    <div className="space-y-4 pt-4" aria-busy>
      <div className="h-8 w-48 animate-pulse rounded-xl bg-neutral-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-200" />)}
      </div>
    </div>
  );
}
