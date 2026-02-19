"use client";

import React from "react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { useSession } from "@/lib/contexts/session-context";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuState, setMenuState] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, signOut } = useSession();

  const hideNavbar = pathname?.startsWith("/chat");
  if (hideNavbar) return null;

  const isLanding = pathname === "/";
  const showNavLinks = isLanding;

  const handleSignOut = () => {
    setMenuState(false);
    Promise.resolve(signOut()).then(() => router.push("/"));
  };

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full border-b border-solid bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <p className="font-extrabold text-2xl md:text-4xl">ZENLY</p>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              {showNavLinks && (
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            const element = document.querySelector(item.href);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                            setMenuState(false);
                          }}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <AnimatedThemeToggler />

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                {!loading &&
                  (isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuState(false)}
                        >
                          <LayoutDashboard className="size-4" />
                          <span>Dashboard</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="size-4" />
                        <span>Sign out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={
                            pathname === "/dashboard"
                              ? "/login?redirect=/dashboard"
                              : "/login"
                          }
                        >
                          <span>Login</span>
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link
                          href={
                            pathname === "/dashboard"
                              ? "/signup?redirect=/dashboard"
                              : "/signup"
                          }
                        >
                          <span>Sign up</span>
                        </Link>
                      </Button>
                    </>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
