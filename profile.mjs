// Vendor card and profile page, free vs Featured (paid), following the product wireframes.
// Content comes from vendor-profiles.json; a section renders only when that vendor has content for it.
// Tier caps follow the Basic (free) / Featured (paid) profile spec.
export const CAPS = {
  free: { categories: 2, description: 200, benefits: 3, features: 5, useCases: 2, screenshots: 1, videos: 0, integrations: 5, customers: 0, caseStudies: 0, testimonials: 0, faqs: 0 },
  featured: { categories: 6, description: 500, benefits: 10, features: 20, useCases: 10, screenshots: 10, videos: 3, integrations: 50, customers: 20, caseStudies: 5, testimonials: 5, faqs: 10 }
};

const clip = (s, n) => { s = String(s || '').trim(); if (s.length <= n) return s; const cut = s.slice(0, n); return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)).trim() + '…'; };

export function makeProfiles(ctx) {
  const { esc, cats, categoryLabel, logoMarkup } = ctx;
  const L = (v, locale) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[locale] ?? v.en ?? '') : (v ?? '');
  const T = (locale, en, th) => locale === 'th' ? th : en;
  const list = a => Array.isArray(a) ? a.filter(x => x !== null && x !== undefined) : [];
  const catRow = slug => cats.find(c => c[0] === slug);

  // A vendor record joined with its profile content. p = product row from build.mjs.
  function model(p, content, locale) {
    const c = content || {};
    const featured = !!(c.featured ?? p?.[9]?.sponsored);
    const tier = featured ? 'featured' : 'free';
    const cap = CAPS[tier];
    const company = c.company?.name || p?.[1] || '';
    const title = c.productName || company;
    const catSlugs = list(c.categories).length ? list(c.categories) : (p?.[8] || []);
    const description = L(c.description, locale) || (p?.[9] ? (locale === 'th' && p[9].descriptionTh ? p[9].descriptionTh : p[3]) : '');
    return { p, c, featured, tier, cap, company, title, hasProduct: !!c.productName, slug: p?.[0] || c.slug,
      cats: catSlugs.map(catRow).filter(Boolean).slice(0, cap.categories), description: clip(description, cap.description), locale };
  }

  const logo = (name, sample) => sample ? `<span class="vendor-logo-initial" aria-hidden="true">${esc([...name][0] || 'S')}</span>` : logoMarkup(name);
  const featuredTag = (m) => m.featured ? `<span class="tier-badge">${T(m.locale, 'Featured', 'แนะนำ')}</span>` : '';

  // Card: free = logo, name, up to 3 tags, detail. Featured = logo, name + Featured, by company, main category, detail.
  function card(p, content, locale, opts = {}) {
    const m = model(p, content, locale);
    const href = opts.href || `/${locale}/providers/${m.slug}/`;
    const detail = m.description || T(locale, 'Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ');
    const tags = m.featured
      ? `<span class="vc-tag">${esc(categoryLabel(m.cats[0] || cats[0], locale))}</span>`
      : m.cats.concat((p?.[8] || []).map(catRow).filter(Boolean)).filter((c, i, a) => a.indexOf(c) === i).slice(0, 3).map(c => `<span class="vc-tag">${esc(categoryLabel(c, locale))}</span>`).join('');
    return `<a class="result-card vendor-card${m.featured ? ' is-featured' : ''}" data-company="${esc(m.company.toLocaleLowerCase())}" data-categories="${(p?.[8] || []).join(',')}" href="${href}"><div class="vc-head">${logo(m.company, opts.sample)}<div class="vc-id"><h2>${esc(m.title)}${featuredTag(m)}</h2>${m.featured && m.hasProduct ? `<span class="vc-by">${T(locale, 'by', 'โดย')} ${esc(m.company)}</span>` : ''}<div class="vc-tags">${tags}</div></div></div><p class="${m.description ? '' : 'is-pending'}">${esc(detail)}</p></a>`;
  }

  // Profile page body, section order follows the wireframes.
  function page(p, content, locale, opts = {}) {
    const m = model(p, content, locale), c = m.c, cap = m.cap, F = m.featured, t = (en, th) => T(locale, en, th);
    const sec = (id, title, inner, cls = '') => inner ? `<section class="pf-section ${cls}" id="${id}"><h2>${title}</h2>${inner}</section>` : '';
    const bullets = items => items.length ? `<ul class="pf-bullets">${items.map(x => `<li><b>${esc(L(x.title, locale))}</b>${x.text ? ` · ${esc(L(x.text, locale))}` : ''}</li>`).join('')}</ul>` : '';
    const cards = (items, cls = '') => items.length ? `<div class="pf-cards ${cls}">${items.map(x => `<article class="pf-card"><h3>${esc(L(x.title, locale))}</h3>${x.text ? `<p>${esc(L(x.text, locale))}</p>` : ''}</article>`).join('')}</div>` : '';
    const tagRow = items => items.length ? `<div class="pf-tags">${items.map(x => `<span>${esc(L(x, locale))}</span>`).join('')}</div>` : '';
    const shot = (src, i, big) => src ? `<img class="pf-shot${big ? ' is-main' : ''}" src="${esc(src)}" alt="${t('Screenshot', 'ภาพหน้าจอ')} ${i + 1}" loading="lazy">` : `<div class="pf-shot pf-shot-empty${big ? ' is-main' : ''}" role="img" aria-label="${t('Screenshot', 'ภาพหน้าจอ')} ${i + 1}"><span>${t('Screenshot', 'ภาพหน้าจอ')} ${i + 1}</span></div>`;

    const benefits = list(c.benefits).slice(0, cap.benefits), features = list(c.features).slice(0, cap.features), useCases = list(c.useCases).slice(0, cap.useCases);
    const shots = list(c.screenshots).slice(0, cap.screenshots), videos = list(c.videos).slice(0, cap.videos), integrations = list(c.integrations).slice(0, cap.integrations);
    const website = c.website || c.company?.website || '';
    const ctas = [website && `<a class="button" href="${esc(website)}" target="_blank" rel="noopener">${t('Visit website', 'ไปที่เว็บไซต์')}</a>`,
      F && c.demoUrl && `<a class="button secondary" href="${esc(c.demoUrl)}" target="_blank" rel="noopener">${t('Book a demo', 'นัดสาธิต')}</a>`,
      F && c.trialUrl && `<a class="text-cta" href="${esc(c.trialUrl)}" target="_blank" rel="noopener">${t('Free trial', 'ทดลองใช้ฟรี')}</a>`].filter(Boolean);

    const hero = `${F ? `<div class="pf-banner${c.banner ? '' : ' is-empty'}">${c.banner ? `<img src="${esc(c.banner)}" alt="">` : ''}</div>` : ''}
<header class="pf-hero profile-route" data-vendor-slug="${m.slug}"><div class="pf-logo">${logo(m.company, opts.sample)}</div><div class="pf-id"><div class="pf-title"><h1>${esc(m.title)}</h1>${featuredTag(m)}</div>${m.hasProduct ? `<p class="pf-by">${t('by', 'โดย')} ${esc(m.company)}</p>` : ''}<div class="pf-cats">${m.cats.map((cat, i) => `<a class="${i ? '' : 'is-main'}" href="/${locale}/categories/${cat[0]}/">${esc(categoryLabel(cat, locale))}</a>`).join('')}</div></div><div class="pf-actions">${ctas.join('')}<button class="button quiet" data-favorite="${m.slug}">${t('Add to shortlist', 'เพิ่มใน shortlist')}</button></div></header>`;

    const description = m.description ? `<section class="pf-section pf-description"><h2>${t('Description', 'รายละเอียด')}</h2><p>${esc(m.description)}</p>${F && list(c.awards).length ? `<div class="pf-awards"><span>${t('Awards and certifications', 'รางวัลและการรับรอง')}</span>${list(c.awards).map(a => `<b>${esc(L(a, locale))}</b>`).join('')}</div>` : ''}</section>`
      : `<section class="pf-section pf-description"><p class="is-pending">${t('Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ')}</p></section>`;

    const overviewText = L(c.overview?.text, locale);
    const overview = overviewText ? (F ? `<div class="pf-split"><p>${esc(overviewText)}</p>${shot(c.overview?.image, 0)}</div>` : `<p>${esc(clip(overviewText, 400))}</p>`) : '';

    const useCaseInner = (list(c.audience).length || useCases.length) ? `${tagRow(F ? list(c.audience).concat(list(c.industries)) : list(c.audience))}${F ? cards(useCases) : bullets(useCases)}` : '';

    const featureInner = F ? (features.length ? `${cards(features.slice(0, 6))}${features.length > 6 ? `<details class="pf-more"><summary>${t(`View ${features.length - 6} more features`, `ดูอีก ${features.length - 6} ฟีเจอร์`)}</summary>${cards(features.slice(6))}</details>` : ''}` : '') : bullets(features);

    const showcase = shots.length || videos.length ? `${shots.length ? `<div class="pf-gallery">${shot(shots[0], 0, true)}${shots.length > 1 ? `<div class="pf-thumbs">${shots.slice(1).map((s, i) => shot(s, i + 1)).join('')}</div>` : ''}</div>` : ''}${videos.length ? `<h3 class="pf-sub">${t('Demo videos', 'วิดีโอสาธิต')}</h3><div class="pf-videos">${videos.map(v => `<${v.url ? `a href="${esc(v.url)}" target="_blank" rel="noopener"` : 'div'} class="pf-video"><span class="pf-play" aria-hidden="true"></span>${esc(L(v.title, locale))}</${v.url ? 'a' : 'div'}>`).join('')}</div>` : ''}` : '';

    const plans = list(c.pricing?.plans);
    const pricing = (L(c.pricing?.summary, locale) || plans.length) ? `${L(c.pricing?.summary, locale) ? `<p>${esc(L(c.pricing.summary, locale))}</p>` : ''}${F && plans.length ? `<div class="pf-plans">${plans.map(pl => `<article class="pf-plan"><h3>${esc(L(pl.name, locale))}</h3><p>${esc(L(pl.text, locale))}</p><div class="pf-price"><b>${esc(L(pl.price, locale))}</b>${pl.period ? ` <span>${esc(L(pl.period, locale))}</span>` : ''}</div></article>`).join('')}</div>` : (!F && plans.length ? `<p>${/free|ฟรี/i.test(L(plans[0].price, locale)) ? t('Free plan available', 'มีแพ็กเกจฟรี') : `${t('Starts at', 'เริ่มต้น')} ${esc(L(plans[0].price, locale))}${plans[0].period ? ' ' + esc(L(plans[0].period, locale)) : ''}`}</p>` : '')}` : '';

    const integ = integrations.length ? (F ? `<div class="pf-integrations">${integrations.map(x => `<article><span class="pf-int-mark" aria-hidden="true">${esc([...L(x.name, locale)][0] || '')}</span><div><h3>${esc(L(x.name, locale))}</h3>${x.text ? `<p>${esc(L(x.text, locale))}</p>` : ''}</div></article>`).join('')}</div>` : tagRow(integrations.map(x => x.name))) : '';

    const testimonials = list(c.testimonials).slice(0, cap.testimonials), customers = list(c.customers).slice(0, cap.customers);
    const proof = F && (testimonials.length || customers.length) ? `${testimonials.map(q => `<figure class="pf-quote"><blockquote>${esc(L(q.quote, locale))}</blockquote><figcaption><b>${esc(L(q.name, locale))}</b>${q.role ? ` · ${esc(L(q.role, locale))}` : ''}</figcaption></figure>`).join('')}${customers.length ? `<div class="pf-logos">${customers.map(n => `<span>${esc(L(n, locale))}</span>`).join('')}</div>` : ''}` : '';

    const studies = F ? list(c.caseStudies).slice(0, cap.caseStudies) : [];
    const caseInner = studies.length ? `<div class="pf-cards">${studies.map(s => `<article class="pf-card pf-case"><span class="pf-case-customer">${esc(L(s.customer, locale))}</span><h3>${esc(L(s.problem, locale))}</h3><p>${esc(L(s.solution, locale))}</p></article>`).join('')}</div>` : '';

    const faqs = F ? list(c.faqs).slice(0, cap.faqs) : [];
    const faqInner = faqs.length ? `<div class="pf-faq">${faqs.map((f, i) => `<details${i ? '' : ' open'}><summary>${esc(L(f.q, locale))}</summary><p>${esc(L(f.a, locale))}</p></details>`).join('')}</div>` : '';

    const co = c.company || {}, fact = (label, value, pending) => `<dt>${label}</dt><dd class="${pending ? 'is-pending' : ''}"><span class="fact-dot"></span>${value}</dd>`;
    const pend = v => !v || /not yet verified|confirm with provider/i.test(String(v));
    const priceModel = L(c.pricing?.summary, locale) || p?.[5], langs = c.languages || p?.[6];
    const companyInner = `${F && L(co.overview, locale) ? `<p>${esc(L(co.overview, locale))}</p>` : ''}<dl class="pf-facts">${fact(t('Company', 'บริษัท'), esc(co.name || m.company), false)}${fact(t('Country', 'ประเทศ'), esc(L(co.country, locale) || t('Not yet verified', 'ยังไม่ได้ตรวจสอบ')), !L(co.country, locale))}${fact(t('Website', 'เว็บไซต์'), website ? `<a href="${esc(website)}" target="_blank" rel="noopener">${esc(website.replace(/^https?:\/\//, ''))}</a>` : t('Not yet verified', 'ยังไม่ได้ตรวจสอบ'), !website)}${fact(t('Pricing model', 'รูปแบบราคา'), esc(priceModel || t('Not yet verified', 'ยังไม่ได้ตรวจสอบ')), pend(priceModel))}${fact(t('Support languages', 'ภาษาที่รองรับ'), esc(langs || t('Not yet verified', 'ยังไม่ได้ตรวจสอบ')), pend(langs))}${fact('PDPA', t('Confirm with provider', 'ตรวจสอบกับผู้ให้บริการ'), true)}${fact(t('Event', 'งานอีเวนต์'), 'MarTech Expo 2027', false)}</dl>`;
    const promo = F && c.promotion?.text ? `<a class="pf-promo" ${c.promotion.url ? `href="${esc(c.promotion.url)}" target="_blank" rel="noopener"` : ''}><span>${t('Special offer', 'ข้อเสนอพิเศษ')}</span>${esc(L(c.promotion.text, locale))}</a>` : '';

    const related = (opts.related || []).length ? `<section class="pf-section pf-related"><h2>${t('Related tools', 'เครื่องมือที่เกี่ยวข้อง')}</h2><div class="route-grid pf-related-grid">${opts.related.join('')}</div></section>` : '';

    return `<div class="pf ${F ? 'is-featured' : 'is-free'}">${opts.notice || ''}${hero}${description}
${sec('overview', t('Product overview', 'ภาพรวมผลิตภัณฑ์'), overview)}
${sec('benefits', t('Key benefits', 'ประโยชน์หลัก'), F ? cards(benefits, 'is-3') : bullets(benefits))}
${sec('features', t('Product features', 'ฟีเจอร์'), featureInner)}
${sec('use-cases', F ? t('Target audience and use cases', 'กลุ่มเป้าหมายและกรณีใช้งาน') : t('Use cases', 'กรณีใช้งาน'), useCaseInner)}
${sec('showcase', t('Product showcase', 'ตัวอย่างผลิตภัณฑ์'), showcase)}
${sec('pricing', t('Pricing', 'ราคา'), pricing)}
${sec('integrations', t('Integrations', 'การเชื่อมต่อ'), integ)}
${sec('customers', t('Customer proof', 'ลูกค้าที่ใช้งาน'), proof)}
${sec('case-studies', t('Case studies', 'กรณีศึกษา'), caseInner)}
${sec('faq', t('Questions and answers', 'คำถามที่พบบ่อย'), faqInner)}
${sec('company', t('Company info', 'ข้อมูลบริษัท'), companyInner + promo, 'pf-company')}
${ctas.length ? `<section class="pf-cta${F ? ' is-wide' : ''}"><div><h2>${t(`Talk to ${esc(m.company)}`, `ติดต่อ ${esc(m.company)}`)}</h2><p>${t('Visit the vendor or save them to your shortlist to compare later', 'ไปที่เว็บไซต์ผู้ให้บริการ หรือบันทึกไว้เพื่อเปรียบเทียบภายหลัง')}</p></div><div class="pf-actions">${ctas.slice(0, 2).join('')}</div></section>` : ''}
${related}
${L(c.imageCredits, locale) ? `<p class="disclosure">${esc(L(c.imageCredits, locale))}</p>` : ''}<p class="disclosure">${F ? t('Featured profiles are paid placements. Content is supplied by the vendor and facts are pending editorial verification.', 'โปรไฟล์แนะนำเป็นพื้นที่แบบชำระเงิน เนื้อหามาจากผู้ให้บริการ และข้อมูลยังรอการตรวจสอบโดยกองบรรณาธิการ') : t('This profile is pending factual review before more details are published.', 'โปรไฟล์นี้อยู่ระหว่างตรวจสอบข้อมูลก่อนเผยแพร่รายละเอียดเพิ่มเติม')} <a href="/${locale}/editorial-policy/">${t('Editorial policy', 'นโยบายบรรณาธิการ')}</a></p></div>`;
  }

  return { card, page, model };
}
