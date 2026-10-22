# Typography update

Observed live computed CSS on 2026-10-22:

| Reference | Body | Main heading |
| --- | --- | --- |
| [iLoveIMG](https://www.iloveimg.com/) | Graphik, Arial, sans-serif; 400 | Graphik; 600 |
| [TinyPNG](https://tinypng.com/) | Noto Sans; 400 | Noto Sans; 700 |
| [Squoosh](https://squoosh.app/) | HelveticaNeue-Light / Helvetica Neue / Helvetica / Arial system stack | Same sans stack; 700 |

PicZip now uses Noto Sans through next/font in both locale layouts, with PingFang SC, Microsoft YaHei and Noto Sans CJK SC fallbacks for Chinese. Web font assets are served by the site; no runtime Google Fonts request or full CJK webfont download. All former Georgia/serif headings use the shared sans stack. Tool titles use 650 weight; section titles use 600. Chinese headings have normal character spacing. Numeric fields and result sizes use tabular numerals. Content and guide titles are sized and spaced for sans-serif text.

Validation: lint, production build and 32 Chromium/WebKit page/viewport checks passed (eight routes, desktop/mobile, both engines). Actual Noto Sans loading and computed font families verified; no horizontal overflow or unhandled page errors. Screenshots and computed styles are saved here. All 14 pre-existing SEO working files remain byte-identical. Pre-existing SEO changes are excluded from this typography commit.
