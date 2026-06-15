import Link from "next/link";
import { Aperture } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="bg-aurora grain relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <Aperture className="h-16 w-16 text-gold/40" />
      <h1 className="mt-6 font-display text-6xl text-gold-gradient">404</h1>
      <p className="mt-3 text-muted">This page could not be found.</p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-white/15 px-7 py-3 text-sm text-cream/90 transition-colors hover:border-gold/50 hover:text-cream"
      >
        Back to home
      </Link>
    </div>
  );
}
