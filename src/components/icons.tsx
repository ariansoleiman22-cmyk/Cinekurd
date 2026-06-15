import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/** Aperture mark used as the Cine Kurd logo glyph. */
export function Aperture(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3l4.5 7.8M21 12h-9M16.5 19.8L12 12M7.5 19.8L12 12M3 12h9M7.5 4.2L12 12" />
    </svg>
  );
}

export function Camera(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H13a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16z" />
      <path d="M14.5 11l5-2.5v8L14.5 14" />
      <circle cx="8.5" cy="6" r="1.6" />
      <circle cx="11.6" cy="5.4" r="1.2" />
    </svg>
  );
}

export function Lens(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
    </svg>
  );
}

export function Light(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 17h6M10 20h4" />
      <path d="M12 3a6 6 0 0 1 3.5 10.9c-.6.4-1 .9-1 1.6H9.5c0-.7-.4-1.2-1-1.6A6 6 0 0 1 12 3z" />
      <path d="M12 3V1.5M4.6 6l-1-1M19.4 6l1-1" />
    </svg>
  );
}

export function Accessories(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 7v13M12 7l-4.5 13M12 7l4.5 13" />
      <circle cx="12" cy="5" r="2" />
      <path d="M6 21h12" />
    </svg>
  );
}

export function Brands(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.9 6.2 21l1.1-6.5L2.6 9.9l6.5-.95z" />
    </svg>
  );
}

export function Bolt(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Chat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12a7 7 0 0 1-9.9 6.4L4 20l1.6-6A7 7 0 1 1 20 12z" />
      <path d="M9 11h6M9 14h4" />
    </svg>
  );
}

export function Globe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Bell(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function Send(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
}

export const categoryIcons = {
  camera: Camera,
  lens: Lens,
  light: Light,
  accessories: Accessories,
  brands: Brands,
} as const;
