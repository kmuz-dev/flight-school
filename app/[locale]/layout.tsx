import { LOCALES, RTL_LOCALES, isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div lang={locale} dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
