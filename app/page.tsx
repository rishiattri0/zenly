import HeroSection from "@/components/hero-section";
import Image from "next/image";
import { TextReveal } from "@/components/magicui/text-reveal";
import { div } from "motion/react-client";
import Features from "@/components/features-1";
import StatsSection from "@/components/stats";
import WallOfLoveSection from "@/components/testimonials";
import FooterSection from "@/components/footer";
import ContentSection from "@/components/content-5";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TextReveal>Healing is not about becoming someone new.</TextReveal>
      <Features />
      <ContentSection />
      <StatsSection />
      <WallOfLoveSection />
      <FooterSection />
    </div>
  );
}
