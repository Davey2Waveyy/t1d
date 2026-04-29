export default function AppContainer({ children }) {
  return (
    <div className="min-h-dvh bg-surface-base text-text-primary font-body antialiased flex justify-center selection:bg-primary-container selection:text-on-primary-container min-[560px]:h-dvh min-[560px]:items-center min-[560px]:overflow-hidden min-[560px]:px-6 min-[560px]:py-6 min-[560px]:bg-[radial-gradient(ellipse_at_50%_65%,rgba(86,241,195,0.10),transparent_34rem),radial-gradient(ellipse_at_50%_50%,#0d1b16_0%,#050a08_100%)]">
      <div
        data-testid="phone-frame"
        className="contents min-[560px]:relative min-[560px]:flex min-[560px]:h-[844px] min-[560px]:max-h-[calc(100dvh-3rem)] min-[560px]:w-[390px] min-[560px]:flex-col min-[560px]:overflow-hidden min-[560px]:rounded-[48px] min-[560px]:border-[9px] min-[560px]:border-[#1c1c1e] min-[560px]:bg-surface-base min-[560px]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_50px_120px_rgba(0,0,0,0.7),0_0_80px_rgba(86,241,195,0.08)]"
      >
        <div
          data-testid="phone-notch"
          className="pointer-events-none hidden min-[560px]:absolute min-[560px]:left-1/2 min-[560px]:top-0 min-[560px]:z-50 min-[560px]:block min-[560px]:h-7 min-[560px]:w-[120px] min-[560px]:-translate-x-1/2 min-[560px]:rounded-b-[18px] min-[560px]:bg-[#1c1c1e]"
        />
        <div
          data-testid="phone-screen"
          className="relative flex h-dvh min-h-dvh w-full max-w-[480px] flex-col bg-surface-base min-[560px]:h-auto min-[560px]:min-h-0 min-[560px]:flex-1 min-[560px]:overflow-hidden min-[560px]:pt-7"
        >
          {children}
        </div>
        <div
          data-testid="phone-home-indicator"
          className="hidden min-[560px]:flex min-[560px]:h-7 min-[560px]:flex-shrink-0 min-[560px]:items-center min-[560px]:justify-center"
        >
          <div className="h-[5px] w-[130px] rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}
