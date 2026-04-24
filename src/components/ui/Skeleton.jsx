import { cn } from '../../utils/formatters';

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in space-y-8 p-8">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}