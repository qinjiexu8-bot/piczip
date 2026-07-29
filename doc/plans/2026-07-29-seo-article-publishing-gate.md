# SEO Article Publishing Gate Implementation Plan

> **For Codex:** Use the Code, SEO, and SEO Content Writer workflows to implement this plan task by task.

**Goal:** Publish three English-first, long-tail PicZip guides only after each guide has original test evidence, useful screenshots, and a passing quality report.

**Architecture:** Draft content, evidence, and QA reports remain in `doc/content/` and are not routable. Approved articles are represented in typed content data and rendered through a shared article component. Only approved entries are exposed through Next.js routes, internal links, metadata, and the sitemap.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, static metadata, JSON-LD

---

## Task 1: Establish the publishing standard

**Files:**

- Create: `doc/content-publishing-standard.md`

**Steps:**

1. Record the one-problem-per-page and long-tail keyword rules.
2. Define the first-hand test and screenshot requirements.
3. Define hard blockers and the 30-point quality score.
4. Define draft, approval, release, and post-publish states.
5. Verify that no standard encourages keyword stuffing, arbitrary word counts, or scaled near-duplicate pages.

## Task 2: Prepare the first three content briefs

**Files:**

- Create: `doc/content/compress-image-to-100kb-without-uploading/brief.md`
- Create: `doc/content/compress-image-to-200kb-for-online-forms/brief.md`
- Create: `doc/content/reduce-image-size-for-email-attachments/brief.md`

**Steps:**

1. Assign one primary keyword and intent to each article.
2. Map each article to its relevant existing tool page.
3. Document likely cannibalization risks.
4. State the unique experiment and conclusion each article must provide.
5. Confirm that the three pages solve distinct problems.

## Task 3: Collect reproducible evidence

**Files:**

- Create: `doc/content/<slug>/test-record.md`
- Create: `public/guides/<slug>/<descriptive-screenshot>.webp`

**Steps:**

1. Prepare a privacy-safe test image with a documented origin.
2. Run the test in a production-equivalent PicZip build.
3. Record the source dimensions and exact byte size.
4. Record every PicZip setting.
5. Record the output dimensions and exact byte size.
6. Capture at least two screenshots proving setup and result.
7. Repeat a failed or limited case when it materially helps answer the query.
8. Verify that screenshots contain no personal information.

## Task 4: Write articles as non-public drafts

**Files:**

- Create: `doc/content/<slug>/draft.md`

**Steps:**

1. Answer the query in the first 100 words.
2. Write the tested result before general advice.
3. Add numbered instructions matching the screenshots.
4. Explain trade-offs and limitations.
5. Add only relevant FAQs.
6. Add a contextual call to action to the matching PicZip tool.
7. Remove filler, unsupported superlatives, repeated conclusions, and generic AI-style phrasing.

## Task 5: Run editorial and factual QA

**Files:**

- Create: `doc/content/<slug>/qa-report.md`

**Steps:**

1. Compare every number in the draft with the test record.
2. Verify screenshot captions and alt text.
3. Verify the article resolves one problem completely.
4. Check that the article does not compete with an existing tool or guide page.
5. Complete every hard-blocker checkbox.
6. Score all six quality categories.
7. Keep the status as `Failed` until every blocker passes and the score is at least 25/30 with no category below 4.

## Task 6: Build the approved article system

**Files:**

- Create: `src/components/site/GuideArticlePage.tsx`
- Create: `src/lib/seo/articles.ts`
- Modify: `src/components/site/ContentPage.tsx`
- Modify: `src/lib/seo/metadata.ts`

**Steps:**

1. Define typed approved-article metadata.
2. Render author, published date, verified date, test note, captions, and correction contact.
3. Add Article and HowTo JSON-LD based only on visible content.
4. Support useful screenshot dimensions to prevent layout shift.
5. Generate metadata without advertising nonexistent language alternatives.
6. Run lint and TypeScript/build verification.

## Task 7: Publish only approved articles

**Files:**

- Create: `src/app/(en)/guides/<approved-slug>/page.tsx`
- Modify: `src/app/(en)/guide/page.tsx`
- Modify: `src/lib/i18n/routes.ts`
- Modify: `src/app/sitemap.ts`

**Steps:**

1. Confirm the QA report status is `Approved`.
2. Add the public route.
3. Add the article to the Guide hub.
4. Add reciprocal contextual links between article and tool page.
5. Add the route to the sitemap.
6. Add Chinese hreflang only if a complete Chinese page exists.
7. Verify canonical, metadata, JSON-LD, internal links, and robots behavior.
8. Run `npm run lint`.
9. Run `npm run build`.
10. Check desktop and mobile screenshots.

## Task 8: Submit and monitor

**Files:**

- Modify: `doc/content/<slug>/qa-report.md`
- Modify: `doc/six-month-seo-growth-plan.md`

**Steps:**

1. Record the published URL and deployment commit.
2. Request indexing through Google Search Console.
3. Record baseline index status.
4. Review performance at day 14.
5. Review performance at day 28.
6. Improve, merge, or retain the article based on actual query data.

