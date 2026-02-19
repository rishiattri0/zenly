"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, signOut } = useSession();

  if (pathname?.startsWith("/chat")) return null;

  const isLanding = pathname === "/";
  const isDashboard = pathname?.startsWith("/dashboard");

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    closeMenu();
  };

  const handleSignOut = () => {
    closeMenu();
    Promise.resolve(signOut()).then(() => router.push("/"));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
        <nav className="rounded-2xl border border-border/70 bg-background/85 backdrop-blur-xl shadow-sm">
          <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" aria-label="home" className="shrink-0">
                <p className="text-xl font-extrabold tracking-tight sm:text-2xl">ZENLY</p>
              </Link>
            </div>

            {isLanding && (
              <ul className="hidden items-center gap-6 lg:flex">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.href)}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="hidden items-center gap-2 lg:flex">
              <AnimatedThemeToggler />
              {!loading &&
                (isAuthenticated ? (
                  <>
                    {!isDashboard ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard">
                          <LayoutDashboard className="size-4" />
                          <span>Dashboard</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/chat">
                          <MessageSquare className="size-4" />
                          <span>Chat</span>
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="size-4" />
                      <span>Sign out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/login">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/signup">
                        <span>Sign up</span>
                      </Link>
                    </Button>
                  </>
                ))}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <AnimatedThemeToggler />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "overflow-hidden border-t border-border/60 transition-[max-height] duration-300 lg:hidden",
              menuOpen ? "max-h-[420px]" : "max-h-0"
            )}
          >
            <div className="space-y-5 px-4 py-4 sm:px-5">
              {isLanding && (
                <ul className="grid grid-cols-2 gap-2">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.href)}
                        className="w-full rounded-lg border border-border/60 px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && (
                <div className="grid grid-cols-2 gap-2">
                  {isAuthenticated ? (
                    <>
                      {!isDashboard ? (
                        <Button asChild variant="outline" size="sm" onClick={closeMenu}>
                          <Link href="/dashboard">
                            <LayoutDashboard className="size-4" />
                            <span>Dashboard</span>
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm" onClick={closeMenu}>
                          <Link href="/chat">
                            <MessageSquare className="size-4" />
                            <span>Chat</span>
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="size-4" />
                        <span>Sign out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" size="sm" onClick={closeMenu}>
                        <Link href="/login">
                          <span>Login</span>
                        </Link>
                      </Button>
                      <Button asChild size="sm" onClick={closeMenu}>
                        <Link href="/signup">
                          <span>Sign up</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
