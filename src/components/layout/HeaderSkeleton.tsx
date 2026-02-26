export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-fb-hover bg-fb shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-44 animate-pulse rounded bg-white/20" />
        <nav className="hidden gap-1 md:flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-16 animate-pulse rounded bg-white/20" />
          ))}
        </nav>
        <div className="h-10 w-24 animate-pulse rounded bg-white/20" />
      </div>
    </header>
  );
}
