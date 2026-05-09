import { useEffect, useRef, useState } from 'react';
import { drawFrameCover } from '../lib/frameExtractor';

// Each card spans a slice of the section's [0..1] scroll range. They fade in,
// hold, then fade out — staggered so the user sees them appear/disappear in
// sequence as the drone disassembles.
const CARDS = [
  {
    eyebrow: 'Propulsion',
    title: 'Quad Thrust-Vector Motors',
    body: 'Four 4006KV brushless motors gimbal independently on a magnesium yoke, redirecting 78 N of thrust per axis for instant, silent attitude changes.',
    metric: '78 N',
    metricLabel: 'thrust per motor',
    range: [0.18, 0.42],
    side: 'left',
  },
  {
    eyebrow: 'Imaging',
    title: '8K Cinema Sensor',
    body: 'A custom 1-inch stacked CMOS reads 14 stops of dynamic range at 120fps. The Leica-co-engineered f/1.7 lens floats on a three-axis micro-gimbal.',
    metric: '14',
    metricLabel: 'stops dynamic range',
    range: [0.34, 0.58],
    side: 'right',
  },
  {
    eyebrow: 'Intelligence',
    title: 'Adaptive Flight AI',
    body: 'An on-board NPU runs a 1.4 B-parameter visual-inertial model at 200 Hz, predicting wind shear and obstacles 700 ms ahead of the airframe.',
    metric: '200 Hz',
    metricLabel: 'inference rate',
    range: [0.5, 0.74],
    side: 'left',
  },
  {
    eyebrow: 'Airframe',
    title: 'Carbon-Fiber Monocoque',
    body: 'A single-piece 3K twill chassis weighs just 312 g yet survives a 30 m free-fall. Internal heat-pipe thermals keep silicon under 62 °C at full tilt.',
    metric: '312 g',
    metricLabel: 'airframe mass',
    range: [0.66, 0.92],
    side: 'right',
  },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function cardOpacity(progress, [a, b]) {
  // Triangle window with smooth edges: ramp up over first 30% of range,
  // hold, ramp down over last 30%.
  const span = b - a;
  const inEnd = a + span * 0.3;
  const outStart = b - span * 0.3;
  if (progress < a || progress > b) return 0;
  if (progress < inEnd) return smoothstep(a, inEnd, progress);
  if (progress > outStart) return 1 - smoothstep(outStart, b, progress);
  return 1;
}

function cardTranslate(progress, [a, b], side) {
  // Translate from 24px outward → 0 as it fades in.
  const span = b - a;
  const inEnd = a + span * 0.3;
  const t = smoothstep(a, inEnd, progress);
  const dir = side === 'left' ? -1 : 1;
  return (1 - t) * 24 * dir;
}

export default function StickyExplode({ frames }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef(frames);
  const lastDrawnFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);

  // Keep the latest `frames` in a ref so paint() doesn't depend on closure
  // identity. Lets us define paint/schedulePaint outside of render and keep
  // listeners stable.
  framesRef.current = frames;

  // Sole authority on canvas backing-store size + DPR transform. We never
  // set width/height attributes from JSX — doing so would wipe the context
  // (including this transform) every time the parent re-rendered.
  const sizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Match the screen's pixel density (cap at 3 for absurd displays). The
    // source video is only ~1300 px wide, so going above DPR 2 won't add real
    // detail, but it will let the browser pick a higher-quality scaler.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    lastDrawnFrameRef.current = -1;
  };

  useEffect(() => {
    sizeCanvas();
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      schedulePaint();
    });
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schedulePaint = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(paint);
  };

  const paint = () => {
    rafRef.current = 0;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const fs = framesRef.current;
    if (!canvas || !section) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Section scrolled progress: 0 when its top hits viewport top,
    // 1 when its bottom hits viewport bottom.
    const scrollable = rect.height - vh;
    const scrolled = Math.max(0, Math.min(scrollable, -rect.top));
    const p = scrollable > 0 ? scrolled / scrollable : 0;
    setProgress(p);

    const ctx = canvas.getContext('2d', { alpha: false });
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // No frames yet → just paint the dark backdrop so the section reads
    // as intentional rather than broken.
    if (!fs || fs.length === 0) {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, cssW, cssH);
      lastDrawnFrameRef.current = -1;
      return;
    }

    const frameIdx = Math.min(fs.length - 1, Math.floor(p * fs.length));
    if (frameIdx === lastDrawnFrameRef.current) return;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, cssW, cssH);
    drawFrameCover(ctx, fs[frameIdx], cssW, cssH);
    lastDrawnFrameRef.current = frameIdx;
  };

  // Scroll + resize listeners. These bind once; paint() reads the latest
  // frames via framesRef so we don't need to rebind when frames arrive.
  useEffect(() => {
    const onScroll = () => schedulePaint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    schedulePaint();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Repaint whenever the frames array changes (initial load, hot reload).
  useEffect(() => {
    lastDrawnFrameRef.current = -1;
    schedulePaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  return (
    <section
      ref={sectionRef}
      id="flight"
      className="relative w-full"
      // Scroll length controls how long the explode sequence takes. ~400vh
      // means the user scrolls four viewports to traverse the full video.
      style={{ height: '420vh' }}
      aria-label="Drone disassembly scroll sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Vignette + grain over the canvas for a cinematic feel */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)',
          }}
        />
        <div aria-hidden className="absolute inset-0 grain pointer-events-none" />

        {/* Section eyebrow */}
        <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[11px] uppercase tracking-[0.4em] text-chrome/55">
            Anatomy of flight
          </p>
        </div>


        {/* Progress rail */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-px bg-white/10 overflow-hidden">
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {/* Card overlays */}
        {CARDS.map((card) => {
          const o = cardOpacity(progress, card.range);
          const tx = cardTranslate(progress, card.range, card.side);
          if (o <= 0.001) return null;
          return (
            <article
              key={card.title}
              className={`absolute top-1/2 -translate-y-1/2 max-w-sm px-7 py-7 rounded-2xl
                          border border-white/[0.08] bg-ink/55 backdrop-blur-xl
                          shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]
                          ${card.side === 'left' ? 'left-6 md:left-14' : 'right-6 md:right-14'}`}
              style={{
                opacity: o,
                transform: `translateY(-50%) translateX(${tx}px)`,
                transition: 'transform 200ms ease-out',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent/90 mb-3">
                {card.eyebrow}
              </p>
              <h3 className="font-display text-2xl md:text-[1.7rem] leading-tight tracking-tight mb-3 text-chrome">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-chrome/65 mb-5">{card.body}</p>
              <div className="flex items-baseline gap-3 pt-4 border-t border-white/[0.06]">
                <span className="font-mono text-2xl text-chrome tracking-tight">
                  {card.metric}
                </span>
                <span className="text-[11px] uppercase tracking-[0.25em] text-chrome/45">
                  {card.metricLabel}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
