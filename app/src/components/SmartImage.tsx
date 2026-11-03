"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// next/image (lazy by default, only `priority` loads eagerly) + a shimmering skeleton until the picture has loaded.
// Parent must be `relative` with a size, like any `fill` image.
export default function SmartImage({ className = "", onLoad, onError, alt, ...props }: ImageProps) {
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  return (
    <>
      {state === "loading" && <span aria-hidden className="absolute inset-0 animate-pulse bg-neutral-200" />}
      <Image
        {...props}
        alt={alt}
        loading={props.priority ? undefined : "lazy"}
        className={`${className} transition-opacity duration-300 ${state === "done" ? "opacity-100" : "opacity-0"}`}
        onLoad={(e) => {
          setState("done");
          onLoad?.(e);
        }}
        onError={(e) => {
          setState("error"); // keep the grey box instead of a broken-image icon
          onError?.(e);
        }}
      />
    </>
  );
}
