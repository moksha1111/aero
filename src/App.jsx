import { useEffect, useRef, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Loader from './components/Loader';
import StickyExplode from './components/StickyExplode';
import Specs from './components/Specs';
import { extractFrames } from './lib/frameExtractor';

// Source: https://cdn.openart.ai/openart-ai/production/2026-05/create-video/0uCtf2ym1ehBVg7MTLRb/cc5a38aa8c4b84cfc3196188a5b03806-896428a8-c4c9-4f81-8e7f-08d737e25bdf_1778073785029_cfa09184.mp4
// The CDN only sends Access-Control-Allow-Origin for https://openart.ai, so a
// canvas reading the video would be tainted from any other host. We mirror the
// asset locally under /public so it loads same-origin and createImageBitmap
// can read pixels without a SecurityError.
const VIDEO_URL = '/aero.mp4';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('preparing…');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [bundle, setBundle] = useState(null);
  // Guard against StrictMode's intentional double-mount in dev. The check
  // is on a ref (not state) so it survives the re-mount. We do NOT use a
  // `cancelled` flag here — StrictMode's first cleanup would set it true,
  // gating every progress callback to a no-op while extraction kept running
  // invisibly in the background. Extraction is ~1s work; the small risk of
  // a setState-after-unmount warning is fine for this page.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    extractFrames(VIDEO_URL, {
      maxWidth: 1280,
      onProgress: setProgress,
      onStage: setStage,
    })
      .then((result) => {
        console.log('[aero] extraction OK — frames=', result.frames.length, 'size=', result.width + 'x' + result.height);
        setBundle(result);
        setReady(true);
      })
      .catch((err) => {
        console.error('[aero] frame extraction failed:', err);
        setError(err);
        // Don't auto-dismiss — leave the loader open so the failure reason is
        // legible. There's a "Continue without video" button for fallback.
      });
  }, []);

  return (
    <>
      {!ready && (
        <Loader
          progress={progress}
          error={error}
          stage={stage}
          onContinue={() => setReady(true)}
        />
      )}
      <Nav />
      <main>
        <Hero />
        <StickyExplode frames={bundle?.frames || []} />
        <Specs />
      </main>
    </>
  );
}
