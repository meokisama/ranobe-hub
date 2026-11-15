"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const KEY = "rh-splash";
/** Long enough for the seal to land and be read. */
const MIN_MS = 1150;
/** Never hold the page longer than this, ready or not. */
const MAX_MS = 2200;
const LIFT_MS = 950;

// Runs while the HTML is still being parsed, before React hydrates: on a repeat visit
// (or with reduced motion) the server-rendered curtain is hidden before its first paint.
const SKIP_SCRIPT = `(function(){try{if(sessionStorage.getItem('${KEY}')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches){var s=document.getElementById('splash');if(s)s.setAttribute('data-skip','')}}catch(e){}})()`;

// Decided once per page load, so marking the session as "seen" can't cut the first showing short.
let skip: boolean | undefined;

function decideSkip(): boolean {
  if (skip === undefined) {
    try {
      skip = window.matchMedia("(prefers-reduced-motion: reduce)").matches || sessionStorage.getItem(KEY) === "1";
      if (!skip) sessionStorage.setItem(KEY, "1");
    } catch {
      skip = false;
    }
  }
  return skip;
}

const subscribe = () => () => {};

/** True when the splash won't play: already seen this session, or reduced motion. Always false on the server. */
export function useSplashSkipped(): boolean {
  return useSyncExternalStore(subscribe, decideSkip, () => false);
}

/** True on the server and during hydration only, so the inline script is never rendered client-side. */
function useServerMarkup(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
}

interface SplashProps {
  /** The hero has something to show; the curtain may lift once the seal has landed. */
  ready: boolean;
  /** The curtain starts lifting: begin the hero's own entrance now. */
  onLift: () => void;
}

/** Once per session: a vermilion seal stamped on blank paper, then the sheet lifts off the home page. */
export function Splash({ ready, onLift }: SplashProps) {
  const skipped = useSplashSkipped();
  const serverMarkup = useServerMarkup();
  const [phase, setPhase] = useState<"in" | "lifting" | "gone">("in");
  const latest = useRef({ ready, onLift });

  useEffect(() => {
    latest.current = { ready, onLift };
  }, [ready, onLift]);

  useEffect(() => {
    if (skipped) return;
    const start = performance.now();
    let done: ReturnType<typeof setTimeout> | undefined;
    const poll = setInterval(() => {
      const elapsed = performance.now() - start;
      if ((elapsed >= MIN_MS && latest.current.ready) || elapsed >= MAX_MS) {
        clearInterval(poll);
        setPhase("lifting");
        latest.current.onLift();
        done = setTimeout(() => {
          skip = true;
          setPhase("gone");
        }, LIFT_MS);
      }
    }, 50);
    return () => {
      clearInterval(poll);
      clearTimeout(done);
    };
  }, [skipped]);

  if (skipped || phase === "gone") return null;

  return (
    <>
      <div id="splash" aria-hidden suppressHydrationWarning className={`splash ${phase === "lifting" ? "splash-lifting" : ""}`}>
        <div className="splash-seal">
          <svg viewBox="0 0 64 64" className="size-24 sm:size-28">
            <rect width="64" height="64" rx="12" fill="#d9481c" />
            <rect x="6" y="6" width="52" height="52" rx="7" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
            <g fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M27 19c-1 12-5 20-12 27" />
              <path d="M37 19c3 11 7 19 12 26" />
            </g>
          </svg>
        </div>
        <p className="splash-caption mt-9 font-display text-2xl leading-none tracking-[-0.03em] text-sumi">
          <span className="font-light italic">Ranobe</span> <span className="font-semibold">Hub</span>
        </p>
        <p lang="ja" className="splash-caption mt-3 font-mincho text-xs tracking-[0.5em] text-sumi-mute">
          ライトノベル書庫
        </p>
      </div>
      {serverMarkup && <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />}
    </>
  );
}
