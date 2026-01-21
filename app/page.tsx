"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

// Root page redirects to the default locale, preserving query parameters
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Preserve query parameters when redirecting
    const queryString = window.location.search;
    router.replace(`/${defaultLocale}/configurator${queryString}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-stone-400">Loading...</div>
    </div>
  );
}
