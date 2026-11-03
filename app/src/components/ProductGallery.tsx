"use client";
import SmartImage from "@/components/SmartImage";
import { useEffect, useRef, useState } from "react";

// Swipeable (scroll-snap) image gallery with a thumbnail strip. `focus` jumps to an image (e.g. the chosen size).
export default function ProductGallery({ images, name, focus }: { images: string[]; name: string; focus?: number }) {
  const [a, setA] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setA(i);
  };
  useEffect(() => {
    // scroll only; onScroll keeps the active thumbnail in sync
    const el = track.current;
    if (el && focus !== undefined && focus > 0) el.scrollTo({ left: focus * el.clientWidth, behavior: "smooth" });
    else if (el && focus === 0) el.scrollTo({ left: 0, behavior: "smooth" });
  }, [focus]);
  return (
    <div className="w-full">
      <div
        ref={track}
        onScroll={(e) => setA(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-auto bg-white md:rounded-2xl md:border md:border-neutral-200"
      >
        {images.map((src, i) => (
          <div key={src + i} className="relative h-full w-full shrink-0 snap-center">
            <SmartImage src={src} alt={`${name} - image ${i + 1}`} fill priority={i === 0} sizes="(min-width:1024px) 40vw, (min-width:768px) 448px, 100vw" className="object-contain p-4" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <div className="mt-2 flex justify-center gap-1.5 md:hidden" aria-hidden>
            {images.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === a ? "w-5 bg-brand" : "w-1.5 bg-neutral-300"}`} />)}
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 md:px-0">
            {images.map((src, i) => (
              <button key={src + i} onClick={() => go(i)} aria-label={`Show image ${i + 1}`} aria-current={i === a}
                className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${i === a ? "border-brand" : "border-neutral-200"}`}>
                <SmartImage src={src} alt="" fill sizes="64px" className="object-contain" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
