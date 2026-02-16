"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
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
  const y = useTransform(progress, [start, end], [20, 0]);
  return (
    <span className="relative mx-2 inline-block">
      <span className="absolute opacity-20">{word}</span>
      <motion.span 
        style={{ opacity, y }} 
        className="text-black dark:text-white relative"
        transition={{ duration: 0.3 }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function TextReveal({ children }: { children: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = children.split(" ");

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-8">
        <p className="flex flex-wrap text-6xl md:text-7xl font-bold leading-tight text-black/20 dark:text-black/20">
          {words.map((w, i) => (
            <RevealWord key={`${w}-${i}`} word={w} index={i} count={words.length} progress={scrollYProgress} />
          ))}
        </p>
      </div>
    </section>
  );
}
