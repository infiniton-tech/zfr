export default function RootLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-black z-[9999] overflow-hidden pointer-events-none">
      <div className="h-full w-full bg-neutral-800 animate-pulse" />
    </div>
  );
}
