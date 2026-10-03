"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);

  // The route changed: the navigation finished.
  useEffect(() => {
    setActive(false);
  }, [pathname, search]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden" role="progressbar" aria-label="Loading page">
      <div className="nav-progress-bar h-full bg-sky-400" />
    </div>
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
