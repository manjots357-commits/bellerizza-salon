"use client";

/**
 * Tiny coordination point between the preloader and the entrance
 * animations (nav, hero). Components call `onIntro` to run once the curtain
 * lifts; if it already has, the callback fires on the next frame.
 */
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onIntro(fn: () => void): () => void {
  if (done) {
    const id = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(id);
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}
