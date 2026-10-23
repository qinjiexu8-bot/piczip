# Spanish, Brazilian Portuguese and Japanese

Scope: homepage/compressor, resize, convert, stitch and FAQ, including controls, status, validation, comparison and shared navigation. Keep the existing English and Chinese URLs and behavior. Do not modify the protected SEO files or commit/deploy without a request.

Use typed locale configuration, shared dictionaries and three statically generated locale prefixes (`es`, `pt-br`, `ja`). Reuse tool processing and components; do not duplicate processing logic. A language chooser links to the same page in each available language. Untranslated article destinations are explicitly unavailable in the chooser; guide/legal links from new pages are marked English. Reuse the existing footer for English/Chinese and add a separate translated footer for new locales to preserve the pending footer changes byte-for-byte.

Steps: extract translations; extend route helpers; localize components and status/error paths; add pages and metadata; validate all locale/page combinations, real outputs, language switching, keyboard/mobile navigation and untranslated destinations. Check the existing SEO manifest before/after. Keep the existing sitemap source untouched.

## Verification completed

- Production build: 71 generated pages, including 15 new locale pages. ESLint and TypeScript pass.
- Existing processing unit tests: 18 pass. Existing English/Chinese compression, tools and homepage browser tests: 19 pass.
- `tests/e2e/locales.test.mjs`: six cases pass in Chromium and WebKit. Covers all 15 new URLs at desktop/mobile widths; all five menu destinations; actual language-link navigation preserving the current page; canonical and language metadata; FAQ; four real processing operations, output dimensions/types, downloads and localized errors.
- All 15 new URLs appear in the generated sitemap through the shared route catalog; the sitemap source itself is unchanged. Unknown locale/tool paths return 404.
- Visual review: Spanish, Brazilian Portuguese and Japanese homepages at 375px/1440px. Shortened the automatic-format label for narrow screens and added Japanese font fallbacks.
- Fixed WebKit's null-relatedTarget blur behavior so selecting a language cannot close the menu before its click is delivered. Test navigation lets speculative RSC requests settle before forcing another full document navigation; otherwise WebKit can report cancelled prefetch requests as access-control errors during rapid test navigation (also observed in earlier guide QA).
- SHA-256 checks confirm all 14 existing SEO files remain byte-for-byte unchanged. No commit or deployment performed.
