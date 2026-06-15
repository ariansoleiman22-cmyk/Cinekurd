"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function IntroSplash() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Show the cinematic intro once per browser session.
    if (sessionStorage.getItem("ck-intro") === "1") {
      setShow(false);
      return;
    }
    sessionStorage.setItem("ck-intro", "1");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 500 : 1800;
    const fade = 650;
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, hold + fade);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 650);
  };

  return (
    <div
      onClick={dismiss}
      role="presentation"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-opacity duration-[650ms] ease-out",
        leaving ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute h-80 w-80 animate-pulse rounded-full bg-gold/10 blur-3xl" />
      <Image
        src="/cinekurd-logo.png"
        alt="Cine Kurd"
        width={2364}
        height={1330}
        priority
        className="animate-intro relative h-auto w-[min(82vw,560px)]"
      />
    </div>
  );
}
