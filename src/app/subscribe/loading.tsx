import { Skeleton } from "@/components/ui/skeleton";

export default function SubscribeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20">
      <Skeleton className="mb-4 h-6 w-32" />
      <Skeleton className="h-10 w-80" />
      <Skeleton className="mt-4 h-6 w-96" />
      <Skeleton className="mt-8 h-10 w-48" />
    </div>
  );
}
