import { useEffect, useState, type ReactNode } from 'react';
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import { AIResumeChecker } from './pages/app1.tsx';

/**
 * Where the landing app lives.
 * Overridable per-environment so production never points at localhost:
 *   .env.local -> VITE_LANDING_URL=https://your-domain.com
 */
const LANDING_URL: string = import.meta.env.VITE_LANDING_URL ?? 'http://localhost:5173/';

/** Sign-in screen inside the landing app (cross-origin, so a full navigation). */
const LOGIN_URL = new URL('/sign-in', LANDING_URL).toString();

/**
 * Sends every path except /App to the landing site.
 * - window.location (not <Navigate>) because the landing app is on ANOTHER
 *   port, i.e. a different origin — react-router only resolves internal paths
 *   and would turn this into ".../http://localhost:5173/".
 * - .replace() instead of .href so this hop is never added to history;
 *   otherwise Back would land here and immediately bounce forward again,
 *   trapping the user in a redirect loop.
 */
function RedirectToLanding() {
  useEffect(() => {
    window.location.replace(LANDING_URL);
  }, []);

  return null;
}

/**
 * Route guard for /App — mirrors the original verifyToken intent at the UI layer.
 *
 * WHY THE TOKEN ARRIVES IN THE URL:
 *   The auth app runs on :5173 and this app on :5174. Web storage is keyed by
 *   origin (scheme + host + PORT), so sessionStorage written by the auth app is
 *   invisible here. A plain redirect therefore always looked "logged out" and
 *   bounced straight back — which is why signup/sign-in appeared to just reload.
 *   The token is handed over in the query string, persisted on THIS origin,
 *   then removed from the address bar in the same tick.
 *
 * WHAT IT DOES NOT DO:
 * - Verify the signature. Impossible to do safely in a browser — the secret
 *   would ship in the JS bundle. Signature checks belong on the server.
 * - Check `exp`. The analysis API does not require this token (agreed scope),
 *   so bouncing a working session on a clock edge would only annoy users.
 *
 * This is a UX gate, not a security boundary: anyone can write sessionStorage.
 * Real enforcement = verifyToken middleware on the API route.
 */
function isAuthenticated(): boolean {
  try {
    // Handoff in flight? (pure read — the write happens in the effect below)
    if (new URLSearchParams(window.location.search).get('token')) return true;
    // Already established on this origin?
    return Boolean(sessionStorage.getItem('token'));
  } catch {
    // window/sessionStorage unavailable (SSR or blocked storage) -> logged out
    return false;
  }
}

function RequireAuth({ children }: { children: ReactNode }) {
  const [authed] = useState(isAuthenticated);

  useEffect(() => {
    if (!authed) {
      // Cross-origin, so a full navigation (see RedirectToLanding for why
      // .replace() matters — it keeps Back out of a redirect loop).
      window.location.replace(LOGIN_URL);
      return;
    }

    // Consume the one-time handoff: persist it on this origin, then take the
    // JWT back out of the address bar so it isn't left visible or sitting in
    // the history entry.
    const incoming = new URLSearchParams(window.location.search).get('token');
    if (incoming) {
      sessionStorage.setItem('token', incoming);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [authed]);

  // Blank for the one tick before navigation fires, so no protected markup
  // is painted for an unauthenticated visitor.
  if (!authed) return null;
  return <>{children}</>;
}

function App(){

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/App" element={<RequireAuth><AIResumeChecker /></RequireAuth>} />
        {/* root used to render a blank page */}
        <Route path="/" element={<RedirectToLanding />} />
        {/* any unknown URL also lands somewhere useful */}
        <Route path="*" element={<RedirectToLanding />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
