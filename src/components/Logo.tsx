import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

export function Logo({
  lang,
  className = "",
  size = "md",
}: {
  lang: Locale;
  className?: string;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? 40 : 52;
  return (
    <Link
      href={`/${lang}`}
      aria-label="Cine Kurd — Home"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src="/cinekurd-mark.png"
        alt="Cine Kurd"
        width={1087}
        height={957}
        style={{ height: px, width: "auto" }}
        className="block w-auto select-none"
      />
    </Link>
  );
}
