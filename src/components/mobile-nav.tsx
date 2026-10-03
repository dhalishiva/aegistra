"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function MobileNav({ links }: { links: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-white/25 bg-card"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          id="mobile-menu"
          className="absolute inset-x-0 top-16 border-b border-white/10 bg-ink px-5 pb-5 pt-2 shadow-2xl"
        >
          <ul className="divide-y divide-white/10">
            {links.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-base font-medium text-slate-200"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-3.5 text-base font-medium text-slate-200"
              >
                Log in
              </Link>
            </li>
          </ul>
        </motion.nav>
      )}
      </AnimatePresence>
    </div>
  );
}
