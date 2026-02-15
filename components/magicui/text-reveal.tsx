"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function RevealWord({
  word,
  index,
  count,
  progress,
}: {
  word: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const start = index / count;
  const end = start + 1 / count;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  return (
    <span className="relative mx-2">
      <span className="absolute opacity-20">{word}</span>
      <motion.span style={{ opacity }} className="text-black dark:text-white">
        {word}
      </motion.span>
    </span>
  );
}

export default function TextReveal({ children }: { children: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const words = children.split(" ");

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-8">
        <p className="flex max-w-5xl flex-wrap text-6xl font-bold leading-tight text-black/20 dark:text-white/20">
          {words.map((w, i) => (
            <RevealWord key={`${w}-${i}`} word={w} index={i} count={words.length} progress={scrollYProgress} />
          ))}
        </p>
      </div>
    </section>
  );
}
