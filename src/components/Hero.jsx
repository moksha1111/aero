export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* radial glow background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(10,239,255,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 90%, rgba(120,80,255,0.10), transparent 70%), #0a0a0c',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"
      />

      <p className="text-xs uppercase tracking-[0.32em] text-chrome/50 mb-6 fade-up visible">
        Aero · Mark VII
      </p>

      <h1 className="font-display font-semibold tracking-tightest text-balance text-[clamp(3rem,11vw,9.5rem)] leading-[0.92] glow-text">
        The drone,
        <br />
        <span className="bg-gradient-to-b from-chrome to-chrome/40 bg-clip-text text-transparent">
          reimagined.
        </span>
      </h1>

      <p className="mt-8 max-w-xl text-balance text-base md:text-lg leading-relaxed text-chrome/65">
        A carbon-fiber airframe. Quad brushless motors with thrust-vectoring control.
        An 8K cinema sensor that follows your every breath.
      </p>

      <div className="mt-10 flex items-center gap-3 text-sm">
        <a
          href="#flight"
          className="px-5 py-2.5 rounded-full bg-chrome text-ink font-medium hover:bg-white transition shadow-lg shadow-cyan-400/10"
        >
          Watch the demo
        </a>
        <a
          href="#specs"
          className="px-5 py-2.5 rounded-full border border-white/15 text-chrome hover:bg-white/[0.04] transition"
        >
          Learn more →
        </a>
      </div>

      <p className="mt-6 text-[13px] text-chrome/40">
        From <span className="text-chrome/70">$2,499</span> · or $208/mo. for 12 mo.
      </p>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-chrome/35 text-[11px] tracking-[0.3em] uppercase">
        <span className="float-y">Scroll</span>
        <span className="block h-8 w-px bg-gradient-to-b from-chrome/40 to-transparent" />
      </div>
    </section>
  );
}
