// Layout-shaped loading placeholder for dashboard screens.
export default function ScreenSkeleton({ hero = true, rows = 3 }) {
  return (
    <div className="flex flex-col gap-lg animate-[fadeIn_200ms_var(--ease-out)]" aria-hidden="true">
      <div className="flex flex-col gap-sm">
        <div className="skeleton h-6 w-44" />
        <div className="skeleton h-4 w-64" />
      </div>
      {hero && <div className="skeleton h-44 w-full rounded-2xl" />}
      <div className="grid grid-cols-2 gap-sm">
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-24 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
