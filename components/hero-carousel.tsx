"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

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
    description: "Always here to listen and support your journey"
  },
  {
    title: "Support When You Need It Most",
    description: "Compassionate AI conversations anytime, anywhere"
  },
  {
    title: "Small Steps Toward a Healthier Mind",
    description: "Track your mood and celebrate your progress"
  },
  {
    title: "Find Your Inner Peace",
    description: "Mindfulness tools for emotional balance"
  },
  {
    title: "You're Not Alone on This Journey",
    description: "Join thousands finding strength through connection"
  }
];

export default function HeroCarousel({ 
  slides = defaultSlides, 
  autoplayDelay = 4000,
  className = ""
}: HeroCarouselProps) {
  return (
    <div className={`relative mx-auto mt-8 max-w-lg sm:mt-12 ${className}`}>
      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: autoplayDelay }}
        modules={[Autoplay, EffectCoverflow]}
        effect="coverflow"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="px-2 cursor-pointer">
            <div className="bg-background backdrop-blur-sm border rounded-lg h-48 max-w-lg flex items-center justify-center p-6 text-center shadow-lg">
              <div className="space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  {slide.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {slide.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
