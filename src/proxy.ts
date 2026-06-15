import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Pick the best locale from the cookie, then the Accept-Language header.
function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().toLowerCase());
    for (const tag of preferred) {
      const base = tag.split("-")[0];
      const match = locales.find((l) => l === tag || l === base);
      if (match) return match;
    }
  }
  return defaultLocale;
}

// Renamed from `middleware` in Next.js 16: ensure every path is locale-prefixed.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) {
    // Edge guard: send signed-out visitors away from protected sections before
    // any rendering (optimistic cookie check; the page still verifies the session).
    const segments = pathname.split("/");
    const lang = segments[1];
    const section = segments[2];
    const isProtected = section === "account" || section === "admin";
    if (isProtected && !request.cookies.get("cine_session")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${lang}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Run on everything except Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
