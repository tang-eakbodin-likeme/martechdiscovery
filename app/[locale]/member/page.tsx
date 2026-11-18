import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MemberShortlist } from '@/components/MemberShortlist';
import { Breadcrumbs, Eyebrow } from '@/components/SiteChrome';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'Your shortlist', 'Shortlist ของคุณ'), robots: { index: false } };
}

export default async function MemberPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main className="member-wrap">
      <Breadcrumbs locale={locale} trail={[{ label: t('Member', 'สมาชิก') }]} />
      <Eyebrow>{t('Member account', 'บัญชีสมาชิก')}</Eyebrow>
      <MemberShortlist locale={locale} />
    </main>
  );
}
