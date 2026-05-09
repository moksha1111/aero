export default function Loader({ progress, error, stage, onContinue }) {
  const pct = Math.round((progress || 0) * 100);
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-10 text-chrome">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="float-y">
          <path
            d="M12 2L4 7l8 5 8-5-8-5zM4 17l8 5 8-5M4 12l8 5 8-5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-display text-lg tracking-tight">aero</span>
      </div>

      <div className="w-[28rem] max-w-[90vw]">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-chrome/45 mb-3">
          <span>{error ? 'Extraction failed' : stage || 'preparing…'}</span>
          <span className="font-mono text-chrome/70">
            {error ? '—' : `${pct.toString().padStart(2, '0')}%`}
          </span>
        </div>
        <div className="h-px w-full bg-white/10 overflow-hidden relative">
          <div
            className={`absolute left-0 top-0 h-full transition-[width] duration-150 ${
              error
                ? 'bg-red-500/70'
                : 'bg-gradient-to-r from-accent/40 via-accent to-accent/40'
            }`}
            style={{ width: error ? '100%' : `${pct}%` }}
          />
        </div>
        {error ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-4 font-mono text-[12px] leading-relaxed text-red-200/90 break-words whitespace-pre-wrap">
            {error.message || String(error)}
          </div>
        ) : (
          <p className="mt-5 text-xs text-chrome/40 leading-relaxed font-mono break-words">
            Pre-baking every frame as an ImageBitmap so scrolling is buttery —
            never scrubbing the source video.
          </p>
        )}
        {error && onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 px-4 py-2 rounded-full border border-white/15 text-chrome text-sm hover:bg-white/[0.04] transition"
          >
            Continue without video
          </button>
        )}
      </div>
    </div>
  );
}
