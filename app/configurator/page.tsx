import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

// Non-localized configurator page redirects to the localized version
export default function ConfiguratorPage() {
  redirect(`/${defaultLocale}/configurator`);
}
