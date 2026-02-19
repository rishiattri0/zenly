"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  title: string;
  description: string;
}

interface HeroCarouselProps {
  slides?: CarouselSlide[];
  autoplayDelay?: number;
  className?: string;
}

const defaultSlides: CarouselSlide[] = [
  {
    title: "Your 24/7 Mental Wellness Companion",
    description: "Always here to listen and support your journey",
  },
  {
    title: "Support When You Need It Most",
    description: "Compassionate AI conversations anytime, anywhere",
  },
  {
    title: "Small Steps Toward a Healthier Mind",
    description: "Track your mood and celebrate your progress",
  },
  {
    title: "Find Your Inner Peace",
    description: "Mindfulness tools for emotional balance",
  },
  {
    title: "You Are Not Alone on This Journey",
    description: "Join thousands finding strength through connection",
  },
];

export default function HeroCarousel({
  slides = defaultSlides,
  autoplayDelay = 4200,
  className = "",
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const count = slides.length;

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % count);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + count) % count);
  };

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % count);
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplayDelay, count]);

  const slide = useMemo(() => slides[index], [slides, index]);

  return (
    <div className={cn("relative mx-auto mt-8 w-full max-w-2xl sm:mt-12", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-5 py-8 shadow-xl backdrop-blur-sm sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 space-y-3 text-center"
          >
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{slide.title}</p>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">{slide.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                )}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
