import Image from "next/image";
import { cn } from "@/lib/utils";
import { categoryIcons } from "./icons";
import type { Category } from "@/lib/catalog";

// Shows the admin-uploaded photo when present, otherwise an elegant gradient placeholder.
// `zoom` enables a slow hover zoom when the media sits inside a `group`.
export function ProductMedia({
  category,
  watermark,
  imageUrl,
  alt,
  zoom = false,
  sizes = "(max-width: 768px) 100vw, 400px",
  className,
}: {
  category: Category;
  watermark?: string;
  imageUrl?: string | null;
  alt?: string;
  zoom?: boolean;
  sizes?: string;
  className?: string;
}) {
  const Icon = categoryIcons[category] ?? categoryIcons.camera;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-surface-2 to-charcoal",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt ?? watermark ?? ""}
          fill
          sizes={sizes}
          className={cn(
            "object-cover",
            zoom &&
              "transition-transform duration-700 ease-out will-change-transform group-hover:scale-110",
          )}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(201,162,75,0.18),transparent_60%)]" />
          <Icon
            className={cn(
              "relative h-1/3 w-1/3 max-h-24 max-w-24 text-gold/30",
              zoom &&
                "transition-transform duration-700 ease-out group-hover:scale-110",
            )}
          />
          {watermark && (
            <span className="absolute bottom-3 end-4 font-display text-sm tracking-wide text-cream/20">
              {watermark}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Brand tile: shows the brand's first letter as a monogram.
export function BrandMedia({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-surface-2 to-charcoal",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,162,75,0.16),transparent_60%)]" />
      <span className="relative font-display text-5xl text-gold-gradient">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
