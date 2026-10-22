# Compact tool-page introduction

Replaced the stacked badge, oversized centered title/description and separate proof row with shared `ToolIntro` across English/Chinese homepages, resize/convert/stitch pages and compression landing pages. Desktop uses a left-aligned 28–36 px heading and description with a compact assurance column; mobile wraps assurances into one flow. Existing titles, descriptions and landing-page bullet content remain in the page. Article templates and pre-existing SEO working files are untouched.

At 1440 px, Chinese homepage tool starts at y=211 instead of y=375 (164 px earlier); at 375 px, y=242 instead of y=331 (89 px earlier). Sampled tool and landing pages save 84–182 px depending on viewport/content.

Validation: lint and production build passed. Chromium and WebKit each verified seven representative routes at desktop/mobile widths (28 checks total), with one H1, a shared intro, no horizontal overflow and no unhandled page errors in isolated page checks. Desktop/mobile screenshots are saved here. The 14 pre-existing SEO file SHA-256 hashes are unchanged. Current local preview runs on port 3101. Pre-existing SEO changes are excluded from the feature commit.
