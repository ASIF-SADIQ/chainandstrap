export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/checkout/', '/account/'],
    },
    sitemap: 'https://chainandstrap.store/sitemap.xml',
  }
}
