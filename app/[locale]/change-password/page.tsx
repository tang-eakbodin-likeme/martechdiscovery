import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'Change temporary password', 'เปลี่ยนรหัสผ่านชั่วคราว') };
}

export default async function ChangePasswordPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = (en: string, th: string) => pick(locale, en, th);
  return (
    <main id="main" className="auth-wrap">
      <Link className="brand" href={`/${locale}/`}>
        {/* MarTech Expo 2027 wordmark: light letters on the dark theme, dark letters on the light theme */}
        <img className="expo-logo on-dark" src="/assets/brand/martech-expo-logo.png" alt="MarTech Expo" width={260} height={32} />
        <img className="expo-logo on-light" src="/assets/brand/martech-expo-logo-dark.png" alt="MarTech Expo" width={260} height={32} />
        <span className="brand-name">Discovery</span>
      </Link>
      <section className="auth-card">
        <span className="badge">FIRST SIGN-IN</span>
        <h1>{t('Set a new password', 'ตั้งรหัสผ่านใหม่')}</h1>
        <p>{t('Your temporary password worked. Set a new password with at least 8 characters before continuing.', 'ล็อกอินด้วยรหัสผ่านชั่วคราวสำเร็จแล้ว กรุณาตั้งรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษรก่อนเข้าสู่ระบบ')}</p>
        <ChangePasswordForm locale={locale} />
      </section>
    </main>
  );
}
