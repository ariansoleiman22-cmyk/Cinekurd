import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-muted"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-cream/80">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="text-muted-dark">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}
