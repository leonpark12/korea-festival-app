export default function SpotLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="h-48 w-full animate-pulse bg-muted sm:h-64 md:h-72" />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>

        {/* Info skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />

        {/* Tags skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-16 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
