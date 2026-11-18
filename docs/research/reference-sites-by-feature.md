# MarTech Discovery Platform: features and reference sites

Researched 2026-11-16. Each feature below is taken from the code in this repo. Next to it are the real sites that already do the same thing well, so the team can compare against them.

## What it is

A directory website, in English and Thai, of marketing-technology (MarTech) vendors in Thailand and Southeast Asia. The site's copy ties it to **MarTech Expo 2027 Thailand** and calls it "Thailand's Official MarTech Discovery Platform". It is a static site with Cloudflare Pages Functions and a D1 database behind it.

## Objective

Help marketing buyers (CMOs, IT and digital leads, business owners, agencies) go through **Search → Compare → Shortlist → Connect**. The platform makes money from MarTech providers through listings, sponsored placements and buyer leads, with consent recorded for each provider. Its data model keeps the free (organic) listings separate from paid ones (see `data-ontology.json` principles).

## Features and their reference sites

| # | Feature (where in code) | What it does here | Reference sites |
|---|---|---|---|
| 1 | **Category directory** (`build.mjs`, `vendor-categories.json`, `directory.js`) | 18 categories and about 113 vendors, including local ones such as LINE CRM and chat commerce | [chiefmartec 2025 Landscape](https://chiefmartec.com/2025/05/2025-marketing-technology-landscape/) (15,384 tools in 49 categories) and [2026 edition](https://chiefmartec.com/?p=6211); the interactive version is at MartechMap.com |
| 2 | **Vendor profiles with verification status** (`functions/api/vendors/[slug].js`, `vendor-overrides.js`, `data-ontology.json`) | Company facts are kept apart from product facts; each claim carries evidence and a status ("Not yet verified", "Correction needed") | [TrustRadius integrity manifesto](https://www.trustradius.com/static/content-integrity), [how TrustRadius verifies reviews](https://trustradius.freshdesk.com/support/solutions/articles/43000536335-how-trustradius-verifies-reviews), [trScore](https://trustradius.com/static/about-trustradius-scoring) |
| 3 | **Compare (up to 3)** (`app.js` "Compare 0/3") | Shows the chosen vendors side by side | [G2 Compare](https://www.g2.com/compare?rd=1) (up to 4 products; see [G2 docs](https://documentation.g2.com/help/docs/researching-and-customizing-software-recommendations-on-g2)) |
| 4 | **Shortlist and saved vendors** (`app.js`, `functions/api/member/favorites.js`, table `member_saved_vendors`) | Visitors build a shortlist; logged-in members can save vendors to their account | Capterra product pages and Capterra Shortlist, e.g. [capterra.com/p/199679/Ascent360](https://www.capterra.com/p/199679/Ascent360/) |
| 5 | **Gated Buyer's Guide → leads** (`buyer-guide.js`, `functions/api/leads.js`, tables `leads` and `lead_provider_consents`) | Visitors fill a form to download the 2027 guide; the form records consent per provider, plus separate newsletter and demo consent, with rate limiting | [Gartner Digital Markets lead gen](https://gcom.pdo.aws.gartner.com/en/digital-markets/insights/software-lead-generation-strategies-to-capture-rising-demand) (Capterra, GetApp, Software Advice), [Software Advice PPL terms](https://www.softwareadvice.com/legal-page/ppl-service-description). Legal basis: [Tilleke on PDPA consent guidelines](https://www.tilleke.com/insights/thailand-issues-guidelines-on-pdpa-consent-and-notification-requirements), [FPF on the limits of consent in the PDPA](https://fpf.org/blog/new-report-on-limits-of-consent-in-thailands-data-protection-law) |
| 6 | **For Providers, placements and deals** (`/for-providers`, admin views `placements` and `deals`) | Vendors join the platform; admins sell sponsored placements | [G2 free profile](https://sell.g2.com/create-free-profile) and [G2 plans](https://sell.g2.com/plans?hsLang=en) (buyer-intent data is a paid add-on), [Gartner buyer discovery](https://digital-markets.gartner.com/buyer-discovery) |
| 7 | **Editorial policy** (`/editorial-policy`) | Explains how the site stays independent and how it labels sponsorship | [Capterra disclosure notice](https://www.capterra.com.au/blog/7576/how-we-ensure-transparency) (paid by vendors; placement may depend on client status), [TrustRadius content integrity](https://www.trustradius.com/static/content-integrity) |
| 8 | **English and Thai** (`lang/`, table `languages`, hreflang in `build.mjs`) | Builds pages for each locale; admins can edit translations | [Google: localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| 9 | **SEO and AI discovery** (`build.mjs` → `sitemap.xml` + `sitemap.xsl`, `robots.txt`, `llms.txt`, `llms-full.txt`) | Files that help search engines and AI assistants find and read the site | [llmstxt.org](https://llmstxt.org/index.md) / [GitHub spec](https://github.com/AnswerDotAI/llms-txt), [Google SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) |
| 10 | **Admin console** (`admin*.js`: dashboard, vendors, leads, deals, placements, ontology, SEO, sitemap, users, settings; table `audit_log`) | Back office with member, admin and super_admin roles and an audit log | Vendor-side portals such as [G2 Seller profiles](https://sell.g2.com/profiles) and [Gartner Digital Markets: optimizing your profile](https://digital-markets.gartner.com/how-to-optimize-your-product-profile) |
| 11 | **Member accounts** (`functions/api/auth/*`, tables `users`, `user_sessions`, `auth_rate_limits`) | Register and log in, with forced password change, session tokens and login rate limits | (standard functionality, no special reference needed) |

## Local market context (Thailand)

- [MarTech Expo 2026 listing](https://www.thailandexhibition.com/thai-trade-show-details/martech-expo-2026/25094). A [Thai press release](https://www.marketingoops.com/?p=362212) says a 2027 edition is planned, which fits the "2027 Edition" branding on this site.
- [Content Shifu: Thailand's MarTech Report 2025](https://contentshifu.com/resource/en-thailands-martech-report-2025/) and [2026](https://contentshifu.com/en/resource/en-thailands-martech-report-2026/). These rank the tools Thai marketers use most and are the closest thing to a local landscape map; I found no public map just for Thailand.
- [Campaign Asia: martech's growing share of Thai marketing spend](https://www.campaignasia.com:443/article/martech-to-form-a-larger-part-of-thai-marketing-spend-report/495481).

## Gaps compared with the reference sites

- **No user reviews or ratings.** G2, Capterra and TrustRadius are built around verified reviews. This site uses editorial verification instead, which is a fair way to stand out, but the editorial policy should say so plainly.
- **Compare allows 3 products; G2 allows 4.** This is a small difference and either choice is fine.
- **Buyer-intent signals.** G2 and Gartner sell vendors data on which companies viewed their profile. This site already records leads with consent per provider, so it has the starting point for a similar paid product.

## Unverified points

- One third-party blog ([aissist.io](https://aissist.io/insights/g2-alternatives)) says G2 bought Capterra, GetApp and Software Advice from Gartner in early 2026. Gartner's own pages still list them as Gartner brands. I could not confirm either version.
- The PDPA summaries above are secondary sources (law-firm commentary). Check the consent wording on the lead form against the PDPC's own guidelines before launch.
- llms.txt has no confirmed effect on whether AI assistants cite a site. It costs almost nothing to publish.
