export default function AppContainer({ children }) {
  return (
    <div className="min-h-screen bg-surface-base text-text-primary font-body antialiased flex justify-center selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-[480px] min-h-screen relative flex flex-col pb-safe-nav lg:pb-0 lg:max-w-6xl lg:grid lg:grid-cols-[240px_1fr] lg:gap-md">
        {children}
      </div>
    </div>
  );
}
