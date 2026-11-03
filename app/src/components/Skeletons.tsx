// Skeleton loading states for the storefront (shown while server data streams in).
const bar = "animate-pulse rounded-md bg-neutral-200";

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-2" aria-hidden>
      <div className={`${bar} aspect-square rounded-xl`} />
      <div className={`${bar} mt-4 h-4 w-14`} />
      <div className={`${bar} mt-2 h-4 w-full`} />
      <div className={`${bar} mt-1.5 h-4 w-2/3`} />
      <div className={`${bar} mt-2 h-5 w-16`} />
    </div>
  );
}

export function GridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-2.5 p-2.5 md:grid-cols-3 md:gap-3 md:p-3 lg:grid-cols-4 lg:gap-4 lg:p-0">
      {Array.from({ length: n }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 pb-6" role="status" aria-label="Loading">
      <div className={`${bar} mx-4 mt-4 h-32 rounded-2xl md:mx-6`} />
      <div className="grid grid-cols-3 gap-3 px-4 md:grid-cols-4 md:px-6 lg:grid-cols-7">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className={`${bar} aspect-square rounded-2xl`} />)}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-hidden px-4 md:px-6">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="w-[44%] shrink-0 sm:w-[30%] md:w-[23%]"><CardSkeleton /></div>)}
      </div>
    </main>
  );
}

export function ProductSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl lg:grid lg:grid-cols-2 lg:gap-10 lg:px-6 lg:pt-6" role="status" aria-label="Loading product">
      <div className={`${bar} aspect-square w-full rounded-none md:rounded-2xl`} />
      <div className="space-y-3 p-4 lg:p-0">
        <div className={`${bar} h-4 w-24`} />
        <div className={`${bar} h-8 w-3/4`} />
        <div className={`${bar} h-4 w-full`} />
        <div className="flex gap-2 pt-2">{[0, 1, 2].map((i) => <div key={i} className={`${bar} h-12 w-20 rounded-xl`} />)}</div>
        <div className={`${bar} h-10 w-32`} />
        <div className={`${bar} h-12 w-full max-w-xs rounded-lg`} />
      </div>
    </main>
  );
}

export function ListSkeleton() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-3 p-4" role="status" aria-label="Loading">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className={`${bar} h-24 rounded-2xl`} />)}
    </main>
  );
}
