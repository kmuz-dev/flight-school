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
  /*
    lang and dir sit on a wrapper, not on <html>, and that is a constraint
    rather than an oversight. The root layout owns <html>, it lives above this
    dynamic segment, and Next passes it no params - so on a static export there
    is no build-time way to vary the document element per locale short of making
    [locale] the root segment, which would mean the site has no "/" to redirect
    from.

    What that costs is the scrollbar side in Arabic. What it does NOT cost is
    anything a cadet reads: `dir` is a global attribute, every logical property
    below resolves against it, and assistive tech pronounces content using the
    nearest `lang` - which is this one, since all content is inside. If that
    ever stops being true, the fix is routing, not a script that mutates <html>
    after parse.
  */
  return (
    <div lang={locale} dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
