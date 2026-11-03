import { GridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return <main className="mx-auto w-full max-w-7xl lg:px-6 lg:py-6"><GridSkeleton n={8} /></main>;
}
