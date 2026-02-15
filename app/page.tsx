import HeroSection from "@/components/hero-section";
import { TextReveal } from "@/components/magicui/text-reveal";
import Features from "@/components/features-1";
import StatsSection from "@/components/stats";
import WallOfLoveSection from "@/components/testimonials";
import FooterSection from "@/components/footer";
import ContentSection from "@/components/content-5";
import CallToAction from "@/components/call-to-action";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TextReveal>Healing is not about becoming someone new.</TextReveal>
      <Features />
      <ContentSection />
      <StatsSection />
      <WallOfLoveSection />
      <CallToAction />
      <FooterSection />
    </div>
  );
}
