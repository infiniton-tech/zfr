export default function ShopLoading() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Classy sliding progress bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-neutral-900 z-[100] overflow-hidden">
        <div className="h-full w-full animate-shimmer" />
      </div>

      {/* Main container with padding to avoid layout shift below Header */}
      <div className="pt-[56px] px-4 md:px-8 py-6 md:py-10 space-y-12">
        {/* Hero Banner Skeleton */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-neutral-100 animate-pulse flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-6 w-32 bg-neutral-200 mx-auto rounded animate-pulse" />
            <div className="h-4 w-48 bg-neutral-200 mx-auto rounded animate-pulse" />
          </div>
        </div>

        {/* Categories / Grid Skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-100 rounded animate-pulse w-full" />
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
