import Link from 'next/link';
import { categoryName, type Vendor } from '@/lib/catalog';
import { local, pick, type Locale, type LocalText } from '@/lib/i18n';
import { profileModel, clip, type ProfileContent } from '@/lib/profiles';
import { VendorLogo } from './VendorLogo';
import { featuredLabel } from './VendorCard';

type Props = { vendor: Vendor; content?: ProfileContent; locale: Locale; related: React.ReactNode[]; notice?: React.ReactNode; sample?: boolean };

const isPending = (v?: string) => !v || /not yet verified|confirm with provider/i.test(v);

function Section({ id, title, aside, children, className = '' }: { id: string; title: string; aside?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`pf-section ${className}`} id={id}>
      <div className="pf-head"><h2>{title}</h2>{aside && <span className="pf-aside">{aside}</span>}</div>
      {children}
    </section>
  );
}

/**
 * Vendor profile (v4): overview hero first; a sticky bar with section tabs that uncovers a compact overview and the
 * main actions once the hero scrolls away; then full-width sections. A section renders only when there is content.
 */
export function ProfilePage({ vendor, content, locale, related, notice, sample = false }: Props) {
  const m = profileModel(vendor, content, locale);
  const { content: c, cap, featured: F } = m;
  const t = (en: string, th: string) => pick(locale, en, th);
  const L = (v?: LocalText | null) => local(v, locale);
  const ext = { target: '_blank', rel: 'noopener' };

  const benefits = (c.benefits ?? []).slice(0, cap.benefits);
  const features = (c.features ?? []).slice(0, cap.features);
  const useCases = (c.useCases ?? []).slice(0, cap.useCases);
  const shots = (c.screenshots ?? []).slice(0, cap.screenshots);
  const videos = (c.videos ?? []).slice(0, cap.videos);
  const integrations = (c.integrations ?? []).slice(0, cap.integrations);
  const testimonials = F ? (c.testimonials ?? []).slice(0, cap.testimonials) : [];
  const customers = F ? (c.customers ?? []).slice(0, cap.customers) : [];
  const studies = F ? (c.caseStudies ?? []).slice(0, cap.caseStudies) : [];
  const faqs = F ? (c.faqs ?? []).slice(0, cap.faqs) : [];
  const awards = F ? c.awards ?? [] : [];
  const plans = c.pricing?.plans ?? [];
  const compare = F ? c.pricing?.compare ?? [] : [];
  const audience = F ? [...(c.audience ?? []), ...(c.industries ?? [])] : c.audience ?? [];
  const priceModel = L(c.pricing?.summary) || vendor.pricing;
  const langs = c.languages || vendor.languages;
  const co = c.company ?? {};
  const promo = F && c.promotion?.text ? c.promotion : undefined;

  // The hero carries one sentence; the rest of the description and the overview text go to Product description.
  const [lead, ...rest] = m.description.split(/(?<=[.!?])\s+/);
  const descText = [rest.join(' '), L(c.overview?.text)].filter(Boolean);
  const overviewImage = F ? c.overview?.image : undefined;

  const freePlan = plans.some((p) => /free|ฟรี/i.test(L(p.price)));
  const thai = /thai|ไทย/i.test(langs || '');
  const tags = [freePlan && t('Free plan', 'มีแพ็กเกจฟรี'), F && c.trialUrl && t('Free trial', 'ทดลองใช้ฟรี'), thai && t('Thai support', 'รองรับภาษาไทย')].filter(Boolean) as string[];

  const actions = (small = false) => [
    F && c.trialUrl && <a key="t" className="text-cta" href={c.trialUrl} {...ext}>{t('Free trial', 'ทดลองใช้ฟรี')}</a>,
    m.website && <a key="w" className={`button ${F ? 'secondary' : ''}${small ? ' small' : ''}`} href={m.website} {...ext}>{t('Visit website', 'ไปที่เว็บไซต์')} ↗</a>,
    F && c.demoUrl && <a key="d" className={`button${small ? ' small' : ''}`} href={c.demoUrl} {...ext}>{t('Book a demo', 'นัดสาธิต')}</a>,
  ].filter(Boolean);

  const mainCat = m.categories[0];
  const tabs: [string, string][] = [
    ['overview', t('Overview', 'ภาพรวม')],
    ...(descText.length ? [['description', t('Description', 'รายละเอียด')]] as [string, string][] : []),
    ...(awards.length || benefits.length ? [['highlights', t('Highlights', 'จุดเด่น')]] as [string, string][] : []),
    ...(features.length || useCases.length ? [['features', t('Features', 'ฟีเจอร์')]] as [string, string][] : []),
    ...(integrations.length ? [['integrations', t('Integrations', 'การเชื่อมต่อ')]] as [string, string][] : []),
    ...(shots.length || videos.length ? [['showcase', t('Showcase', 'ตัวอย่าง')]] as [string, string][] : []),
    ...(priceModel && !isPending(priceModel) || plans.length ? [['pricing', t('Pricing', 'ราคา')]] as [string, string][] : []),
    ...(customers.length || testimonials.length || studies.length ? [['customers', t('Customers', 'ลูกค้า')]] as [string, string][] : []),
    ...(faqs.length ? [['questions', t('Questions', 'คำถาม')]] as [string, string][] : []),
    ['company', t('Company', 'บริษัท')],
  ];

  const Cards = ({ items }: { items: { title: LocalText; text?: LocalText }[] }) => (
    <div className="pf-cards">{items.map((x, i) => <article className="pf-card" key={i}><h3>{L(x.title)}</h3>{x.text && <p>{L(x.text)}</p>}</article>)}</div>
  );
  const Bullets = ({ items }: { items: { title: LocalText; text?: LocalText }[] }) => (
    <ul className="pf-bullets">{items.map((x, i) => <li key={i}><b>{L(x.title)}</b>{x.text ? ` · ${L(x.text)}` : ''}</li>)}</ul>
  );
  const Chips = ({ items }: { items: string[] }) => <div className="pf-chips">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
  const Shot = ({ src, i, main = false }: { src: string; i: number; main?: boolean }) => (
    <img className={`pf-shot${main ? ' is-main' : ''}`} src={src} alt={`${t('Screenshot', 'ภาพหน้าจอ')} ${i + 1}`} loading="lazy" />
  );
  const Fact = ({ label, pending, children }: { label: string; pending: boolean; children: React.ReactNode }) => (
    <div><dt>{label}</dt><dd className={pending ? 'is-pending' : ''}>{children}</dd></div>
  );
  const notVerified = t('Not yet verified', 'ยังไม่ได้ตรวจสอบ');
  const confirm = t('Confirm with provider', 'ตรวจสอบกับผู้ให้บริการ');

  return (
    <div className={`pf ${F ? 'is-featured' : 'is-free'}`}>
      {notice}
      {F && c.banner && <div className="pf-banner"><img src={c.banner} alt="" /></div>}

      {/* Overview hero: sits above the sticky bar so it hides the bar's compact row until it scrolls away */}
      <header className="pf-hero" id="overview" data-vendor-slug={vendor.slug}>
        <div className="pf-id-row">
          <div className="pf-logo"><VendorLogo name={m.company} sample={sample} /></div>
          <div className="pf-id">
            <div className="pf-title"><h1>{m.title}</h1>{F && <span className="tier-badge">{featuredLabel(locale)} · {t('Sponsored', 'ผู้สนับสนุน')}</span>}</div>
            <p className="pf-by">{mainCat ? categoryName(mainCat, locale) : vendor.category}{m.hasProduct && <> · {t('by', 'โดย')} {m.company}</>}</p>
          </div>
          <div className="pf-actions">{actions()}</div>
        </div>
        <div className="pf-hero-grid">
          <div className="pf-overview">
            <span className="eyebrow"><i>/</i>{t('Overview', 'ภาพรวม')}</span>
            {lead
              ? <p className="pf-lead">{lead}</p>
              : <p className="pf-lead is-pending">{t('Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ')}</p>}
            {tags.length > 0 && <Chips items={tags} />}
          </div>
          <div className="pf-meta">
            <div><span className="eyebrow">{t('Categories', 'หมวดหมู่')}</span>
              <div className="pf-cats">{m.categories.map((cat, i) => <Link key={cat.slug} className={i ? '' : 'is-main'} href={`/${locale}/categories/${cat.slug}/`}>{categoryName(cat, locale)}</Link>)}</div>
            </div>
            {awards.length > 0 && (
              <div><span className="eyebrow">{t('Proof', 'การรับรอง')}</span><div className="pf-cats">{awards.map((a, i) => <span key={i}>{L(a)}</span>)}</div></div>
            )}
          </div>
        </div>
      </header>

      <div className="pf-bar">
        <div className="pf-compact">
          <div className="pf-logo is-small"><VendorLogo name={m.company} sample={sample} /></div>
          <div className="pf-id"><b>{m.title}</b><span>{mainCat ? categoryName(mainCat, locale) : vendor.category}{F && <> · <em>{featuredLabel(locale)}</em></>}</span></div>
          <div className="pf-actions">{actions(true)}</div>
        </div>
        <nav className="pf-tabs" aria-label={t('Profile sections', 'ส่วนของโปรไฟล์')}>{tabs.map(([id, label], i) => <a key={id} href={`#${id}`} className={i ? '' : 'is-on'}>{label}</a>)}</nav>
      </div>

      {descText.length > 0 && (
        <Section id="description" title={t('Product description', 'รายละเอียดผลิตภัณฑ์')}>
          {overviewImage
            ? <div className="pf-split"><div className="pf-text">{descText.map((p, i) => <p key={i}>{p}</p>)}</div><img className="pf-shot" src={overviewImage} alt="" loading="lazy" /></div>
            : <div className="pf-text">{descText.map((p, i) => <p key={i}>{F ? p : clip(p, 400)}</p>)}</div>}
        </Section>
      )}

      {(awards.length > 0 || benefits.length > 0) && (
        <Section id="highlights" title={t('Highlights', 'จุดเด่น')}>
          {awards.length > 0 && (
            <>
              <h3 className="pf-sub">{t('Awards and certifications', 'รางวัลและการรับรอง')}</h3>
              <div className="pf-badges">{awards.map((a, i) => <figure key={i}><span className="pf-badge-mark" aria-hidden="true">{['★', '◆', '●'][i % 3]}</span><figcaption>{L(a)}</figcaption></figure>)}</div>
            </>
          )}
          {benefits.length > 0 && (F
            ? <><h3 className="pf-sub">{t('Key benefits', 'ประโยชน์หลัก')}</h3><Cards items={benefits} /></>
            : <Bullets items={benefits} />)}
        </Section>
      )}

      {(features.length > 0 || useCases.length > 0) && (
        <Section id="features" title={t('Features', 'ฟีเจอร์')} aside={F && features.length > 6 ? t(`6 of ${features.length} shown`, `แสดง 6 จาก ${features.length}`) : undefined}>
          {F ? (
            <>
              <Cards items={features.slice(0, 6)} />
              {features.length > 6 && (
                <details className="pf-more"><summary>{t(`View all ${features.length} features`, `ดูฟีเจอร์ทั้งหมด ${features.length} รายการ`)}</summary><Cards items={features.slice(6)} /></details>
              )}
            </>
          ) : <Chips items={features.map((x) => L(x.title))} />}
          <h3 className="pf-sub">{t('Thai market and compliance', 'ตลาดไทยและการปฏิบัติตามกฎหมาย')}</h3>
          <dl className="pf-facts">
            <Fact label={t('Supported languages', 'ภาษาที่รองรับ')} pending={isPending(langs)}>{isPending(langs) ? notVerified : langs}</Fact>
            <Fact label="PDPA" pending>{confirm}</Fact>
          </dl>
          {(useCases.length > 0 || audience.length > 0) && <h3 className="pf-sub">{t('Who uses it', 'ใครใช้งาน')}</h3>}
          {useCases.length > 0 && (F ? <Cards items={useCases} /> : <Bullets items={useCases} />)}
          {audience.length > 0 && <Chips items={audience.map((a) => L(a))} />}
        </Section>
      )}

      {integrations.length > 0 && (
        <Section id="integrations" title={t('Integrations', 'การเชื่อมต่อ')}>
          {F ? (
            <div className="pf-integrations">
              {integrations.map((x, i) => <article key={i}><span className="pf-int-mark" aria-hidden="true">{[...x.name][0]}</span><div><h3>{x.name}</h3>{x.text && <p>{L(x.text)}</p>}</div></article>)}
            </div>
          ) : <Chips items={integrations.map((x) => x.name)} />}
        </Section>
      )}

      {(shots.length > 0 || videos.length > 0) && (
        <Section id="showcase" title={t('Showcase', 'ตัวอย่างผลิตภัณฑ์')} aside={F ? t(`${shots.length} images · ${videos.length} videos`, `${shots.length} ภาพ · ${videos.length} วิดีโอ`) : undefined}>
          {shots.length > 0 && (
            <div className="pf-gallery">
              <Shot src={shots[0]} i={0} main />
              {shots.length > 1 && <div className="pf-thumbs">{shots.slice(1).map((s, i) => <Shot key={i} src={s} i={i + 1} />)}</div>}
            </div>
          )}
          {videos.length > 0 && (
            <>
              <h3 className="pf-sub">{t('Demo videos', 'วิดีโอสาธิต')}</h3>
              <div className="pf-videos">
                {videos.map((v, i) => v.url
                  ? <a key={i} className="pf-video" href={v.url} {...ext}><span className="pf-play" aria-hidden="true" />{L(v.title)}</a>
                  : <div key={i} className="pf-video"><span className="pf-play" aria-hidden="true" />{L(v.title)}</div>)}
              </div>
            </>
          )}
        </Section>
      )}

      {((priceModel && !isPending(priceModel)) || plans.length > 0) && (
        <Section id="pricing" title={t('Pricing', 'ราคา')} aside={F && L(c.pricing?.summary) ? L(c.pricing?.summary) : undefined}>
          {promo && (
            <a className="pf-promo" href={promo.url} {...ext}>
              <span><small>{t('Special offer', 'ข้อเสนอพิเศษ')}</small><b>{L(promo.text)}</b></span>
              <span className="pf-promo-go">{t('Claim offer', 'รับข้อเสนอ')} →</span>
            </a>
          )}
          {F && plans.length > 0 ? (
            <>
              <div className="pf-plans">
                {plans.map((pl, i) => (
                  <article className={`pf-plan${pl.popular ? ' is-popular' : ''}`} key={i}>
                    <span className="pf-plan-name">{L(pl.name)}{pl.popular && ` · ${t('most chosen', 'นิยมที่สุด')}`}</span>
                    <div className="pf-price"><b>{L(pl.price)}</b>{pl.period && L(pl.period) && <span> / {L(pl.period)}</span>}</div>
                    {pl.text && <p>{L(pl.text)}</p>}
                  </article>
                ))}
              </div>
              {compare.length > 0 && (
                <>
                  <h3 className="pf-sub">{t('Pricing plan comparison', 'เปรียบเทียบแพ็กเกจ')}</h3>
                  <div className="pf-compare">
                    <table>
                      <thead><tr><th>{t('What you get', 'สิ่งที่ได้รับ')}</th>{plans.map((pl, i) => <th key={i} className={pl.popular ? 'is-popular' : ''}>{L(pl.name)}</th>)}</tr></thead>
                      <tbody>
                        {compare.map((row, r) => (
                          <tr key={r}><td>{L(row.label)}</td>{plans.map((pl, i) => {
                            const v = row.values[i];
                            return <td key={i} className={pl.popular ? 'is-popular' : ''}>{v === 'yes' ? <span className="pf-yes" aria-label={t('Included', 'มี')}>✓</span> : v === 'no' ? <span className="pf-no" aria-label={t('Not included', 'ไม่มี')}>—</span> : L(v)}</td>;
                          })}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="pf-lead is-sm">
              {plans.length > 0
                ? (freePlan ? t('Free plan available', 'มีแพ็กเกจฟรี') : `${t('Starts at', 'เริ่มต้น')} ${L(plans[0].price)}${plans[0].period && L(plans[0].period) ? ' ' + L(plans[0].period) : ''}`)
                : priceModel}
            </p>
          )}
          <p className="pf-note">{t('Supplied by the vendor; confirm before buying.', 'ข้อมูลจากผู้ให้บริการ โปรดยืนยันก่อนซื้อ')}</p>
        </Section>
      )}

      {(customers.length > 0 || testimonials.length > 0 || studies.length > 0) && (
        <Section id="customers" title={t('Customer stories', 'เรื่องราวลูกค้า')} aside={t('Supplied by the vendor', 'ข้อมูลจากผู้ให้บริการ')}>
          {customers.length > 0 && <div className="pf-logos">{customers.map((n, i) => <span key={i}>{L(n)}</span>)}</div>}
          {testimonials.map((q, i) => (
            <figure className="pf-quote" key={i}><blockquote>{L(q.quote)}</blockquote><figcaption><b>{L(q.name)}</b>{q.role && ` · ${L(q.role)}`}</figcaption></figure>
          ))}
          {studies.length > 0 && (
            <div className="pf-cards">
              {studies.map((s, i) => <article className="pf-card" key={i}><span className="pf-case-customer">{L(s.customer)}</span><h3>{L(s.problem)}</h3><p>{L(s.solution)}</p></article>)}
            </div>
          )}
        </Section>
      )}

      {faqs.length > 0 && (
        <Section id="questions" title={t('Questions', 'คำถาม')}>
          <div className="pf-faq">{faqs.map((f, i) => <details key={i} open={i === 0}><summary>{L(f.q)}</summary><p>{L(f.a)}</p></details>)}</div>
        </Section>
      )}

      <Section id="company" title={t('Company', 'บริษัท')}>
        {F && L(co.overview) && <p className="pf-text-p">{L(co.overview)}</p>}
        <dl className="pf-facts">
          <Fact label={t('Company', 'บริษัท')} pending={false}>{co.name || m.company}</Fact>
          <Fact label={t('Country', 'ประเทศ')} pending={!L(co.country)}>{L(co.country) || notVerified}</Fact>
          <Fact label={t('Website', 'เว็บไซต์')} pending={!m.website}>{m.website ? <a href={m.website} {...ext}>{m.website.replace(/^https?:\/\//, '')}</a> : notVerified}</Fact>
          <Fact label={t('Pricing model', 'รูปแบบราคา')} pending={isPending(priceModel)}>{isPending(priceModel) ? notVerified : priceModel}</Fact>
          <Fact label={t('Event', 'งานอีเวนต์')} pending={false}>MarTech Expo 2027</Fact>
        </dl>
        {!F && !sample && (
          <p className="pf-note"><Link href={`/${locale}/for-providers/`}>{t('Is this your product? Claim this profile →', 'เป็นผลิตภัณฑ์ของคุณใช่ไหม อัปเดตโปรไฟล์นี้ →')}</Link></p>
        )}
      </Section>

      {F && actions().length > 0 && (
        <section className="pf-cta">
          <div>
            <span className="eyebrow"><i>/</i>{t(`Ready to try ${m.title}?`, `พร้อมลองใช้ ${m.title} หรือยัง`)}</span>
            <h2>{lead || t(`Talk to ${m.company}`, `ติดต่อ ${m.company}`)}</h2>
          </div>
          <div className="pf-cta-actions">
            {c.demoUrl && <a className="button" href={c.demoUrl} {...ext}>{t('Book a demo', 'นัดสาธิต')}</a>}
            {c.trialUrl && <a className="button secondary" href={c.trialUrl} {...ext}>{t('Start free trial', 'เริ่มทดลองใช้ฟรี')}</a>}
            {m.website && <a className="text-cta" href={m.website} {...ext}>{t('Visit website', 'ไปที่เว็บไซต์')} ↗</a>}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="pf-section pf-related" id="related"><div className="pf-head"><h2>{t('Related tools', 'เครื่องมือที่เกี่ยวข้อง')}</h2></div><div className="route-grid pf-related-grid">{related}</div></section>
      )}

      {L(c.imageCredits) && <p className="disclosure">{L(c.imageCredits)}</p>}
      <p className="disclosure">
        {F
          ? t('Featured profiles are paid placements. Content is supplied by the vendor and facts are pending editorial verification.', 'โปรไฟล์แนะนำเป็นพื้นที่แบบชำระเงิน เนื้อหามาจากผู้ให้บริการ และข้อมูลยังรอการตรวจสอบโดยกองบรรณาธิการ')
          : t('This profile is pending factual review before more details are published.', 'โปรไฟล์นี้อยู่ระหว่างตรวจสอบข้อมูลก่อนเผยแพร่รายละเอียดเพิ่มเติม')}{' '}
        <Link href={`/${locale}/editorial-policy/`}>{t('Editorial policy', 'นโยบายบรรณาธิการ')}</Link>
      </p>
    </div>
  );
}
