"use client";
import { useSyncExternalStore } from "react";

// false on the server and during hydration, true afterwards. Avoids flashing "empty cart"/"not found".
export const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
