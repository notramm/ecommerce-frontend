import { cn } from '../../utils/formatters';

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-none', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2 px-0.5">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-obsidian p-8 space-y-8">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}