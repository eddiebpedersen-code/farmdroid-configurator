import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ToastProvider } from '@/components/ui/toast';
import { ModeProvider } from '@/contexts/ModeContext';
import "../globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const metadata = messages.metadata as { title?: string; description?: string } | undefined;

  return {
    title: metadata?.title || 'FarmDroid Configurator',
    description: metadata?.description || 'Configure your FarmDroid FD20 robot',
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map(loc => [loc, `/${loc}/configurator`])
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        {/* hreflang tags for SEO */}
        {routing.locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`/${loc}/configurator`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href="/en/configurator" />
      </head>
      <body className="antialiased bg-stone-50 min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <ModeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ModeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
