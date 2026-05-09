import { useEffect, useRef } from 'react';
import { drawFrameCover } from '../lib/frameExtractor';

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
  const span = b - a;
  const inEnd = a + span * 0.3;
  const outStart = b - span * 0.3;
  if (progress < a || progress > b) return 0;
  if (progress < inEnd) return smoothstep(a, inEnd, progress);
  if (progress > outStart) return 1 - smoothstep(outStart, b, progress);
  return 1;
}

function cardTranslate(progress, [a, b], side) {
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
  const cardRefs = useRef([]);
  const progressBarRef = useRef(null);

  framesRef.current = frames;

  const sizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cap at 2; source video is ~1300px wide so >2 is wasted pixel work.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    const scrollable = rect.height - vh;
    const scrolled = Math.max(0, Math.min(scrollable, -rect.top));
    const p = scrollable > 0 ? scrolled / scrollable : 0;

    // Cards: drive style directly via refs — no React re-render.
    for (let i = 0; i < CARDS.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const card = CARDS[i];
      const o = cardOpacity(p, card.range);
      if (o <= 0.001) {
        if (el.style.visibility !== 'hidden') {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
        }
        continue;
      }
      if (el.style.visibility === 'hidden') el.style.visibility = '';
      const tx = cardTranslate(p, card.range, card.side);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(-50%) translateX(${tx.toFixed(2)}px)`;
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(p * 100).toFixed(2)}%`;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

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
      style={{ height: '420vh' }}
      aria-label="Drone disassembly scroll sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)',
          }}
        />
        <div aria-hidden className="absolute inset-0 grain pointer-events-none" />

        <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[11px] uppercase tracking-[0.4em] text-chrome/55">
            Anatomy of flight
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-px bg-white/10 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-accent"
            style={{ width: '0%' }}
          />
        </div>

        {CARDS.map((card, i) => (
          <article
            key={card.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`absolute top-1/2 max-w-sm px-7 py-7 rounded-2xl
                        border border-white/[0.08] bg-ink/85
                        shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]
                        ${card.side === 'left' ? 'left-6 md:left-14' : 'right-6 md:right-14'}`}
            style={{
              opacity: 0,
              visibility: 'hidden',
              transform: 'translateY(-50%)',
              willChange: 'opacity, transform',
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
        ))}
      </div>
    </section>
  );
}
