"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./NotificationBell";
import { Menu, Close, Chat } from "./icons";

const CATEGORY_KEYS = ["camera", "lens", "light", "accessories"] as const;

export type HeaderUser = { name: string; role: string } | null;

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function Header({
  lang,
  dict,
  user,
}: {
  lang: Locale;
  dict: Dictionary;
  user: HeaderUser;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = CATEGORY_KEYS.map((key) => ({
    key,
    label: dict.nav[key],
    href: `/${lang}/${key}`,
  }));

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? "glass border-b border-white/5" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <Logo lang={lang} />

        <nav className="ms-auto hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="group relative text-sm tracking-wide text-cream/80 transition-colors hover:text-cream"
            >
              {link.label}
              <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 sm:gap-3 lg:ms-8">
          <LanguageSwitcher lang={lang} />

          {user && (
            <>
              <Link
                href={`/${lang}/messages`}
                aria-label={dict.messages.link}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/80 transition-colors hover:border-gold/40 hover:text-cream sm:flex"
              >
                <Chat className="h-5 w-5" />
              </Link>
              <NotificationBell lang={lang} dict={dict} />
              {user.role === "admin" && (
                <Link
                  href={`/${lang}/admin`}
                  className="hidden rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink lg:inline-block"
                >
                  {dict.admin.title}
                </Link>
              )}
            </>
          )}

          {user ? (
            <Link
              href={`/${lang}/account`}
              className="hidden items-center gap-2 rounded-full border border-white/10 py-1.5 pe-4 ps-1.5 text-sm text-cream/85 transition-colors hover:border-gold/40 hover:text-cream sm:flex"
            >
              <Avatar name={user.name} />
              {firstName}
            </Link>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="hidden rounded-full border border-gold/40 px-5 py-2 text-sm text-gold transition-all hover:bg-gold hover:text-ink sm:inline-block"
            >
              {dict.header.login}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict.header.menu}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/80 transition-colors hover:border-gold/40 hover:text-cream lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/95 backdrop-blur-xl animate-fade"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full flex-col">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8">
              <Logo lang={lang} size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.header.close}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-cream/80 hover:border-gold/40 hover:text-cream"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-8">
              {links.map((link, index) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="animate-rise font-display text-3xl text-cream/90 transition-colors hover:text-gold"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-8 pb-12">
              <div className="gold-divider mb-6" />
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/${lang}/account`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-cream"
                    >
                      <Avatar name={user.name} />
                      {dict.header.account}
                    </Link>
                    <SignOutButton
                      lang={lang}
                      label={dict.auth.account.signOut}
                      className="rounded-full border border-white/15 px-5 py-2 text-sm text-cream/80 hover:border-gold/50 hover:text-cream"
                    />
                  </div>
                  <Link
                    href={`/${lang}/messages`}
                    onClick={() => setOpen(false)}
                    className="block rounded-full border border-white/15 py-3 text-center text-sm text-cream/80 hover:border-gold/40 hover:text-cream"
                  >
                    {dict.messages.link}
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href={`/${lang}/admin`}
                      onClick={() => setOpen(false)}
                      className="block rounded-full border border-gold/40 py-3 text-center text-sm text-gold hover:bg-gold hover:text-ink"
                    >
                      {dict.admin.title}
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  href={`/${lang}/login`}
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-gold py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-gold-light"
                >
                  {dict.header.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
