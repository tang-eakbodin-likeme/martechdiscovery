import Link from 'next/link';
import { categoryName, type Vendor } from '@/lib/catalog';
import { local, pick, type Locale, type LocalText } from '@/lib/i18n';
import { profileModel, clip, type ProfileContent } from '@/lib/profiles';
import { VendorLogo } from './VendorLogo';
import { featuredLabel } from './VendorCard';
import { ProfileTabs } from './ProfileTabs';
import { ScreenshotCarousel, ShowAllToggle, TestimonialRotator } from './ProfileWidgets';

type Props = { vendor: Vendor; content?: ProfileContent; locale: Locale; related: React.ReactNode[]; notice?: React.ReactNode; sample?: boolean };

const isPending = (v?: string) => !v || /not yet verified|confirm with provider/i.test(v);

function Section({ id, title, aside, children, className = '' }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`pf-section ${className}`} id={id}>
      <div className="pf-head"><h2>{title}</h2>{aside && (typeof aside === 'string' ? <span className="pf-aside">{aside}</span> : aside)}</div>
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
  const teams = c.audience ?? [];
  const industries = F ? c.industries ?? [] : [];
  const audience = [...teams, ...industries];
  const priceModel = L(c.pricing?.summary) || vendor.pricing;
  const langs = c.languages || vendor.languages;
  const co = c.company ?? {};
  const promo = F && c.promotion?.text ? c.promotion : undefined;

  // The hero carries one sentence; the rest of the description and the overview text go to Product description.
  const [first, ...rest] = m.description.split(/(?<=[.!?])\s+/);
  const tagline = L(c.tagline);
  const lead = tagline || first;
  const descText = [tagline ? m.description : rest.join(' '), L(c.overview?.text)].filter(Boolean);
  const overviewImage = F ? c.overview?.image : undefined;

  const freePlan = plans.some((p) => /free|ฟรี/i.test(L(p.price)));
  const thai = /thai|ไทย/i.test(langs || '');
  const tags = [freePlan && t('Free plan', 'มีแพ็กเกจฟรี'), F && c.trialUrl && t('Free trial', 'ทดลองใช้ฟรี'), thai && t('Thai support', 'รองรับภาษาไทย')].filter(Boolean) as string[];

  const actions = (small = false) => [
    F && c.trialUrl && <a key="t" className="text-cta" href={c.trialUrl} {...ext}>{t('Free trial', 'ทดลองใช้ฟรี')}</a>,
    m.website && <a key="w" className={`button ${F && c.demoUrl ? 'secondary' : ''}${small ? ' small' : ''}`} href={m.website} {...ext}>{t('Visit website', 'ไปที่เว็บไซต์')} ↗</a>,
    F && c.demoUrl && <a key="d" className={`button${small ? ' small' : ''}`} href={c.demoUrl} {...ext}>{t('Book a demo', 'นัดสาธิต')}</a>,
  ].filter(Boolean);

  const mainCat = m.categories[0];
  const catName = mainCat ? categoryName(mainCat, locale) : vendor.category;
  const tabs: [string, string][] = [
    ['overview', t('Overview', 'ภาพรวม')],
    ...(descText.length ? [['description', t('Description', 'รายละเอียด')]] as [string, string][] : []),
    ...(awards.length || benefits.length ? [['highlights', t('Highlights', 'จุดเด่น')]] as [string, string][] : []),
    ...(features.length || useCases.length ? [['features', t('Features', 'ฟีเจอร์')]] as [string, string][] : []),
    ...(integrations.length ? [['integrations', t('Integrations', 'การเชื่อมต่อ')]] as [string, string][] : []),
    ...(shots.length || videos.length ? [['showcase', t('Showcase', 'ตัวอย่าง')]] as [string, string][] : []),
    ...(priceModel && !isPending(priceModel) || plans.length ? [['pricing', t('Pricing', 'ราคา')]] as [string, string][] : []),
    ...(customers.length || testimonials.length || studies.length ? [['customers', t('Customers', 'รีวิว')]] as [string, string][] : []),
    ...(faqs.length ? [['questions', 'FAQ']] as [string, string][] : []),
    ['company', t('Company', 'บริษัท')],
  ];

  const Cards = ({ items, className = '' }: { items: { title: LocalText; text?: LocalText }[]; className?: string }) => (
    <div className={`pf-cards ${className}`}>{items.map((x, i) => <article className="pf-card" key={i}><h3>{L(x.title)}</h3>{x.text && <p>{L(x.text)}</p>}</article>)}</div>
  );
  const Bullets = ({ items }: { items: { title: LocalText; text?: LocalText }[] }) => (
    <ul className="pf-bullets">{items.map((x, i) => <li key={i}><b>{L(x.title)}</b>{x.text ? ` · ${L(x.text)}` : ''}</li>)}</ul>
  );
  const Chips = ({ items }: { items: string[] }) => <div className="pf-chips">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
  // shortcut: only resizes image-CDN URLs with a w= parameter (Unsplash); vendor uploads need a resize step later
  const sized = (u: string, w: number) => u.replace(/([?&])w=\d+/, `$1w=${w}`);
  const Fact = ({ label, pending, children }: { label: string; pending: boolean; children: React.ReactNode }) => (
    <div><dt>{label}</dt><dd className={pending ? 'is-pending' : ''}>{children}</dd></div>
  );
  const notVerified = t('Not yet verified', 'ยังไม่ได้ตรวจสอบ');
  // awards and customers are plain text, or objects that also carry an image
  const named = <T extends object>(x: LocalText | T): x is T => typeof x === 'object' && x !== null && 'name' in x;
  const awardName = (a: (typeof awards)[number]) => (named(a) ? L(a.name) : L(a));
  const Logo = ({ small = false }: { small?: boolean }) => (
    <div className={`pf-logo${small ? ' is-small' : ''}`}>
      {c.logo ? <span className="vendor-logo-source"><img src={c.logo} alt={small ? '' : m.title} /></span> : <VendorLogo name={m.company} sample={sample} />}
    </div>
  );
  const confirm = t('Confirm with provider', 'ตรวจสอบกับผู้ให้บริการ');
  const Check = ({ ok, label, value }: { ok: boolean; label: string; value: string }) => (
    <li className={ok ? 'is-ok' : 'is-pending'}>
      <span className="pf-check-icon" aria-hidden="true">{ok ? '✓' : '?'}</span>
      <span><b>{label}</b><span>{value}</span></span>
      <em>{ok ? t('Supplied by vendor', 'ข้อมูลจากผู้ให้บริการ') : t('Not yet verified', 'ยังไม่ได้ตรวจสอบ')}</em>
    </li>
  );

  return (
    <div className={`pf ${F ? 'is-featured' : 'is-free'}`}>
      {notice}

      {/* Overview hero: sits above the sticky bar so it hides the bar's compact row until it scrolls away */}
      <header className="pf-hero" id="overview" data-vendor-slug={vendor.slug}>
        <div className="pf-id-row">
          <Logo />
          <div className="pf-id">
            {/* top row: logo, vendor name, paid tag and buttons only; vendor and product details live in the overview */}
            <div className="pf-title"><h1>{m.company}</h1>{F && <span className="tier-badge">{featuredLabel(locale)} · {t('Sponsored', 'ผู้สนับสนุน')}</span>}</div>
          </div>
          <div className="pf-actions">{actions()}</div>
        </div>
        <div className="pf-hero-grid">
          <div className="pf-overview">
            <span className="eyebrow"><i>/</i>{t('Overview', 'ภาพรวม')}</span>
            {/* who the vendor is, then its product and what the product offers */}
            {m.hasProduct ? <>
              {L(co.overview) && <p className="pf-lead">{L(co.overview)}</p>}
              <p className="pf-about">
                {t('Its main product is ', 'ผลิตภัณฑ์หลักของบริษัทคือ ')}<b>{m.title}</b>{t(', in ', ' ในหมวด ')}{catName}
                {lead ? <>{t('. Key strengths: ', ' โดยมีจุดเด่นคือ')}{lead}</> : t('.', '')}
              </p>
            </> : <>
              {lead
                ? <p className="pf-lead">{lead}</p>
                : <p className="pf-lead is-pending">{t('Profile details not yet verified', 'รายละเอียดโปรไฟล์ยังไม่ได้รับการตรวจสอบ')}</p>}
              <p className="pf-about">{m.company}{t(' is listed under ', ' จัดอยู่ในหมวด ')}{catName}{t('.', '')}</p>
            </>}
            {tags.length > 0 && <Chips items={tags} />}
          </div>
          <div className="pf-meta">
            <div><span className="eyebrow">{t('Categories', 'หมวดหมู่')}</span>
              <div className="pf-cats">{m.categories.map((cat, i) => <Link key={cat.slug} className={i ? '' : 'is-main'} href={`/${locale}/categories/${cat.slug}/`}>{categoryName(cat, locale)}</Link>)}{m.categories.length > 1 && <a className="pf-cats-more" href="#features">+{m.categories.length - 1} {t('more', 'เพิ่มเติม')}</a>}</div>
            </div>
            {awards.length > 0 && (
              <div className="pf-proof"><span className="eyebrow">{t('Awards and certifications', 'รางวัลและการรับรอง')}</span><div className="pf-cats">{awards.map((a, i) => <span key={i}>{awardName(a)}</span>)}</div></div>
            )}
          </div>
        </div>
      </header>

      <div className="pf-bar">
        <div className="pf-compact">
          <Logo small />
          <div className="pf-id"><b>{m.company}</b><span>{mainCat ? categoryName(mainCat, locale) : vendor.category}{F && <> · <em>{featuredLabel(locale)}</em></>}</span></div>
          <div className="pf-actions">{actions(true)}</div>
        </div>
        <ProfileTabs tabs={tabs} label={t('Profile sections', 'ส่วนของโปรไฟล์')} />
      </div>

      {descText.length > 0 && (
        <Section id="description" title={t('Product description', 'รายละเอียดผลิตภัณฑ์')}>
          {overviewImage
            ? <div className="pf-split"><div className="pf-text">{descText.map((p, i) => <p key={i}>{p}</p>)}</div><img className="pf-shot" src={sized(overviewImage, 1000)} alt="" loading="lazy" /></div>
            : <div className="pf-text">{descText.map((p, i) => <p key={i}>{F ? p : clip(p, 400)}</p>)}</div>}
        </Section>
      )}

      {(awards.length > 0 || benefits.length > 0) && (
        <Section id="highlights" title={t('Highlights', 'จุดเด่น')}>
          {awards.length > 0 && (
            <>
              <h3 className="pf-sub">{t('Awards and certifications', 'รางวัลและการรับรอง')}</h3>
              <div className="pf-badges">{awards.map((a, i) => (
                <figure key={i} className={named(a) && a.image ? 'has-img' : ''}>
                  {named(a) && a.image ? <img src={a.image} alt="" loading="lazy" /> : <span className="pf-badge-mark" aria-hidden="true">{['★', '◆', '●'][i % 3]}</span>}
                  <figcaption><b>{awardName(a)}</b>{named(a) && a.source && <span>{L(a.source)}</span>}</figcaption>
                </figure>
              ))}</div>
            </>
          )}
          {benefits.length > 0 && (F
            ? <><h3 className="pf-sub">{t('Benefits', 'ประโยชน์หลักที่ได้รับ')}</h3><ul className="pf-benefits">{benefits.map((x, i) => <li key={i}><b>{L(x.title)}</b>{x.text && <span>{L(x.text)}</span>}</li>)}</ul></>
            : <Bullets items={benefits} />)}
        </Section>
      )}

      {(features.length > 0 || useCases.length > 0) && (
        <Section id="features" title={t('Features', 'ฟีเจอร์สำคัญ')} aside={F && features.length > 6 ? <ShowAllToggle more={t(`View all ${features.length} features`, `ดูฟีเจอร์ทั้งหมด ${features.length} รายการ`)} less={t('Show fewer', 'แสดงน้อยลง')} /> : undefined}>
          {F ? <Cards items={features} className="is-capped" /> : <Chips items={features.map((x) => L(x.title))} />}
          <div className="pf-group">
            <h3 className="pf-sub">{t('Thai market and compliance', 'ตลาดไทยและการปฏิบัติตามกฎหมาย')}</h3>
            <ul className="pf-checks">
              <Check ok={!isPending(langs)} label={t('Supported languages', 'ภาษาที่รองรับ')} value={isPending(langs) ? notVerified : langs!} />
              <Check ok={false} label={t('PDPA compliance', 'การปฏิบัติตาม PDPA')} value={confirm} />
            </ul>
          </div>
          {(useCases.length > 0 || audience.length > 0) && (
            <div className="pf-group">
              <h3 className="pf-sub">{t('Who uses it', 'ใครใช้งาน')}</h3>
              {useCases.length > 0 && (F ? <Cards items={useCases} className="is-usecases" /> : <Bullets items={useCases} />)}
              {audience.length > 0 && (
                <dl className="pf-fit">
                  {teams.length > 0 && <div><dt>{t('Best for teams', 'เหมาะสำหรับทีม')}</dt><dd><Chips items={teams.map((a) => L(a))} /></dd></div>}
                  {industries.length > 0 && <div><dt>{t('Best for industries', 'เหมาะสำหรับอุตสาหกรรม')}</dt><dd><Chips items={industries.map((a) => L(a))} /></dd></div>}
                </dl>
              )}
            </div>
          )}
        </Section>
      )}

      {integrations.length > 0 && (
        <Section id="integrations" title={t('Integrations', 'การเชื่อมต่อ')}>
          {F ? (
            <div className="pf-integrations">
              {integrations.map((x, i) => <article key={i}><span className={`pf-int-mark${x.color ? ' has-color' : ''}`} style={x.color ? { background: x.color } : undefined} aria-hidden="true">{[...x.name][0]}</span><div><h3>{x.name}</h3>{x.text && <p>{L(x.text)}</p>}</div></article>)}
            </div>
          ) : <Chips items={integrations.map((x) => x.name)} />}
        </Section>
      )}

      {(shots.length > 0 || videos.length > 0) && (
        <Section id="showcase" title={t('Showcase', 'ตัวอย่างผลิตภัณฑ์')} aside={F ? t(`${shots.length} images · ${videos.length} videos`, `${shots.length} ภาพ · ${videos.length} วิดีโอ`) : undefined}>
          {shots.length > 0 && (
            <ScreenshotCarousel
              shots={shots.map((s, i) => ({ src: sized(s, 1400), thumb: sized(s, 320), alt: `${m.title} · ${t('screenshot', 'ภาพหน้าจอ')} ${i + 1}` }))}
              labels={{ prev: t('Previous screenshot', 'ภาพก่อนหน้า'), next: t('Next screenshot', 'ภาพถัดไป'), region: t('Product screenshots', 'ภาพหน้าจอผลิตภัณฑ์'), show: t('Show screenshot', 'แสดงภาพที่') }}
            />
          )}
          {videos.length > 0 && (
            <>
              <h3 className="pf-sub">{t('Demo videos', 'วิดีโอสาธิต')}</h3>
              <div className="pf-videos">
                {videos.map((v, i) => v.url
                  ? <a key={i} className="pf-video" href={v.url} {...ext} style={v.thumb ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.88)), url(${sized(v.thumb, 700)})` } : undefined}><span className="pf-play" aria-hidden="true" /><span>{L(v.title)}{v.duration && <small> · {v.duration}</small>}</span></a>
                  : <div key={i} className="pf-video" style={v.thumb ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.88)), url(${sized(v.thumb, 700)})` } : undefined}><span className="pf-play" aria-hidden="true" /><span>{L(v.title)}{v.duration && <small> · {v.duration}</small>}</span></div>)}
              </div>
            </>
          )}
        </Section>
      )}

      {((priceModel && !isPending(priceModel)) || plans.length > 0) && (
        <Section id="pricing" title={t('Pricing', 'ราคา')} aside={F && L(c.pricing?.summary) ? L(c.pricing?.summary) : undefined}>
          {promo && (
            <a className="pf-promo" href={promo.url} {...ext}>
              <span><small>{L(promo.label) || t('Special offer', 'ข้อเสนอพิเศษ')}</small><b>{L(promo.text)}</b>{promo.detail && <em>{L(promo.detail)}</em>}</span>
              <span className="pf-promo-go">{t('Claim offer', 'รับข้อเสนอ')} →</span>
            </a>
          )}
          {F && plans.length > 0 ? (
            <>
              <div className="pf-plans">
                {plans.map((pl, i) => (
                  <article className={`pf-plan${pl.popular ? ' is-popular' : ''}`} key={i}>
                    <span className="pf-plan-name">{L(pl.name)}{pl.popular && ` · ${t('most popular', 'นิยมที่สุด')}`}</span>
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
          {customers.length > 0 && <div className="pf-logos">{customers.map((n, i) => named(n) && n.logo ? <span key={i} className="has-img"><img src={n.logo} alt={L(n.name)} loading="lazy" /></span> : <span key={i}>{named(n) ? L(n.name) : L(n)}</span>)}</div>}
          {testimonials.length > 0 && (
            <TestimonialRotator interval={15000} label={t('Customer quotes', 'คำบอกเล่าจากลูกค้า')} show={t('Show quote', 'แสดงคำบอกเล่าที่')} locale={locale}>
              {testimonials.map((q, i) => (
                <figure className="pf-quote" key={i}><blockquote>{L(q.quote)}</blockquote><figcaption><b>{L(q.name)}</b>{q.role && ` · ${L(q.role)}`}</figcaption></figure>
              ))}
            </TestimonialRotator>
          )}
          {studies.length > 0 && (
            <div className="pf-cards">
              {studies.map((s, i) => <article className="pf-card" key={i}><span className="pf-case-customer">{L(s.customer)}</span><h3>{L(s.problem)}</h3><p>{L(s.solution)}</p>{s.result && <b className="pf-case-result">{L(s.result)}</b>}</article>)}
            </div>
          )}
        </Section>
      )}

      {faqs.length > 0 && (
        <Section id="questions" title={t('FAQ', 'คำถามที่พบบ่อย (FAQ)')}>
          <div className="pf-faq">{faqs.map((f, i) => <details key={i} open={i === 0}><summary>{L(f.q)}</summary><p>{L(f.a)}</p></details>)}</div>
        </Section>
      )}

      <Section id="company" title={t('Company', 'รายละเอียดบริษัท')}>
        {F && L(co.overview) && <p className="pf-text-p">{L(co.overview)}</p>}
        <dl className="pf-facts">
          <Fact label={t('Company', 'บริษัท')} pending={false}>{co.name || m.company}</Fact>
          <Fact label={t('Country', 'ประเทศ')} pending={!L(co.country)}>{L(co.country) || notVerified}</Fact>
          <Fact label={t('Website', 'เว็บไซต์')} pending={!m.website}>{m.website ? <><a href={m.website} {...ext}>{m.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>{c.websiteSource === 'public' && <small className="pf-fact-note">{t('Public website, not yet confirmed by the vendor', 'เว็บไซต์สาธารณะ ยังไม่ยืนยันโดยผู้ให้บริการ')}</small>}</> : notVerified}</Fact>
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
            <h2>{L(c.cta?.title) || tagline || t(`Talk to ${m.company}`, `ติดต่อ ${m.company}`)}</h2>
            {L(c.cta?.text) && <p>{L(c.cta?.text)}</p>}
          </div>
          <div className="pf-cta-actions">
            {c.demoUrl && <a className="button" href={c.demoUrl} {...ext}>{t('Book a demo', 'นัดสาธิต')}</a>}
            {c.trialUrl && <a className="button secondary" href={c.trialUrl} {...ext}>{t('Start free trial', 'เริ่มทดลองใช้ฟรี')}</a>}
            {m.website && <a className="text-cta" href={m.website} {...ext}>{t('Visit website', 'ไปที่เว็บไซต์')} ↗</a>}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="pf-section pf-related" id="related"><div className="pf-head"><h2>{t('Related tools', 'เครื่องมือที่เกี่ยวข้อง')}</h2></div><div className="pf-related-grid">{related}</div></section>
      )}

      {L(c.imageCredits) && <p className="disclosure">{L(c.imageCredits)}</p>}
      <p className="disclosure">
        {F
          ? t('Featured profiles are paid placements. The vendor supplied this content, and our editors have not verified the facts yet.', 'โปรไฟล์แนะนำเป็นพื้นที่แบบชำระเงิน เนื้อหามาจากผู้ให้บริการ และข้อมูลยังรอการตรวจสอบโดยกองบรรณาธิการ')
          : t('This profile is pending factual review before more details are published.', 'โปรไฟล์นี้อยู่ระหว่างตรวจสอบข้อมูลก่อนเผยแพร่รายละเอียดเพิ่มเติม')}{' '}
        <Link href={`/${locale}/editorial-policy/`}>{t('Editorial policy', 'นโยบายบรรณาธิการ')}</Link>
      </p>
    </div>
  );
}
