import { Suspense } from "react";
import { SearchContent } from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8">
        <div className="h-6 bg-muted w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted mb-3" />
              <div className="h-3 bg-muted w-3/4 mb-2" />
              <div className="h-3 bg-muted w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
