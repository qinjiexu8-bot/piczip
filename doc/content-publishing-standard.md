# PicZip SEO Content Production and Publishing Standard

Status: Active  
Owner: PicZip  
Primary market: Google Search, English-first  
Goal: Build qualified organic traffic toward 10,000 monthly UV within six months

## 1. Purpose

This document is the release standard for every PicZip guide or article. An article is not publishable merely because the writing is complete. It must solve one real user problem, include first-hand PicZip evidence, pass the quality gate, and have a clear place in the site's keyword map.

Google does not prohibit content because AI assisted with research or editing. The risk is publishing low-value, unoriginal, or scaled content created primarily to manipulate rankings. PicZip therefore optimizes for usefulness, first-hand experience, accuracy, and trust rather than trying to imitate a particular writing style.

## 2. Content Principles

### One page, one problem

Each article must answer one concrete question. The primary keyword, title, introduction, screenshots, test, conclusion, and call to action must all address the same problem.

Good:

- How to compress an image to 100KB without uploading
- How to reduce image size for an email attachment
- Why a PNG can become larger after compression

Bad:

- Complete guide to compression, resizing, conversion, image SEO, and email
- Separate near-duplicate articles for every 10KB target
- An article that targets a long-tail query but mostly promotes PicZip

### Long-tail first

During the first three months, prioritize keywords that combine a task with a constraint, file type, destination, or privacy requirement. Long-tail pages should connect to a relevant tool page and strengthen a focused image-compression topic cluster.

Do not create a new page for every wording variation. Closely related queries should be answered on one page when the search intent and solution are substantially the same.

### Evidence before prose

The writer must complete the PicZip test and collect evidence before finalizing the article. The evidence determines the conclusion; the conclusion must not be invented first and supported afterward.

Every how-to article must include:

- A real source image or clearly identified test fixture
- Original file type, dimensions, and file size
- PicZip settings used
- Output file type, dimensions, and file size
- Compression result or saved percentage
- At least two original PicZip screenshots
- A short explanation of what worked, what did not, and why

If a target cannot be reached without visible quality loss or resizing, say so directly.

## 3. Writing Standard

### Required structure

1. A descriptive title and one H1
2. A direct answer within the first 100 words
3. A short "tested with PicZip" summary containing real numbers
4. Numbered steps that match the screenshots
5. A result section with the actual output
6. Practical limitations or trade-offs
7. A concise FAQ containing only genuinely related questions
8. A conclusion that answers the opening problem
9. A relevant call to action to the matching PicZip tool

Long articles may include a table of contents. Do not add one when it makes the page slower to scan.

### Voice

- Write in clear, natural English for a general web user.
- Prefer direct observations: "In our test..." or "At 2400px wide..."
- Use specific nouns and measurements instead of promotional adjectives.
- Vary sentence length naturally.
- Remove generic introductions, repeated summaries, filler transitions, and exaggerated claims.
- Do not claim "lossless," "exact," "instant," "secure," or "best" unless the page proves the claim and states the limitation.
- Do not invent quotations, user stories, statistics, tests, or sources.

Avoid phrases such as:

- In today's digital world
- It is important to note
- Whether you are a beginner or a professional
- This comprehensive guide will explore
- Game-changing, revolutionary, ultimate, effortless

### Length

There is no fixed word-count target. Most PicZip problem-solving guides should be 800 to 1,400 English words. Publish a shorter article if it fully answers the query; expand only when the added section helps the user complete the task.

## 4. Keyword and Intent Gate

Before drafting, create a content brief with:

- Primary keyword
- Search intent
- Target user and use case
- One-sentence problem definition
- Closest existing PicZip page
- Secondary query variants
- Page that should receive the main internal link
- Why the article offers something the existing SERP does not

The article must not be approved if:

- Its primary keyword is already assigned to another PicZip page
- Its intent belongs on an existing tool page
- It is a near-duplicate of an existing or planned article
- The only unique difference is a number, file extension, or minor wording change

## 5. Screenshot and Test Standard

### Screenshots

Screenshots must be captured from the current production-equivalent PicZip interface. They must:

- Show the relevant control or result clearly
- Exclude personal filenames, private images, browser accounts, and unrelated tabs
- Use a consistent desktop width unless mobile behavior is the subject
- Be tightly cropped without hiding necessary context
- Use descriptive filenames
- Include a visible caption in the article
- Include useful alt text that describes the action or result

Do not place keywords in alt text unless they accurately describe the image.

### Test record

Store the following alongside the article quality report:

| Field | Required value |
| --- | --- |
| Test date | ISO date |
| PicZip build | Commit SHA or deployment URL |
| Browser | Name and version |
| Operating system | Name and version |
| Source image | Fixture name and origin |
| Original file | Format, dimensions, bytes |
| Settings | Target KB, quality, output, max width |
| Result file | Format, dimensions, bytes |
| Outcome | Pass, partial, or failed target |
| Observations | Visual quality and limitations |

Results must be reproduced after material changes to the compression engine or controls.

## 6. On-Page SEO Requirements

Every published article requires:

- A unique title that accurately summarizes the page
- A unique meta description
- A clean, stable URL without a date
- One H1 and logical H2/H3 hierarchy
- Primary keyword used naturally in the title, H1, introduction, and at least one relevant heading
- Two to five useful internal links
- A contextual link to the matching tool page
- At least one relevant tool or guide page linking back to the article
- Self-referencing canonical
- Correct English and Chinese hreflang only when both versions exist
- Article or HowTo structured data matching visible page content
- Inclusion in the XML sitemap only after approval
- Indexable robots settings only after approval

FAQ structured data is optional and must not be added merely because an FAQ section exists.

## 7. Trust and Attribution

Each article must show:

- Author or editorial owner
- Published date
- Last verified date
- A short testing-method note
- A link to the About page
- A correction contact using support@piczip.app

External sources should be authoritative and directly support the associated claim. Avoid adding citations to statements that come from PicZip's own reproducible test.

## 8. Quality Gate

### Hard blockers

An article cannot be published if any item below fails:

- [ ] One clear problem and one primary keyword
- [ ] Search intent matches the article format
- [ ] No keyword cannibalization or near-duplicate page
- [ ] Direct answer appears in the first 100 words
- [ ] PicZip test is completed and reproducible
- [ ] Numbers in prose match the test record
- [ ] At least two original, useful screenshots are present
- [ ] Screenshots contain no private or misleading information
- [ ] Limitations and failed attempts are disclosed
- [ ] Claims are accurate and sources are valid
- [ ] Internal links and canonical are correct
- [ ] Structured data matches visible content
- [ ] Mobile and desktop layouts are readable
- [ ] Build, lint, and link checks pass
- [ ] No draft route appears in the sitemap

### Quality score

Score each category from 0 to 5:

| Category | Pass condition |
| --- | --- |
| Problem resolution | User can complete the task without another search |
| First-hand value | Test, screenshots, and conclusions add original information |
| Clarity | Direct, scannable, and free of filler |
| Accuracy | Measurements, claims, links, and limitations are correct |
| Search fit | Title, intent, headings, and internal links are coherent |
| Trust | Authorship, dates, test method, and contact are visible |

Minimum passing score: 25/30, with no category below 4. A passing score never overrides a hard blocker.

## 9. Release Workflow

Every article moves through these states:

`brief -> evidence collected -> draft -> editorial review -> technical QA -> approved -> published -> monitored`

Rules:

- Drafts remain outside public application routes.
- Only an approved article may be added to a public route, internal navigation, or sitemap.
- The quality report must name the reviewer and record the approval date.
- After publishing, request indexing in Google Search Console.
- Review impressions, queries, average position, and clicks after 14 and 28 days.
- Improve the existing article before creating a near-duplicate page.

## 10. Post-Publish Review

At day 14:

- Confirm indexing and canonical selection
- Check actual queries and unexpected intent
- Check mobile rendering and image loading
- Fix factual, usability, or snippet issues

At day 28:

- Compare impressions and position with the target query set
- Improve weak introductions or titles only when the data supports a change
- Add internal links from newly relevant pages
- Record whether the article should be retained, expanded, merged, or redirected

Changing a date without materially re-testing or updating the article is prohibited.

## 11. Quality Report Template

Create one report per article using:

```markdown
# Article QA: [title]

Status: Draft | Failed | Approved | Published
Primary keyword:
URL:
Reviewer:
Review date:

## Intent and cannibalization

- Search intent:
- Closest existing page:
- Distinct purpose:

## Test record

[Copy the required test table]

## Screenshot inventory

| File | What it proves | Caption | Alt text |
| --- | --- | --- | --- |

## Hard blockers

[Copy and complete the hard-blocker checklist]

## Quality score

[Copy and score the quality table]

Total:

## Corrections required

- None, or list each correction.

## Release decision

Approved by:
Approved at:
Reason:
```

## 12. Sources for This Standard

- Google Search Central: Creating helpful, reliable, people-first content
- Google Search Central: Guidance on generative AI content
- Google Search Central: Spam policies for Google Web Search
- Google Search Central: Optimizing for generative AI features on Google Search

