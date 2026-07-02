# PicZip Google SEO Launch Checklist

## Done in the codebase

- `robots.txt` allows crawling and points to `https://piczip.app/sitemap.xml`.
- `sitemap.xml` includes all English and Chinese routes.
- `sitemap.xml` includes `hreflang` alternates for English, Chinese, and `x-default`.
- Core pages have unique titles, descriptions, canonical URLs, and language alternates.
- FAQ pages include `FAQPage` JSON-LD.
- Home pages include `WebApplication` JSON-LD.
- About pages include the support email: `support@piczip.app`.
- The public footer no longer links to the XML sitemap.
- The browser tab icon is available at `/icon.svg`.

## Manual Google Search Console steps

1. Open Google Search Console.
2. Add a Domain property for `piczip.app`.
3. Add the DNS TXT record provided by Google.
4. Verify the domain.
5. Submit `https://piczip.app/sitemap.xml`.
6. Use URL Inspection for these URLs:
   - `https://piczip.app/`
   - `https://piczip.app/compress-image-to-100kb`
   - `https://piczip.app/compress-jpg`
   - `https://piczip.app/batch-image-compressor`
   - `https://piczip.app/zh`

## Post-launch checks

1. Confirm Vercel production uses `NEXT_PUBLIC_SITE_URL=https://piczip.app`.
2. Run PageSpeed Insights for desktop and mobile.
3. Check Search Console indexing after 3-7 days.
4. Watch early queries in Search Console and use them to improve landing page copy.
5. Add 2-3 practical English guide articles per week for the first two months.

## First content targets

- How to compress an image to 100KB without uploading
- JPG vs PNG vs WebP for image compression
- How to reduce image size for email attachments
- How to batch compress images for a website
- Why PNG files sometimes become larger after compression
