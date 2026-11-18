import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Header } from '@/components/SiteChrome';
import { isLocale, localeParams } from '@/lib/i18n';

export const generateStaticParams = localeParams;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: { default: 'MarTech Discovery Platform', template: '%s | MarTech Discovery Platform' },
  description: 'An independent directory of MarTech vendors in Thailand and Southeast Asia.',
  metadataBase: new URL('https://martech-discovery-platform.pages.dev'),
};

// Applies the saved theme before paint so the page does not flash the wrong colours.
const themeScript = `try{var p=JSON.parse(localStorage.getItem('mdp-site-config-v1')||'{}');document.documentElement.dataset.theme=p.theme||localStorage.getItem('mdp-theme')||'dark'}catch(e){}`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Plain stylesheets: styles.css has mid-file @import rules that Next.js CSS cannot bundle. */}
        <link rel="stylesheet" href="/styles.css" precedence="base" />
        <link rel="stylesheet" href="/site.css" precedence="site" />
      </head>
      <body className="site">
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
