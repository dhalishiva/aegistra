"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Counts to a number with an ease-out. Respects reduced motion. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return <span className={className}>{shown}</span>;
}

/** Slides a block up once it enters the viewport. Used sparingly, with a small stagger. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** The hero headline: each line rises out of a mask, one after the other, once on load. */
export function HeroHeading({ lines }: { lines: readonly string[] }) {
  const reduce = useReducedMotion();
  return (
    <h1 className="max-w-5xl text-[2.5rem] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-6xl xl:text-[4.25rem]">
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export { useInView };
