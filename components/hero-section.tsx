"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Rocket, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ripple } from "@/components/magicui/ripple";
import HeroCarousel from "@/components/hero-carousel";

export default function HeroSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/session", { credentials: "include" })
      .then(async (res) => {
        if (mounted) {
          setIsAuthenticated(res.ok);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <main className="overflow-hidden">
        <section className="relative">
          <div className="relative py-24 lg:py-28 z-10">
            <div className="mx-auto max-w-7xl px-6 md:px-12">
              <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                <h1 className="mt-8 text-5xl font-extrabold md:text-5xl xl:text-7xl xl:[line-height:1.125]">
                  ZENLY
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-wrap text-lg sm:block">
                  An AI-powered wellness companion that listens, supports, and
                  helps you track your journey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="overflow-hidden">
      <section className="relative">
        {/* Ripple background */}
        <Ripple className="absolute inset-0 -z-10" />

        <div className="relative py-24 lg:py-28 z-10">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
              <Link
                href="/#about"
                className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3"
              >
                <span className="text-sm">About Us</span>
                <span className="bg-(--color-border) block h-4 w-px"></span>
                <ArrowRight className="size-4" />
              </Link>

              <h1 className="mt-8 text-5xl font-extrabold md:text-5xl xl:text-7xl xl:[line-height:1.125]">
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

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Get started</span>
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/signup">
                        <Rocket className="relative size-4" />
                        <span className="text-nowrap">Get started</span>
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/login">
                        <User className="size-4" />
                        <span className="text-nowrap">Sign in</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Carousel */}
            <HeroCarousel />
          </div>
        </div>
      </section>
    </main>
  );
}
