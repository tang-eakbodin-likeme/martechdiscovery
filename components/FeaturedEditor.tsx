'use client';

// Featured vendors edit their profile in place: the editor follows the profile page's sections,
// then the real profile page renders the draft as a preview before the vendor confirms.
import Link from 'next/link';
import { useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import { local, pick, type Locale, type LocalText } from '@/lib/i18n';
import type { Vendor } from '@/lib/catalog';
import type { CAPS, ProfileContent } from '@/lib/profiles';
import { ProfilePage } from './ProfilePage';
import { CardList, CategoryPicker, ItemTools, TagInput, Txt, Upload, dragProps, move, type CatOption } from './EditKit';

type Cap = (typeof CAPS)['featured'];
type Titled = { title: LocalText; text?: LocalText };

// which part of the request (lib/editParts) each changed content field belongs to
const PART_OF: Record<string, string> = {
  logo: 'logo', banner: 'media', company: 'description', productName: 'description', tagline: 'description', description: 'description', overview: 'description',
  benefits: 'product', features: 'product', useCases: 'product', integrations: 'product', categories: 'categories',
  website: 'contact', demoUrl: 'contact', trialUrl: 'contact', pricing: 'pricing', screenshots: 'media', videos: 'media',
  audienceText: 'product', audience: 'product', industries: 'product', testimonials: 'proof', caseStudies: 'proof', customers: 'proof', awards: 'proof', promotion: 'promo', cta: 'promo',
};
export const changedParts = (a: ProfileContent, b: ProfileContent) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof ProfileContent>;
  return [...new Set([...keys].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map((k) => PART_OF[k] ?? 'other'))];
};

type Plan = NonNullable<NonNullable<ProfileContent['pricing']>['plans']>[number];
type CompareRow = NonNullable<NonNullable<ProfileContent['pricing']>['compare']>[number];
/** Comparison values follow their plan: CardList hands back the same plan objects (an edited one keeps its place), so match by reference; a new plan starts as "no". */
export function syncCompare(before: Plan[], after: Plan[], rows: CompareRow[]): CompareRow[] {
  const from = after.map((p, i) => { const j = before.indexOf(p); return j >= 0 ? j : after.length === before.length ? i : -1; });
  return rows.map((r) => ({ ...r, values: from.map((j) => (j >= 0 ? r.values[j] ?? 'no' : 'no')) }));
}

export function FeaturedEditor({ locale, vendor, initial, cap, cats, onConfirm }: {
  locale: Locale; vendor: Vendor; initial: ProfileContent; cap: Cap; cats: CatOption[]; onConfirm: (content: ProfileContent) => void;
}) {
  const [d, setD] = useState<ProfileContent>(initial);
  const [preview, setPreview] = useState(false);
  const t = (en: string, th: string) => pick(locale, en, th);
  const L = (v?: LocalText | null) => local(v, locale);
  // a text field keeps its other language; the editor changes the one on screen
  const put = (v: LocalText | undefined, s: string): LocalText => ({ ...(typeof v === 'object' && v ? v : typeof v === 'string' ? { en: v, th: v } : {}), [locale]: s });
  const edit = (fn: (n: ProfileContent) => void) => setD((cur) => { const n = structuredClone(cur); fn(n); return n; });
  const parts = changedParts(initial, d);
  const profile = `/${locale}/providers/${vendor.slug}/`;
  const tools = { del: t('Delete', 'ลบ'), prev: t('Move earlier', 'เลื่อนไปก่อนหน้า'), next: t('Move later', 'เลื่อนไปถัดไป'), drag: t('Drag to reorder', 'ลากเพื่อจัดลำดับ') };
  const T = (label: string, v: LocalText | undefined, set: (x: LocalText) => void, o: { multiline?: boolean; max?: number; className?: string; caption?: boolean } = {}) =>
    <Txt label={label} placeholder={t(`Add ${label.toLowerCase()}`, `เพิ่ม${label}`)} value={L(v)} onChange={(s) => set(put(v, s))} {...o} />;
  const titled = (x: Titled, set: (n: Titled) => void) => <>
    <h3>{T(t('Title', 'หัวข้อ'), x.title, (v) => set({ ...x, title: v }))}</h3>
    <p>{T(t('Text', 'รายละเอียด'), x.text, (v) => set({ ...x, text: v }), { multiline: true })}</p>
  </>;
  const newTitled = (): Titled => ({ title: { [locale]: t('New card', 'การ์ดใหม่') } });

  const bar = (
    <div className="ek-bar" role="region" aria-label={t('Editor actions', 'การดำเนินการ')}>
      <span>{preview ? t('Preview: this is how buyers will see your profile.', 'ตัวอย่าง: ผู้ซื้อจะเห็นโปรไฟล์ของคุณแบบนี้')
        : parts.length ? t(`${parts.length} part(s) changed`, `แก้ไขแล้ว ${parts.length} ส่วน`) : t('Click any text, image or card to edit it.', 'คลิกข้อความ รูปภาพ หรือการ์ดเพื่อแก้ไข')}</span>
      <div>
        {preview
          ? <button type="button" className="button secondary small" onClick={() => setPreview(false)}><PencilLine size={15} aria-hidden="true" /> {t('Back to editing', 'กลับไปแก้ไข')}</button>
          : <Link className="button secondary small" href={profile}>{t('Cancel', 'ยกเลิก')}</Link>}
        {preview
          ? <button type="button" className="button small" disabled={!parts.length} onClick={() => onConfirm(d)}>{t('Confirm and publish', 'ยืนยันและเผยแพร่')}</button>
          : <button type="button" className="button small" onClick={() => { setPreview(true); scrollTo(0, 0); }}><Eye size={15} aria-hidden="true" /> {t('Preview', 'ดูตัวอย่าง')}</button>}
      </div>
    </div>
  );

  if (preview) return (
    <>
      {bar}
      {!parts.length && <p className="ek-note">{t('Nothing has changed yet.', 'ยังไม่มีการแก้ไข')}</p>}
      {d.banner && <div className="pf-banner"><img src={d.banner} alt="" /></div>}
      <div className="ek-preview"><ProfilePage vendor={vendor} content={d} locale={locale} related={[]} sample /></div>
    </>
  );

  // comparison table: columns are the plans above; each cell is a tick, a dash or short text
  const compareEditor = () => {
    const plans = d.pricing?.plans ?? [];
    const rows = d.pricing?.compare ?? [];
    const setRows = (next: CompareRow[]) => edit((n) => { n.pricing = { ...n.pricing, compare: next }; });
    const setCell = (r: number, i: number, v: CompareRow['values'][number]) => setRows(rows.map((row, k) => (k === r ? { ...row, values: plans.map((_, j) => (j === i ? v : row.values[j] ?? 'no')) } : row)));
    const kind = (v: CompareRow['values'][number] | undefined) => (v === 'yes' || v === 'no' ? v : 'text');
    return (
      <div className="ek-compare-wrap">
        <table className="ek-compare">
          <thead><tr><th scope="col">{t('Row', 'หัวข้อ')}</th>{plans.map((p, i) => <th scope="col" key={i}>{L(p.name) || t(`Plan ${i + 1}`, `แพ็กเกจ ${i + 1}`)}</th>)}<th aria-label={t('Delete', 'ลบ')} /></tr></thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <th scope="row">{T(t('Row label', 'ชื่อหัวข้อ'), row.label, (v) => setRows(rows.map((x, k) => (k === r ? { ...x, label: v } : x))), { caption: false })}</th>
                {plans.map((p, i) => {
                  const v = row.values[i];
                  return (
                    <td key={i}>
                      <select aria-label={`${L(row.label)}: ${L(p.name)}`} value={kind(v)} onChange={(e) => setCell(r, i, e.target.value === 'text' ? put(undefined, '') : (e.target.value as 'yes' | 'no'))}>
                        <option value="yes">✓ {t('Included', 'มี')}</option>
                        <option value="no">– {t('Not included', 'ไม่มี')}</option>
                        <option value="text">{t('Text…', 'ข้อความ…')}</option>
                      </select>
                      {kind(v) === 'text' && <Txt caption={false} label={`${L(row.label)}: ${L(p.name)}`} placeholder={t('Value', 'ค่า')} value={L(v as LocalText)} onChange={(x) => setCell(r, i, put(v as LocalText, x))} />}
                    </td>
                  );
                })}
                <td><button type="button" className="ek-del" onClick={() => setRows(rows.filter((_, k) => k !== r))}>{t('Delete', 'ลบ')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length < 15 && <button type="button" className="ek-upload" onClick={() => setRows([...rows, { label: put(undefined, t('New row', 'หัวข้อใหม่')), values: plans.map(() => 'no' as const) }])}>+ {t('Add a row', 'เพิ่มหัวข้อ')}</button>}
      </div>
    );
  };

  const sec = (id: string, title: string, children: React.ReactNode, aside?: string) => (
    <section className="pf-section" id={`edit-${id}`}><div className="pf-head"><h2>{title}</h2>{aside && <span className="pf-aside">{aside}</span>}</div>{children}</section>
  );
  const shots = d.screenshots ?? [];
  return (
    <div className="pf is-featured ek">
      {bar}
      <section className="ek-banner" aria-label={t('Banner', 'แบนเนอร์')}>
        <div className="vendor-section-head"><b>{t('Banner', 'แบนเนอร์')}</b><small>{t('Shown across the top of your profile. Recommended 2880 × 440 px; text inside the image is not translated.', 'แสดงเต็มความกว้างด้านบนของโปรไฟล์ แนะนำขนาด 2880 × 440 px ข้อความในภาพจะไม่ถูกแปล')}</small></div>
        {d.banner ? <img src={d.banner} alt="" /> : <div className="ek-banner-empty">{t('No banner yet', 'ยังไม่มีแบนเนอร์')}</div>}
        <div className="ek-banner-actions">
          <Upload label={d.banner ? t('Replace banner', 'เปลี่ยนแบนเนอร์') : t('Upload banner', 'อัปโหลดแบนเนอร์')} accept="image/*" onFile={(u) => edit((n) => { n.banner = u; })} />
          {d.banner && <button type="button" className="ek-del" onClick={() => edit((n) => { n.banner = undefined; })}>{t('Remove', 'ลบ')}</button>}
        </div>
      </section>
      <header className="pf-hero ek-hero">
        <div className="pf-id-row">
          <div className="pf-logo ek-logo">
            {d.logo && <span className="vendor-logo-source"><img src={d.logo} alt="" /></span>}
            <Upload label={t('Change logo', 'เปลี่ยนโลโก้')} accept="image/*" onFile={(u) => edit((n) => { n.logo = u; })} />
          </div>
          <div className="pf-id"><div className="pf-title"><h1>
            <Txt label={t('Company name', 'ชื่อบริษัท')} placeholder={t('Company name', 'ชื่อบริษัท')} value={d.company?.name ?? ''} onChange={(s) => edit((n) => { n.company = { ...n.company, name: s }; })} />
          </h1></div></div>
        </div>
        <div className="ek-grid">
          <span className="ek-label">{t('Product name', 'ชื่อผลิตภัณฑ์')}</span>
          <Txt caption={false} label={t('Product name', 'ชื่อผลิตภัณฑ์')} placeholder={t('Product name', 'ชื่อผลิตภัณฑ์')} value={d.productName ?? ''} onChange={(s) => edit((n) => { n.productName = s; })} />
          <span className="ek-label">{t('Tagline', 'คำโปรย')}</span>
          {T(t('Tagline', 'คำโปรย'), d.tagline, (v) => edit((n) => { n.tagline = v; }), { multiline: true, caption: false })}
          <span className="ek-label">{t('Description', 'คำอธิบาย')}<small>{t(`Up to ${cap.description} characters`, `สูงสุด ${cap.description} ตัวอักษร`)}</small></span>
          {T(t('Description', 'คำอธิบาย'), d.description, (v) => edit((n) => { n.description = v; }), { multiline: true, max: cap.description, caption: false })}
        </div>
      </header>

      {sec('categories', t('Categories', 'หมวดหมู่'), <CategoryPicker options={cats} value={d.categories ?? []} max={cap.categories}
        onChange={(v) => edit((n) => { n.categories = v.filter(Boolean); })}
        labels={{ main: t('Main category', 'หมวดหมู่หลัก'), more: t('Category', 'หมวดหมู่เพิ่มเติม'), pick: t('Choose a category', 'เลือกหมวดหมู่'), add: t('Add a category', 'เพิ่มหมวดหมู่'), del: t('Remove', 'ลบ') }} />,
        `${d.categories?.length ?? 0}/${cap.categories}`)}

      {sec('description', t('Description', 'รายละเอียด'), <div className="ek-split">
        {T(t('Overview', 'ภาพรวม'), d.overview?.text, (v) => edit((n) => { n.overview = { ...n.overview, text: v }; }), { multiline: true })}
        <div className="ek-media">
          {d.overview?.image && <img src={d.overview.image} alt="" />}
          <Upload label={t('Upload image', 'อัปโหลดภาพ')} accept="image/*" onFile={(u) => edit((n) => { n.overview = { ...n.overview, image: u }; })} />
        </div>
      </div>)}

      {sec('highlights', t('Highlights', 'จุดเด่น'), <CardList items={d.benefits ?? []} max={cap.benefits} make={newTitled} addLabel={t('Add a benefit', 'เพิ่มจุดเด่น')} tools={tools}
        onChange={(v) => edit((n) => { n.benefits = v; })} render={titled} />, `${d.benefits?.length ?? 0}/${cap.benefits}`)}

      {sec('features', t('Features', 'ฟีเจอร์'), <>
        <CardList items={d.features ?? []} max={cap.features} make={newTitled} addLabel={t('Add a feature', 'เพิ่มฟีเจอร์')} tools={tools}
          onChange={(v) => edit((n) => { n.features = v; })} render={titled} />
        <h3 className="ek-sub">{t('Who uses it', 'ใครใช้งาน')}</h3>
        <p className="ek-line">{T(t('Who it is for', 'เหมาะกับใคร'), d.audienceText, (v) => edit((n) => { n.audienceText = v; }), { multiline: true })}</p>
        <div className="ek-tag-groups">
          <TagInput label={t('Best for teams', 'เหมาะสำหรับทีม')} placeholder={t('Add a team', 'เพิ่มทีม')} addLabel={t('Add', 'เพิ่ม')} removeLabel={t('Remove', 'ลบ')}
            tags={(d.audience ?? []).map((a) => L(a))} onChange={(v) => edit((n) => { n.audience = v.map((x) => n.audience?.find((a) => L(a) === x) ?? put(undefined, x)); })} />
          <TagInput label={t('Best for industries', 'เหมาะสำหรับอุตสาหกรรม')} placeholder={t('Add an industry', 'เพิ่มอุตสาหกรรม')} addLabel={t('Add', 'เพิ่ม')} removeLabel={t('Remove', 'ลบ')}
            tags={(d.industries ?? []).map((a) => L(a))} onChange={(v) => edit((n) => { n.industries = v.map((x) => n.industries?.find((a) => L(a) === x) ?? put(undefined, x)); })} />
        </div>
        <h3 className="ek-sub">{t('Use cases', 'กรณีการใช้งาน')} <small>{d.useCases?.length ?? 0}/{cap.useCases}</small></h3>
        <CardList items={d.useCases ?? []} max={cap.useCases} make={newTitled} addLabel={t('Add a use case', 'เพิ่มกรณีการใช้งาน')} tools={tools}
          onChange={(v) => edit((n) => { n.useCases = v; })} render={titled} />
      </>, `${d.features?.length ?? 0}/${cap.features}`)}

      {sec('showcase', t('Showcase', 'ตัวอย่าง'), <>
        <div className="ek-shots">
          {shots.map((src, i) => (
            <figure key={i} className="ek-shot" {...dragProps(i, (from, to) => edit((n) => { n.screenshots = move(shots, from, to); }))}>
              <ItemTools i={i} count={shots.length} labels={tools} onMove={(to) => edit((n) => { n.screenshots = move(shots, i, to); })} onDelete={() => edit((n) => { n.screenshots = shots.filter((_, j) => j !== i); })} />
              <img src={src} alt="" draggable={false} />
              <Upload label={t('Replace image', 'เปลี่ยนภาพ')} accept="image/*" onFile={(u) => edit((n) => { n.screenshots = shots.map((x, j) => (j === i ? u : x)); })} />
            </figure>
          ))}
          {shots.length < cap.screenshots && <div className="ek-shot is-add"><Upload label={t(`Add image (${shots.length}/${cap.screenshots})`, `เพิ่มภาพ (${shots.length}/${cap.screenshots})`)} accept="image/*" onFile={(u) => edit((n) => { n.screenshots = [...shots, u]; })} /></div>}
        </div>
        <h3 className="ek-sub">{t('Videos', 'วิดีโอ')} <small>{d.videos?.length ?? 0}/{cap.videos}</small></h3>
        <CardList items={d.videos ?? []} max={cap.videos} make={() => ({ title: { [locale]: t('New video', 'วิดีโอใหม่') } })} addLabel={t('Add a video', 'เพิ่มวิดีโอ')} tools={tools}
          onChange={(v) => edit((n) => { n.videos = v; })} render={(v, set) => <>
            <div className="ek-media">{v.thumb && <img src={v.thumb} alt="" />}
              <Upload label={t('Upload video', 'อัปโหลดวิดีโอ')} accept="video/*" onFile={(u) => set({ ...v, url: u })} />
              <Upload label={t('Cover image', 'ภาพปก')} accept="image/*" onFile={(u) => set({ ...v, thumb: u })} />
            </div>
            <h3>{T(t('Video title', 'ชื่อวิดีโอ'), v.title, (x) => set({ ...v, title: x }))}</h3>
            <p><Txt label={t('Video link', 'ลิงก์วิดีโอ')} placeholder={t('Or paste a YouTube link', 'หรือวางลิงก์ YouTube')} value={v.url?.startsWith('blob:') ? t('Uploaded file', 'ไฟล์ที่อัปโหลด') : v.url ?? ''} onChange={(s) => set({ ...v, url: s })} /></p>
          </>} />
      </>, `${shots.length}/${cap.screenshots}`)}

      {sec('pricing', t('Pricing', 'ราคา'), <>
        <p className="ek-line">{T(t('Pricing model', 'รูปแบบราคา'), d.pricing?.summary, (v) => edit((n) => { n.pricing = { ...n.pricing, summary: v }; }))}</p>
        <CardList items={d.pricing?.plans ?? []} max={4} make={() => ({ name: { [locale]: t('New plan', 'แพ็กเกจใหม่') }, price: '' })} addLabel={t('Add a plan', 'เพิ่มแพ็กเกจ')} tools={tools}
          onChange={(v) => edit((n) => { n.pricing = { ...n.pricing, plans: v, compare: syncCompare(d.pricing?.plans ?? [], v, n.pricing?.compare ?? []) }; })} render={(p, set) => <>
            <h3>{T(t('Plan name', 'ชื่อแพ็กเกจ'), p.name, (x) => set({ ...p, name: x }))}</h3>
            <p className="ek-price">{T(t('Price', 'ราคา'), p.price, (x) => set({ ...p, price: x }))} {T(t('Period', 'รอบบิล'), p.period, (x) => set({ ...p, period: x }))}</p>
            <p>{T(t('Plan details', 'รายละเอียดแพ็กเกจ'), p.text, (x) => set({ ...p, text: x }), { multiline: true })}</p>
          </>} />
        <h3 className="ek-sub">{t('Plan comparison', 'ตารางเปรียบเทียบแพ็กเกจ')} <small>{(d.pricing?.compare ?? []).length}/15</small></h3>
        {(d.pricing?.plans ?? []).length < 2
          ? <p className="ek-note">{t('Add at least two plans to compare them.', 'เพิ่มแพ็กเกจอย่างน้อย 2 แพ็กเกจเพื่อเปรียบเทียบ')}</p>
          : compareEditor()}
      </>)}

      {sec('customers', t('Customers', 'รีวิว'), <>
        <h3 className="ek-sub">{t('Testimonials', 'คำรับรอง')} <small>{d.testimonials?.length ?? 0}/{cap.testimonials}</small></h3>
        <CardList items={d.testimonials ?? []} max={cap.testimonials} make={() => ({ quote: { [locale]: '' }, name: { [locale]: '' } })} addLabel={t('Add a testimonial', 'เพิ่มคำรับรอง')} tools={tools}
          onChange={(v) => edit((n) => { n.testimonials = v; })} render={(x, set) => <>
            <p>{T(t('Quote', 'คำรับรอง'), x.quote, (v) => set({ ...x, quote: v }), { multiline: true })}</p>
            <h3>{T(t('Name', 'ชื่อ'), x.name, (v) => set({ ...x, name: v }))}</h3>
            <p>{T(t('Role', 'ตำแหน่ง'), x.role, (v) => set({ ...x, role: v }))}</p>
          </>} />
        <h3 className="ek-sub">{t('Case studies', 'กรณีศึกษา')} <small>{d.caseStudies?.length ?? 0}/{cap.caseStudies}</small></h3>
        <CardList items={d.caseStudies ?? []} max={cap.caseStudies} make={() => ({ customer: { [locale]: t('New customer', 'ลูกค้าใหม่') }, problem: '', solution: '' })} addLabel={t('Add a case study', 'เพิ่มกรณีศึกษา')} tools={tools}
          onChange={(v) => edit((n) => { n.caseStudies = v; })} render={(x, set) => <>
            <h3>{T(t('Customer', 'ลูกค้า'), x.customer, (v) => set({ ...x, customer: v }))}</h3>
            <p>{T(t('Problem', 'ปัญหา'), x.problem, (v) => set({ ...x, problem: v }), { multiline: true })}</p>
            <p>{T(t('Solution', 'วิธีแก้'), x.solution, (v) => set({ ...x, solution: v }), { multiline: true })}</p>
            <p>{T(t('Result', 'ผลลัพธ์'), x.result, (v) => set({ ...x, result: v }), { multiline: true })}</p>
          </>} />
      </>)}

      {sec('questions', 'FAQ', <CardList className="pf-cards ek-one" items={d.faqs ?? []} max={cap.faqs} make={() => ({ q: { [locale]: t('New question', 'คำถามใหม่') }, a: '' })} addLabel={t('Add a question', 'เพิ่มคำถาม')} tools={tools}
        onChange={(v) => edit((n) => { n.faqs = v; })} render={(x, set) => <>
          <h3>{T(t('Question', 'คำถาม'), x.q, (v) => set({ ...x, q: v }))}</h3>
          <p>{T(t('Answer', 'คำตอบ'), x.a, (v) => set({ ...x, a: v }), { multiline: true })}</p>
        </>} />, `${d.faqs?.length ?? 0}/${cap.faqs}`)}

      {sec('company', t('Company', 'รายละเอียดบริษัท'), <dl className="pf-facts ek-facts">
        <div><dt>{t('About the company', 'เกี่ยวกับบริษัท')}</dt><dd>{T(t('About the company', 'เกี่ยวกับบริษัท'), d.company?.overview, (v) => edit((n) => { n.company = { ...n.company, overview: v }; }), { multiline: true, caption: false })}</dd></div>
        <div><dt>{t('Country', 'ประเทศ')}</dt><dd>{T(t('Country', 'ประเทศ'), d.company?.country, (v) => edit((n) => { n.company = { ...n.company, country: v }; }), { caption: false })}</dd></div>
        <div><dt>{t('Website', 'เว็บไซต์')}</dt><dd><Txt caption={false} label={t('Website', 'เว็บไซต์')} placeholder="https://" value={d.website ?? ''} onChange={(s) => edit((n) => { n.website = s; })} /></dd></div>
        <div><dt>{t('Demo link', 'ลิงก์นัดสาธิต')}</dt><dd><Txt caption={false} label={t('Demo link', 'ลิงก์นัดสาธิต')} placeholder="https://" value={d.demoUrl ?? ''} onChange={(s) => edit((n) => { n.demoUrl = s; })} /></dd></div>
        <div><dt>{t('Free trial link', 'ลิงก์ทดลองใช้ฟรี')}</dt><dd><Txt caption={false} label={t('Free trial link', 'ลิงก์ทดลองใช้ฟรี')} placeholder="https://" value={d.trialUrl ?? ''} onChange={(s) => edit((n) => { n.trialUrl = s; })} /></dd></div>
        <div><dt>{t('Promotion', 'โปรโมชัน')}</dt><dd>{T(t('Promotion', 'โปรโมชัน'), d.promotion?.text, (v) => edit((n) => { n.promotion = { ...n.promotion, text: v }; }), { multiline: true, caption: false })}</dd></div>
      </dl>)}
    </div>
  );
}
