import type { Spec } from "@/lib/catalog";

export function SpecList({ specs }: { specs: Spec[] }) {
  if (!specs?.length) return null;
  return (
    <dl className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/8">
      {specs.map((spec, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <dt className="text-sm text-muted">{spec.label}</dt>
          <dd className="text-end text-sm font-medium text-cream">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
