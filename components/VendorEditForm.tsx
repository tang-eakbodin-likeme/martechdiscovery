'use client';

import Link from 'next/link';
import { useState } from 'react';
import { local, pick, type Locale, type LocalText } from '@/lib/i18n';
import { addRequest, demoSlug, publishProfile, useDemoVendor } from '@/lib/demoVendor';
import { textLength, type CAPS, type ProfileContent } from '@/lib/profiles';
import type { Vendor } from '@/lib/catalog';
import { FeaturedEditor } from './FeaturedEditor';
import { CategoryPicker, TagInput, Upload, type CatOption } from './EditKit';

type Caps = typeof CAPS;

/** Featured edits its profile in place (FeaturedEditor); Basic sends a request with one field per piece of profile text. */
export function VendorEditForm({ locale, caps, vendor, content, freeContent, cats }: { locale: Locale; caps: Caps; vendor: Vendor; content: ProfileContent; freeContent: ProfileContent; cats: CatOption[] }) {
  const demo = useDemoVendor();
  // Basic: uploaded images by part (logo, media), as local preview URLs
  const [uploads, setUploads] = useState<Record<string, string[]>>({});
  const startCats = (content.categories ?? []).slice(0, caps.free.categories);
  const [catPick, setCatPick] = useState<string[]>(startCats);
  // typed length of each package-limited field, for its counter
  const [lens, setLens] = useState<Record<string, number>>({});
  const startTeams = (freeContent.audience ?? []).map((a) => local(a, locale));
  const [teams, setTeams] = useState<string[]>(startTeams);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const t = (en: string, th: string) => pick(locale, en, th);

  if (demo === undefined) return <div className="vendor-edit-card" aria-busy="true" />;
  if (!demo.plan) return (
    <div className="vendor-edit-card">
      <h1>{t('Sign in as the vendor', 'เข้าสู่ระบบในฐานะเจ้าของโปรไฟล์')}</h1>
      <p className="route-intro">{t('Only the owner of a listing can edit it or request an edit.', 'เฉพาะเจ้าของโปรไฟล์เท่านั้นที่แก้ไขหรือขอแก้ไขข้อมูลได้')}</p>
      <Link className="button" href={`/${locale}/login/`}>{t('Sign in', 'เข้าสู่ระบบ')}</Link>
    </div>
  );

  const F = demo.plan === 'featured';
  const cap = caps[demo.plan];
  const profile = `/${locale}/providers/${demoSlug(demo.plan)}/`;

  if (sent) return (
    <div className="vendor-edit-card" role="status">
      <span className={`owner-status${F ? ' is-live' : ''}`}>{F ? t('Published', 'เผยแพร่แล้ว') : t('Pending review', 'รอตรวจสอบ')}</span>
      <h1>{F ? t('Your profile is updated', 'อัปเดตโปรไฟล์แล้ว') : t('Request sent', 'ส่งคำขอแก้ไขแล้ว')}</h1>
      <p className="route-intro">{F ? t('Your changes are live on your profile now.', 'การแก้ไขของคุณแสดงบนโปรไฟล์แล้ว')
        : t('Our team reviews every change before it is published. You can follow it on your profile.', 'ทีมงานจะตรวจสอบทุกการแก้ไขก่อนเผยแพร่ ติดตามสถานะได้ที่โปรไฟล์ของคุณ')}</p>
      {!F && <p className="vendor-edit-upsell">{t('Want a full profile? ', 'อยากได้โปรไฟล์เต็มรูปแบบ? ')}<Link href={`/${locale}/for-providers/`}>{t('See the Featured package →', 'ดูแพ็กเกจ Featured →')}</Link></p>}
      <div className="vendor-edit-actions">
        <Link className="button" href={profile}>{t('Back to my profile', 'กลับไปที่โปรไฟล์ของฉัน')}</Link>
        <button type="button" className="button secondary" onClick={() => { setSent(false); setUploads({}); setCatPick(startCats); setLens({}); setTeams(startTeams); }}>{F ? t('Edit something else', 'แก้ไขส่วนอื่น') : t('Send another request', 'ส่งคำขออีกครั้ง')}</button>
      </div>
    </div>
  );

  if (F) return <FeaturedEditor locale={locale} vendor={vendor} initial={demo.live[vendor.slug] ?? content} cap={caps.featured} cats={cats}
    onConfirm={(next) => {
      if (!publishProfile(next)) { alert(t('This browser could not save the changes. Try smaller images.', 'เบราว์เซอร์บันทึกการแก้ไขไม่ได้ ลองใช้รูปภาพขนาดเล็กลง')); return; }
      setSent(true); scrollTo(0, 0);
    }} />;

  // Basic: one field per piece of text the free profile shows, filled with today's text, grouped like the profile
  const L = (v: Parameters<typeof local>[0]) => local(v, locale);
  type Field = { name: string; label: string; value: string; max?: number; rows?: number };
  type List = { name: string; items: { title: LocalText; text?: LocalText }[]; cap: number; title: string; text: string };
  type Group = { part: string; title: string; hint?: string; fields?: Field[]; list?: List; images?: number; picker?: boolean; tags?: boolean };
  const groups: Group[] = [
    { part: 'logo', title: t('Logo', 'โลโก้'), hint: t('1 image', 'ภาพ 1 ภาพ'), images: 1 },
    { part: 'description', title: t('Overview', 'ภาพรวม'), hint: t(`Top of the profile, up to ${cap.overview} characters`, `ส่วนบนของโปรไฟล์ สูงสุด ${cap.overview} ตัวอักษร`), fields: [
      { name: 'summary', label: t('Who you are and your main product, in one paragraph', 'บริษัทของคุณและผลิตภัณฑ์หลัก ในย่อหน้าเดียว'), max: cap.overview, rows: 4,
        value: L(freeContent.summary) || [L(freeContent.company?.overview), freeContent.productName && L(freeContent.tagline) ? `${freeContent.productName}: ${L(freeContent.tagline)}` : ''].filter(Boolean).join(' ') },
    ] },
    { part: 'categories', title: t('Categories', 'หมวดหมู่'), hint: t(`Up to ${cap.categories}`, `สูงสุด ${cap.categories} หมวดหมู่`), picker: true },
    { part: 'description', title: t('Product description', 'รายละเอียดผลิตภัณฑ์'), hint: t(`Up to ${cap.description} characters on Basic`, `สูงสุด ${cap.description} ตัวอักษรตามแพ็กเกจ Basic`), fields: [
      // one box for the whole section; a blank line separates the paragraphs the profile shows
      { name: 'productDescription', label: t('Description (a blank line starts a new paragraph)', 'คำอธิบาย (เว้นบรรทัดเพื่อขึ้นย่อหน้าใหม่)'),
        value: [L(freeContent.description), L(freeContent.overview?.text)].filter(Boolean).join('\n\n'), max: cap.description, rows: 6 },
    ] },
    { part: 'product', title: t('Highlights', 'จุดเด่น'), hint: t(`Up to ${cap.benefits}`, `สูงสุด ${cap.benefits} รายการ`),
      list: { name: 'benefits', items: freeContent.benefits ?? [], cap: cap.benefits, title: t('Highlight', 'จุดเด่น'), text: t('Details', 'รายละเอียด') } },
    { part: 'product', title: t('Key features', 'ฟีเจอร์สำคัญ'), hint: t(`Up to ${cap.features}`, `สูงสุด ${cap.features} รายการ`),
      list: { name: 'features', items: freeContent.features ?? [], cap: cap.features, title: t('Feature', 'ฟีเจอร์'), text: t('Details', 'รายละเอียด') } },
    { part: 'product', title: t('Who uses it', 'ใครใช้งาน'), hint: t(`Up to ${cap.useCases} use cases`, `กรณีใช้งานสูงสุด ${cap.useCases} รายการ`), tags: true,
      fields: [{ name: 'audienceText', label: t('Who it is for', 'เหมาะกับใคร'), value: L(freeContent.audienceText), rows: 2 }],
      list: { name: 'useCases', items: freeContent.useCases ?? [], cap: cap.useCases, title: t('Use case', 'กรณีใช้งาน'), text: t('Details', 'รายละเอียด') } },
    { part: 'contact', title: t('Website', 'เว็บไซต์'), fields: [{ name: 'website', label: t('Website address', 'ที่อยู่เว็บไซต์'), value: freeContent.website ?? '', rows: 1 }] },
    { part: 'pricing', title: t('Pricing', 'ราคา'), fields: [{ name: 'pricing', label: t('Pricing model or starting price', 'รูปแบบราคาหรือราคาเริ่มต้น'), value: L(freeContent.pricing?.summary), rows: 1 }] },
    { part: 'media', title: t('Showcase image', 'ภาพตัวอย่าง'), hint: t(`${cap.screenshots} image no video`, `ภาพ ${cap.screenshots} ภาพ ไม่รวมวิดีโอ`), images: cap.screenshots },
    { part: 'other', title: t('Anything else', 'อื่น ๆ'), fields: [{ name: 'other', label: t('Other changes', 'สิ่งที่ต้องการแก้ไขเพิ่มเติม'), value: '', rows: 3 }] },
  ];
  // every field's starting value by name, so the request lists only what changed
  const initial: Record<string, string> = {};
  for (let i = 0; i < cap.categories; i++) initial[`categories.${i}`] = startCats[i] ?? '';
  initial.audience = startTeams.join('|');
  for (const g of groups) {
    for (const f of g.fields ?? []) initial[f.name] = f.value;
    if (g.list) for (let i = 0; i < g.list.cap; i++) {
      initial[`${g.list.name}.${i}.title`] = L(g.list.items[i]?.title);
      initial[`${g.list.name}.${i}.text`] = L(g.list.items[i]?.text);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const edits = Object.keys(initial).filter((k) => String(fd.get(k) ?? '').trim() !== initial[k]);
    const parts = [...new Set(groups.filter((g) => (uploads[g.part]?.length || edits.some((k) => belongs(g, k)))).map((g) => g.part))];
    if (!parts.length) { setError(t('Change at least one field.', 'แก้ไขอย่างน้อย 1 ช่อง')); return; }
    const over = groups.flatMap((g) => g.fields ?? []).find((f) => f.max && textLength(String(fd.get(f.name) ?? '')) > f.max);
    if (over) { setError(t(`${over.label}: shorten it to ${over.max} characters.`, `${over.label}: ย่อให้ไม่เกิน ${over.max} ตัวอักษร`)); return; }
    const note = [...edits.map((k) => `${k}: ${String(fd.get(k) ?? '').trim()}`), ...Object.entries(uploads).filter(([, v]) => v.length).map(([k, v]) => `${k}: +${v.length} image`)].join('\n').slice(0, 2000);
    addRequest({ parts, note, link: '' });
    setSent(true);
    scrollTo(0, 0);
  }
  const belongs = (g: Group, k: string) => (g.fields ?? []).some((f) => f.name === k) || (!!g.list && k.startsWith(`${g.list.name}.`)) || (!!g.picker && k.startsWith('categories.')) || (!!g.tags && k === 'audience');

  const catLabels = { main: t('Main category', 'หมวดหมู่หลัก'), more: t('Category', 'หมวดหมู่เพิ่มเติม'), pick: t('Choose a category', 'เลือกหมวดหมู่'), add: t('Add a category', 'เพิ่มหมวดหมู่'), del: t('Remove', 'ลบ') };
  const add = (k: string, url: string, max: number) => { setError(''); setUploads((u) => ({ ...u, [k]: [...(u[k] ?? []), url].slice(-max) })); };
  const remove = (k: string, i: number) => setUploads((u) => ({ ...u, [k]: (u[k] ?? []).filter((_, j) => j !== i) }));
  // max is a package limit (shown as a counter); fields without one still stop at 1000 characters
  const input = (name: string, label: string, value: string, rows = 1, max?: number) => {
    const len = lens[name] ?? textLength(value);
    const props = { name, defaultValue: value, maxLength: max ? undefined : 1000, placeholder: t('Type the new text', 'พิมพ์ข้อความใหม่'),
      onInput: max ? (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => { const v = textLength(e.currentTarget.value); setLens((l) => ({ ...l, [name]: v })); } : undefined };
    return (
      <label className="vendor-input" key={name}><span>{label}</span>
        {rows > 1 ? <textarea rows={rows} {...props} /> : <input {...props} />}
        {max && <small className={`ek-count${len > max ? ' is-over' : ''}`}>{len}/{max}{len > max && t(' over the package limit', ' เกินขีดจำกัดของแพ็กเกจ')}</small>}
      </label>
    );
  };
  return (
    <form className="vendor-edit-card" onSubmit={onSubmit}>
      <h1>{t('Request an edit', 'ขอแก้ไขข้อมูล')} <span className="owner-plan">Basic</span></h1>
      <p className="route-intro">{t('Each field matches a piece of text on your profile. Change what you need and send; our team reviews every request before publishing.', 'แต่ละช่องตรงกับข้อความบนโปรไฟล์ของคุณ แก้ไขเฉพาะส่วนที่ต้องการแล้วส่งคำขอ ทีมงานจะตรวจสอบก่อนเผยแพร่')}</p>

      <div className="vendor-sections">
        {groups.map((g, gi) => {
          const imgs = uploads[g.part] ?? [];
          return (
            <fieldset key={gi} className="vendor-section">
              <legend className="vendor-section-head"><b>{g.title}</b>{g.hint && <small>{g.hint}</small>}</legend>
              {g.fields?.map((f) => input(f.name, f.label, f.value, f.rows, f.max))}
              {g.picker && <CategoryPicker name="categories" options={cats} value={catPick} max={cap.categories} onChange={(v) => { setError(''); setCatPick(v); }} labels={catLabels} />}
              {g.tags && <TagInput name="audience" label={t('Best for teams', 'เหมาะสำหรับทีม')} placeholder={t('Add a team', 'เพิ่มทีม')} addLabel={t('Add', 'เพิ่ม')} removeLabel={t('Remove', 'ลบ')} max={5} tags={teams} onChange={(v) => { setError(''); setTeams(v); }} />}
              {g.list && Array.from({ length: g.list.cap }, (_, i) => (
                <div className="vendor-pair" key={i}>
                  {input(`${g.list!.name}.${i}.title`, `${g.list!.title} ${i + 1}`, L(g.list!.items[i]?.title))}
                  {input(`${g.list!.name}.${i}.text`, g.list!.text, L(g.list!.items[i]?.text))}
                </div>
              ))}
              {g.images && (
                <div className="vendor-uploads">
                  {g.part === 'logo' && !imgs.length && freeContent.logo && <figure><img src={freeContent.logo} alt="" /><small>{t('Current logo', 'โลโก้ปัจจุบัน')}</small></figure>}
                  {imgs.map((src, i) => (
                    <figure key={i}><img src={src} alt="" /><button type="button" className="ek-upload" onClick={() => remove(g.part, i)}>{t('Remove', 'ลบ')}</button></figure>
                  ))}
                  {imgs.length < g.images && <Upload label={g.part === 'logo' ? t('Upload a new logo', 'อัปโหลดโลโก้ใหม่') : t(`Upload image (${imgs.length}/${g.images})`, `อัปโหลดภาพ (${imgs.length}/${g.images})`)} accept="image/*" onFile={(u) => add(g.part, u, g.images!)} />}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>
      <p className="auth-error" role="alert">{error}</p>
      <div className="vendor-edit-actions">
        <button className="button" type="submit">{t('Send request', 'ส่งคำขอแก้ไข')}</button>
        <Link className="button secondary" href={profile}>{t('Cancel', 'ยกเลิก')}</Link>
      </div>
    </form>
  );
}
