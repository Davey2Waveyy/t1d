export default function AppContainer({ children }) {
  return (
    <div className="min-h-dvh bg-surface-base text-text-primary font-body antialiased flex justify-center selection:bg-primary-container selection:text-on-primary-container min-[560px]:h-dvh min-[560px]:items-center min-[560px]:overflow-hidden min-[560px]:px-6 min-[560px]:py-6 min-[560px]:bg-[radial-gradient(90rem_50rem_at_80%_-10rem,rgba(30,125,95,0.07),transparent_62%),radial-gradient(70rem_44rem_at_0%_110%,rgba(199,126,31,0.06),transparent_60%),linear-gradient(180deg,#f6f3ea,#efeadd)]">
      <div
        data-testid="phone-frame"
        className="contents min-[560px]:relative min-[560px]:flex min-[560px]:h-[844px] min-[560px]:max-h-[calc(100dvh-3rem)] min-[560px]:w-[390px] min-[560px]:flex-col min-[560px]:overflow-hidden min-[560px]:rounded-[52px] min-[560px]:border-[7px] min-[560px]:border-[#fffefa] min-[560px]:bg-surface-base min-[560px]:shadow-[0_0_0_1px_rgba(28,43,36,0.12),inset_0_0_0_1px_rgba(255,255,255,0.08),0_60px_120px_-38px_rgba(28,43,36,0.55),0_24px_48px_-24px_rgba(28,43,36,0.35)]"
      >
        <div
          data-testid="phone-notch"
          className="pointer-events-none hidden min-[560px]:absolute min-[560px]:left-1/2 min-[560px]:top-0 min-[560px]:z-50 min-[560px]:block min-[560px]:h-7 min-[560px]:w-[120px] min-[560px]:-translate-x-1/2 min-[560px]:rounded-b-[18px] min-[560px]:bg-[#fffefa]"
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
