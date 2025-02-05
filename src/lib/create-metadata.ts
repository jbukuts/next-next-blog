import type { Metadata } from 'next';
import merge from 'lodash/merge';
import siteConfig from '../../site.config';

const {
  PORT = 3000,
  NODE_ENV,
  VERCEL_URL,
  NEXT_PUBLIC_BASE_PATH = ''
} = process.env;
const IS_DEV = NODE_ENV === 'development';

const {
  siteTitle,
  siteDescription,
  image,
  profile: { twitterHandle }
} = siteConfig;

export const baseMetadata = {
  metadataBase: new URL(
    IS_DEV
      ? `http://localhost:${PORT}`
      : `https://${VERCEL_URL}${NEXT_PUBLIC_BASE_PATH}`
  ),
  title: {
    template: `${siteTitle} - %s`,
    default: siteDescription
  },
  description: siteDescription,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    siteName: siteTitle,
    title: {
      template: `${siteTitle} - %s`,
      default: siteDescription
    },
    url: '/',
    locale: 'en_US',
    description: siteDescription,
    images: image
  },
  twitter: {
    card: 'summary',
    title: {
      template: `${siteTitle} - %s`,
      default: siteDescription
    },
    description: siteDescription,
    creator: twitterHandle,
    images: image
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large'
    }
  }
} as const satisfies Metadata;

// Object.freeze(baseMetadata);

export default function createMetadata(metadata: Metadata): Metadata {
  return merge(JSON.parse(JSON.stringify(baseMetadata)), metadata);
}
