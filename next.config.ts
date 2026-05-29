import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  experimental: {
    authInterrupts: true,
  }
}

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
