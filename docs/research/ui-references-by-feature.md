# UI layout references by feature

Researched 2026-11-16. For each feature this lists real sites worth studying for **layout and section order**, not their content. Each one ends with a recommendation that fits this project: a B2B directory in English and Thai with about 113 vendors, editorial verification, and paid placements kept apart from free listings.

How it was checked: aitoolsdirectory.com was opened and captured directly. aixploria, SaaSHub, Product Hunt, HubSpot and NerdWallet were read as page text. **G2, Capterra, TrustRadius and theresanaiforthat block automated access**, so the notes about them come from their help docs and general knowledge. Open those sites yourself to see them.

---

## 1. Homepage and search

| Site | Layout worth borrowing |
|---|---|
| [aitoolsdirectory.com](https://aitoolsdirectory.com/) | Header with logo, a large H1 and tagline, and **Submit Tool / Advertise / Deals** buttons with a small search box at the top right. Next comes a **row of 2 "Featured Tool" cards** (big image cards). Then a **filter bar**: keyword search, then Tool name, Category and Price dropdowns. Then a "Showing 1–100 of 779 tools" count and a 6-column card grid with numbered pages. |
| [aixploria.com/en](https://www.aixploria.com/en/) | Hero with a mascot, "AI Tools Directory" and a **live tool count**. One search box, a **category dropdown with counts per category**, and **pricing chips** (Verified, Free, Freemium, Paid, Free Trial). A trust line under it reads "72 categories · updated daily · manually verified". After that: Featured cards, then **stacked ranked lists** (Latest, Our Selection, Top in category), then a grid of trending categories, then news, then an SEO text block. |
| [futuretools.io](https://www.futuretools.io/) | Shows that a homepage can lead with a **ranked list** ("Top 20, ranked by upvotes in the last 30 days", with a movement arrow on each row). Featured status is a badge on a row, not a separate banner. |

**For this project:** The current homepage order (hero → categories → directory → Search/Compare/Shortlist/Connect steps → Buyer Guide → For Providers) already follows this pattern. Two cheap additions from aixploria:
- A **trust line** under the search box: "18 categories · 113 providers · editorially verified · EN/TH".
- **Counts on each category tile.**

Keep featured placements to **one clearly labelled row** like aitoolsdirectory does. Don't mix them into the free results.

## 2. Category directory and filters

| Site | Layout worth borrowing |
|---|---|
| [aitoolsdirectory.com](https://aitoolsdirectory.com/) | Filters sit in a **horizontal bar above the grid**, not a sidebar. Each card has an image, name, a **pricing pill** (Free/Freemium/Paid), up to 4 **category tag links**, a 2–3 line description and a full-width **Details** button. Each tag links to its category page, so tags double as navigation. |
| [SourceForge category page](https://sourceforge.net/software/marketing-automation/) | B2B pattern: a **left filter sidebar with a count on each filter** (Features, Deployment, Free trial, Integrations, API, Organization size, **Regions**). Sort options are Sponsored / Highest rated / Most reviews. Each card has a rank, logo, name and vendor, description, rating, starting price, and View / Visit buttons. |
| [G2 category pages](https://www.g2.com/categories/marketing-automation) *(blocks bots)* | Left filters, a **Compare checkbox on each card** that fills a compare tray at the bottom, and an editorial buyer's guide and FAQ below the list. |
| [MartechMap.com](https://martechmap.com/) / [chiefmartec landscape](https://chiefmartec.com/2025/05/2025-marketing-technology-landscape/) | A **landscape map**: every category is a box filled with vendor logos. It works well as an "ecosystem at a glance" view. |

**For this project:** Use SourceForge-style filters that matter to Thai buyers: **Category, LINE integration, Thai-language support, Local or regional presence, Company size served, Pricing model, Verified status**. With only 113 vendors, a top filter bar (aitoolsdirectory style) is enough on mobile, with a sidebar on desktop. Add a **"Landscape" view toggle** that shows the 18 categories as logo boxes. That fits an expo audience well.

## 3. Vendor profile page

| Site | Layout worth borrowing |
|---|---|
| [Product Hunt product page](https://www.producthunt.com/products/notion) | Header: logo, name, tagline, rating, follower count, badges, then **Visit website / Follow / Add to collection / Share**. Then **tabs** (Overview, Reviews, Alternatives, Customers, Team). Body: description, category tags, media gallery, then reviews summarized as **pros and cons tags**. Right sidebar: company links, launch year, awards, social links. |
| [SaaSHub profile](https://www.saashub.com/hubspot-marketing-hub) | Breadcrumb, header with **Visit / Alternatives (240+) / Save / Verify / Edit** buttons. Sections: Listed in, Screenshots, Features and specs, **Badges**, Videos, "Is it good?" with outside signals, **summary of public mentions** (strengths and criticisms), alternatives. Sponsored items sit in the sidebar. |
| [aitoolsdirectory tool page](https://aitoolsdirectory.com/tool/klap) | Minimal: back link, logo, **TRY IT** button, pricing pill, tags, long description, features list, **"Alternatives to X"** (4 tools with one-line comparisons each), newsletter signup. |

**For this project:** Header with logo, name, a **verification badge** (Verified / Not yet verified / Correction needed, which come from your ontology), category tags, and the buttons **Save to shortlist · Add to compare · Contact provider**. Then tabs: **Overview · Capabilities · Integrations (LINE etc.) · Pricing model · Thai customers and case studies · Alternatives**. Right sidebar: company facts (HQ, Thai office, founded, languages) and a **"Last verified on…" note with the evidence source**. Like SaaSHub, offer a **"Suggest a correction"** link; it feeds your "Correction needed" status.

## 4. Compare (up to 3)

| Site | Layout worth borrowing |
|---|---|
| [G2 Compare](https://www.g2.com/compare?rd=1) *(blocks bots)* ([docs](https://documentation.g2.com/help/docs/researching-and-customizing-software-recommendations-on-g2)) | Pick products in a category, then click **Compare Now** to get a table. Product columns are pinned at the top; rows are scores, feature ratings, pricing and satisfaction. Allows up to 4 products. |
| Capterra compare *(blocks bots)* | Columns hold logo, rating and a **Visit** button. Rows: pricing, free trial, deployment, features (✓ / –), reviews. |
| [StackShare stackups](https://stackshare.io/stackups/hubspot-vs-marketo) *(rate-limited during this check)* | Side-by-side description, pros and cons, and integrations. |

**For this project:** The bottom tray "Shortlist 0 · Compare 0/3" is already the right pattern. Make the compare page a table with **sticky product columns** and row groups in this order: **Overview → Capabilities (✓/–) → Integrations → Thai market fit (Thai UI, local support, PDPA) → Pricing model → Verification status**. Add a **"Show only differences"** toggle. End each column with **Contact provider**, which feeds into the lead flow.

## 5. Shortlist and member area

| Site | Layout worth borrowing |
|---|---|
| Product Hunt "Add to collection" | Saved items grouped into **named collections** that can be shared. |
| [aixploria](https://www.aixploria.com/en/) | A **favorites heart on every card** and a favorites icon in the header that shows a count. |
| Capterra Shortlist *(blocks bots)* | A saved-products list with a compare button. |

**For this project:** A heart or bookmark on every card, a header badge with the count, and a `/member` page with **Saved vendors → Compare selected → Send one brief to selected providers**. That last step is the "Connect" in your four-step flow.

## 6. Buyer's Guide (gated download)

| Site | Layout worth borrowing |
|---|---|
| [HubSpot State of Marketing](https://www.hubspot.com/state-of-marketing) | Hero with title and pitch, a **report cover image**, **2 headline statistics** as a teaser, a **"What's inside" list of 3 chapters**, a short form (name, work email, website, company size), a **consent notice under the button**, one quote as social proof, and a link to last year's edition. |

**For this project:** Use the same skeleton, plus your existing preview route (`buyer-guide/preview`) as a "peek at chapter 1". Keep the form short (name, work email, company, role, interest areas), then put **consent per provider as separate, unticked checkboxes** as PDPA requires; your `lead_provider_consents` table already supports this. Show **newsletter** and **demo contact** consent as their own tickboxes, never bundled.

## 7. For Providers (listing and advertising)

| Site | Layout worth borrowing |
|---|---|
| [aitoolsdirectory /ads](https://aitoolsdirectory.com/ads) | A sales page: hero → **placement preview** (desktop and mobile mock of where each ad appears) → **package cards with prices** (Featured #1 $499/30 days, Featured #2 $399, Top organic row $299, Fast-track listing $99 once) → audience proof (logos and qualitative points) → **what we don't accept**. |
| [aitoolsdirectory /submit-tool](https://aitoolsdirectory.com/submit-tool) | "Free listing, manually reviewed" next to a **paid Fast Track** option, then numbered **listing rules**, then a button to the form. |
| [G2 free profile](https://sell.g2.com/create-free-profile) / [plans](https://sell.g2.com/plans?hsLang=en) | **Free tier compared with paid tiers** in a table; buyer-intent data is an add-on. |

**For this project:** One `/for-providers` page with these parts:
- **Get listed (free, verified)** → Upgrade packages (expo-linked featured slots, category sponsor, Buyer Guide sponsor) → **Lead delivery explained (consent only)** → Rules → Apply form.
- A placement preview with mock-ups helps sales a lot.

## 8. Editorial policy

| Site | Layout worth borrowing |
|---|---|
| [NerdWallet editorial guidelines](https://www.nerdwallet.com/l/editorial-guidelines) | Short sections: Mission → Key principles → **Editorial independence** → **Fact-checking and corrections (with an email address)** → **Use of AI**. It links out to separate "How we make money" and "Methodology" pages. |
| [TrustRadius integrity manifesto](https://www.trustradius.com/static/content-integrity) | Explains how listings are checked and labelled, in plain language. |
| [Capterra disclosure](https://www.capterra.com.au/blog/7576/how-we-ensure-transparency) | A short **"how we make money"** disclosure, plus a note that placement can depend on paid status. |

**For this project:** Sections in this order: **How we select vendors → What "Verified" means → How we make money (placements and sponsorship) → How sponsored items are labelled → Corrections (link to the profile correction form) → Use of AI**. Link to it from a small "Sponsored · Why?" label on every paid placement.

## 9. Admin console

No public reference sites; an admin back office isn't publicly visible on these sites. For dashboard layout patterns, look at the vendor portals ([G2 Seller profiles](https://sell.g2.com/profiles)) or any CRM pipeline view. Your existing views (Dashboard, Vendors, Leads, Deals, Placements, Ontology, SEO, Sitemap, Users, Settings) already cover what those portals have.

---

## Patterns worth copying in this order

1. **Labelled featured row plus a free grid underneath** (aitoolsdirectory). Protects the editorial-independence promise.
2. **Verification badge and "last verified" date** on cards and profiles. No reference site does this well; it can be **your differentiator**.
3. **Compare tray → sticky compare table → "Contact selected providers"**. Turns browsing into consented leads.
4. **Category tiles with counts and a landscape-map view** (aixploria counts, MartechMap boxes).
5. **Gated guide with a stats teaser and a "What's inside" list** (HubSpot), using consent per provider.
