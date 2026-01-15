export function BookCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      {/* Cover Skeleton */}
      <div className="aspect-[2/3] skeleton" />

      {/* Meta Skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-5 w-16 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
        <div className="h-5 w-20 skeleton rounded mt-2" />
      </div>
    </div>
  )
}
