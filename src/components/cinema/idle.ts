/** Run after the page settles so scroll setups never compete with first paint. */
export function onIdle(cb: () => void, timeout = 2500): () => void {
  const w = window as Window & {
    requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 400);
  return () => window.clearTimeout(id);
}

/** Run once the element is within `margin` of the viewport (then idle). */
export function whenNear(el: Element, cb: () => void, margin = "120% 0px"): () => void {
  let cancelIdle = () => {};
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      cancelIdle = onIdle(cb, 300);
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    cancelIdle();
  };
}
