"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Shield, Sparkles } from "lucide-react";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "AI-Powered Conversations",
    description:
      "Connect with compassionate AI companions that understand and support your emotional journey.",
    icon: Sparkles,
    className: "col-span-1",
    bg: "from-rose-500/10 via-orange-500/10 to-amber-500/10",
    points: ["24/7 support", "Compassionate responses"],
  },
  {
    title: "Real-time Mood Tracking",
    description:
      "Monitor your emotional patterns and gain insights into your mental well-being instantly.",
    icon: Heart,
    className: "col-span-1",
    bg: "from-emerald-500/10 via-lime-500/10 to-cyan-500/10",
    points: ["Daily mood logs", "Trend visibility"],
  },
  {
    title: "Personalized Care",
    description:
      "Built with your wellness in mind, featuring tailored insights and adaptive support.",
    icon: Brain,
    className: "col-span-1",
    bg: "from-sky-500/10 via-blue-500/10 to-indigo-500/10",
    points: ["Adaptive guidance", "Actionable insights"],
  },
  {
    title: "Privacy First",
    description:
      "Your mental health data is protected with enterprise-grade security and complete confidentiality.",
    icon: Shield,
    className: "col-span-1",
    bg: "from-slate-500/10 via-zinc-500/10 to-stone-500/10",
    points: ["Encrypted storage", "Privacy by default"],
  },
];

export default function Features() {
  return (
    <section className="bg-background py-24" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Comprehensive Wellness Support
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            Everything you need to nurture your mental health and build lasting emotional resilience.
          </p>
        </motion.div>

        <BentoGrid className="mt-12 grid-cols-1 auto-rows-[16rem] gap-4 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.2 }}
              className={feature.className}
            >
              <Card className="group relative h-full overflow-hidden border-border/60 bg-card/80 p-6 backdrop-blur-sm">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg}`} />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
                </div>

                <div className="relative flex h-full flex-col justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/70">
                    <feature.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {feature.points.map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
