export default function RootLoading() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      {/* Classy sliding progress bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-neutral-900 overflow-hidden">
        <div className="h-full w-full animate-shimmer" />
      </div>

      {/* Elegant minimalist brand text */}
      <div className="text-center space-y-4">
        <h1 
          className="text-4xl font-light tracking-[0.4em] uppercase text-black animate-tracking-in-expand"
          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
        >
          ZFR
        </h1>
        <p className="text-[10px] text-neutral-400 tracking-[0.25em] uppercase animate-pulse">
          Fashion for Everyone
        </p>
      </div>
    </div>
  );
}
