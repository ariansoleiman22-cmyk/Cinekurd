import type { Metadata } from "next";
import { Inter, Playfair_Display, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiveProvider } from "@/components/LiveProvider";
import { IntroSplash } from "@/components/IntroSplash";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/messaging";
import { markNotificationsReadAction } from "@/lib/actions/messaging";
import { isLocale, dirFor } from "@/i18n/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

// Run server functions in Tokyo (hnd1) — next to the Supabase database (ap-northeast-1)
// so database round-trips are fast instead of crossing continents.
export const preferredRegion = "hnd1";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: {
      default: `Cine Kurd — ${dict.brand.tagline}`,
      template: "%s · Cine Kurd",
    },
    description: dict.hero.subtitle,
    openGraph: {
      title: "Cine Kurd",
      description: dict.hero.subtitle,
      siteName: "Cine Kurd",
      type: "website",
      locale: lang,
    },
    twitter: {
      card: "summary_large_image",
      title: "Cine Kurd",
      description: dict.hero.subtitle,
    },
    alternates: {
      languages: { en: "/en", ar: "/ar", ckb: "/ckb" } as Record<
        string,
        string
      >,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const dir = dirFor(lang);
  const skipLabel =
    (
      {
        en: "Skip to content",
        ar: "تخطّ إلى المحتوى",
        ckb: "بازبدە بۆ ناوەڕۆک",
      } as Record<string, string>
    )[lang] ?? "Skip to content";
  const user = await getCurrentUser();

  const [initialNotifications, initialUnread] = user
    ? await Promise.all([
        getNotifications(user.id),
        getUnreadNotificationCount(user.id),
      ])
    : [[], 0];
  const clientNotifications = initialNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    data: n.data,
    href: n.href,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <html
      lang={lang}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} ${vazir.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-ink text-cream antialiased">
        <IntroSplash />
        <a href="#main-content" className="skip-link">
          {skipLabel}
        </a>
        <LiveProvider
          enabled={Boolean(user)}
          initialNotifications={clientNotifications}
          initialUnread={initialUnread}
          markReadAction={markNotificationsReadAction}
        >
          <Header
            lang={lang}
            dict={dict}
            user={user ? { name: user.name, role: user.role } : null}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} dict={dict} />
        </LiveProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
