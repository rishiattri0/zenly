"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Link from "next/link";
import { ArrowRight, Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <>
      <main className="overflow-hidden">
        <section className="relative">
          <div className="relative py-24 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-12">
              <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                <Link
                  href="/"
                  className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3"
                >
                  <span className="text-sm">About Us</span>
                  <span className="bg-(--color-border) block h-4 w-px"></span>

                  <ArrowRight className="size-4" />
                </Link>

                <h1 className="mt-8 text-4xl font-extrabold md:text-5xl xl:text-7xl xl:[line-height:1.125]">
                  ZENLY
                </h1>
                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                  An AI-powered wellness companion that listens, supports, and
                  helps you track your journey.
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                  An AI-powered wellness companion that listens, supports, and
                  helps you track your journey.
                </p>

                <div className="mt-8">
                  <Button size="lg" asChild>
                    <Link href="#">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Start Expressing</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="x-auto relative mx-auto mt-8 max-w-lg sm:mt-12">
                <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
                <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-blue-300 blur-3xl dark:bg-white/20"></div>

                <Swiper
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  loop
                  autoplay={{ delay: 5000 }}
                  modules={[Autoplay, EffectCoverflow]}
                >
                  <SwiperSlide className="px-2">
                    <div className="bg-background rounded-lg h-44 max-w-lg border flex items-center justify-center p-6 text-center">
                      <p className="text-xl font-semibold">
                        Take 5 minutes to breathe deeply 🌿
                      </p>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="px-2">
                    <div className="bg-background rounded-lg h-44 max-w-lg border flex items-center justify-center p-6 text-center">
                      <p className="text-xl font-semibold">
                        Journaling reduces stress ✍️
                      </p>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="px-2">
                    <div className="bg-background rounded-lg h-44 max-w-lg border flex items-center justify-center p-6 text-center">
                      <p className="text-xl font-semibold">
                        Small steps create lasting change 💙
                      </p>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
