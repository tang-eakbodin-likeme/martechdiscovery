import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import DemoVendorLogin from '@/components/DemoVendorLogin';
import { isLocale, localeParams, pick } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: pick(locale, 'Sign in', 'เข้าสู่ระบบ') };
}

export default async function LoginPage({ params }: Props) {
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
        <span className="badge">Account</span>
        <div id="login-panel">
          <h1>{t('Sign in', 'เข้าสู่ระบบ')}</h1>
          <p className="auth-note">{t('Sign in to save MarTech vendors or access the back office based on your role.', 'เข้าสู่บัญชีเพื่อเก็บรายการ MarTech ที่สนใจ หรือเปิดพื้นที่หลังบ้านตามสิทธิ์ของคุณ')}</p>
          <LoginForm locale={locale} />
        </div>
        <DemoVendorLogin locale={locale} />
      </section>
    </main>
  );
}
