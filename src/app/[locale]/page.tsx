import { Button } from "@/components/ui/button";
import Image from "next/image";
import {Link} from "@/i18n/navigation";
import {Hero} from "@/components/blocks/landing/hero";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <Hero />
        <h2 className="w-full text-center text-xl font-semibold">{t('title')}</h2>

        <div className="flex gap-4 items-center justify-center w-full mt-8">
          <Link href="/auth/login">
            <Button>{t('login')}</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary">{t('signup')}</Button>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/shop"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          {t('browse')}
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/terms-conditions"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          {t('terms')}
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about-us"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          {t('about')} →
        </Link>
      </footer>
    </div>
  );
}
