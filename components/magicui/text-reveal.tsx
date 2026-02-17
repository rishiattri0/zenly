"use client";

import React, { ComponentPropsWithoutRef, FC, ReactNode, useRef, useEffect, useState } from "react";
import { motion, type MotionValue, useScroll } from "framer-motion";

import { cn } from "@/lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string;
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string");
  }

  const words = children.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[180vh]", className)}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-4xl items-center bg-transparent px-4">
        <span className="flex flex-wrap p-5 text-3xl font-bold md:p-8 md:text-4xl lg:p-10 lg:text-5xl xl:text-6xl">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} scrollYProgress={scrollYProgress} range={[start, end]}>{word}</Word>;
          })}
        </span>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  scrollYProgress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, scrollYProgress, range }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const [start, end] = range;
      let o = 0;
      if (v >= start && v <= end) {
        o = (v - start) / (end - start);
      } else if (v > end) {
        o = 1;
      }
      setOpacity(o);
    });
    return () => unsubscribe();
  }, [scrollYProgress, range]);

  return (
    <span className="relative mx-1 lg:mx-1.5">
      <motion.span style={{ opacity }} className={"text-black dark:text-white"}>
        {children}
      </motion.span>
    </span>
  );
};
