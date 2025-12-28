import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://woningspotters.nl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/debug/', '/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
