const SPEC_GROUPS = [
  {
    title: 'Airframe',
    rows: [
      ['Mass (RTF)', '312 g'],
      ['Diagonal wheelbase', '198 mm'],
      ['Material', '3K twill carbon-fiber monocoque'],
      ['Ingress rating', 'IP54'],
      ['Operating temperature', '−10° to 45° C'],
    ],
  },
  {
    title: 'Propulsion',
    rows: [
      ['Motors', '4 × 4006 brushless, 1100 KV'],
      ['Thrust per motor', '78 N continuous, 124 N peak'],
      ['Thrust vector range', '±18° on yoke'],
      ['ESC', '60 A 6S Dshot1200'],
      ['Acoustic signature', '47 dB(A) at 5 m hover'],
    ],
  },
  {
    title: 'Imaging',
    rows: [
      ['Sensor', '1.0″ stacked CMOS, 8K @ 60p'],
      ['Slow motion', '4K @ 240p · 1080p @ 960p'],
      ['Lens', 'Leica 24 mm-eq f/1.7 ASPH'],
      ['Dynamic range', '14 stops'],
      ['Codec', '10-bit 4:2:2 ProRes / H.265'],
    ],
  },
  {
    title: 'Flight & Power',
    rows: [
      ['Flight time', 'Up to 42 min (no wind)'],
      ['Top speed', '92 km/h sport mode'],
      ['Max wind resistance', 'Force 7 (Beaufort)'],
      ['Battery', '6S 6800 mAh LiPo HV'],
      ['Range (FCC)', '14 km O4 link'],
      ['On-board NPU', '38 TOPS, 200 Hz inference'],
    ],
  },
];

export default function Specs() {
  return (
    <section
      id="specs"
      className="relative px-6 py-32 md:py-44 max-w-6xl mx-auto"
    >
      <div className="mb-16 md:mb-24">
        <p className="text-[11px] uppercase tracking-[0.35em] text-chrome/45 mb-5">
          Tech specs
        </p>
        <h2 className="font-display font-semibold tracking-tightest text-balance text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] text-chrome max-w-3xl">
          Every gram, every hertz,
          <br />
          <span className="text-chrome/55">measured.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
        {SPEC_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="font-display text-base text-chrome border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
              <span>{group.title}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-chrome/35 font-text">
                {String(SPEC_GROUPS.indexOf(group) + 1).padStart(2, '0')}
              </span>
            </h3>
            <dl className="space-y-3">
              {group.rows.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 text-sm py-1.5 border-b border-white/[0.04]"
                >
                  <dt className="text-chrome/55">{k}</dt>
                  <dd className="font-mono text-chrome text-right tabular-nums">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-24 pt-12 border-t border-white/[0.06] flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <p className="font-display text-3xl md:text-4xl tracking-tight max-w-md text-balance">
            Engineered without compromise. Priced like it.
          </p>
          <p className="mt-3 text-chrome/50 text-sm">
            From <span className="text-chrome">$2,499</span> · Free shipping ·
            12-month carry-anywhere warranty.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 rounded-full bg-chrome text-ink text-sm font-medium hover:bg-white transition">
            Pre-order
          </button>
          <button className="px-6 py-3 rounded-full border border-white/15 text-chrome text-sm hover:bg-white/[0.04] transition">
            Compare models →
          </button>
        </div>
      </div>

      <footer className="mt-28 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-chrome/40">
        <p>© 2026 Aero Systems. Operate within applicable aviation regulations.</p>
        <div className="flex flex-wrap gap-6">
          <a href="#" className="hover:text-chrome/70 transition">Privacy</a>
          <a href="#" className="hover:text-chrome/70 transition">Support</a>
          <a href="#" className="hover:text-chrome/70 transition">Press kit</a>
          <a href="#" className="hover:text-chrome/70 transition">Newsroom</a>
        </div>
      </footer>
    </section>
  );
}
