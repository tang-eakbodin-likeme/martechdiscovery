'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { pick, type Locale } from '@/lib/i18n';
import { categories, categoryName } from '@/lib/catalog';

const POLICY_VERSION = '2026-11-08';
const LEAD_KEY = 'mdp-buyer-leads-v1';
const PARTNERS = ['Buzzebees', 'BytePlus', 'Clicknext', 'Funcrowd', 'PIXELS', 'Readyplanet', 'Yell Bangkok', 'Com7 Business', 'LINE Business', 'Mudjai CRM'];

type Step = 1 | 2 | 'success';

/** Buyer Guide lead form: required step 1, optional step 2, then POST /api/leads (falls back to localStorage when the API is absent). */
export default function LeadForm({ locale }: { locale: Locale }) {
  const t = (en: string, th: string) => pick(locale, en, th);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [successText, setSuccessText] = useState(t('Demo form only: no data was transmitted or stored. Read the free HTML preview here.', 'นี่เป็นแบบสาธิต ยังไม่มีการส่งหรือจัดเก็บข้อมูล คุณอ่าน Preview ฟรีได้ที่นี่'));

  async function saveLead(form: HTMLFormElement) {
    const data = new FormData(form);
    const str = (name: string) => String(data.get(name) || '');
    const lead = {
      id: crypto.randomUUID?.() || `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'buyer-guide',
      name: str('name').trim(), email: str('email').trim(), company: str('company').trim(),
      jobLevel: str('jobLevel'), industry: str('industry'), companySize: str('companySize'), budget: str('budget'), timeline: str('timeline'),
      website: str('website'),
      interestAreas: data.getAll('interestAreas'),
      consent: {
        processing: data.get('processingConsent') === 'on',
        policyVersion: POLICY_VERSION,
        newsletter: data.get('newsletter') === 'on',
        namedProviders: data.getAll('partnerConsent'),
        demoContact: data.get('demoConsent') === 'on',
      },
      deliveryStatus: 'Local demo only',
    };
    let storedOnServer = false;
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      if (response.ok) { storedOnServer = true; lead.deliveryStatus = 'Stored securely'; }
      else if (![404, 503].includes(response.status)) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(result.error || 'Could not submit your request.');
      }
    } catch (error) {
      if (!(error instanceof TypeError)) throw error; // network failure: keep the local demo copy
    }
    if (!storedOnServer) {
      let leads: unknown[] = [];
      try { leads = JSON.parse(localStorage.getItem(LEAD_KEY) || '[]'); } catch {}
      leads.unshift(lead);
      localStorage.setItem(LEAD_KEY, JSON.stringify(leads));
    }
    setSuccessText(storedOnServer
      ? t('Your request has been submitted and stored according to the consent you selected.', 'ส่งคำขอเรียบร้อยแล้ว ระบบบันทึกข้อมูลตามความยินยอมที่คุณเลือก')
      : t('Your request is saved in this browser demo. It has not been sent to a server or any provider.', 'บันทึกคำขอไว้ในเครื่องนี้แล้ว ข้อมูลยังไม่ถูกส่งไปยังเซิร์ฟเวอร์หรือผู้ให้บริการ'));
    setStep('success');
  }

  async function submit() {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    try { await saveLead(form); } catch (error) {
      alert(t('Submission failed: ', 'ส่งคำขอไม่สำเร็จ: ') + (error as Error).message);
    }
  }

  function next() {
    if (!formRef.current?.reportValidity()) return;
    setStep(2);
    requestAnimationFrame(() => (formRef.current?.querySelector('[data-step="2"] select') as HTMLElement | null)?.focus());
  }

  return (
    <div className="leadgen-card">
      <div className="form-progress">
        <span className={`step-dot${step === 1 ? ' active' : ''}`}>1</span><i></i><span className={`step-dot${step !== 1 ? ' active' : ''}`}>2</span>
        <span className="progress-label">{step === 1 ? t('Basic details', 'ข้อมูลพื้นฐาน') : t('Optional details', 'ข้อมูลเสริม (ไม่บังคับ)')}</span>
      </div>
      <form id="buyer-lead-form" ref={formRef} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label className="lead-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <section className="lead-step active" data-step="1" hidden={step !== 1}>
          <h3>{t('Get the Buyer Guide', 'เริ่มรับ Buyer Guide')}</h3>
          <p>{t('Complete the required fields and review the privacy notice to continue.', 'กรอกข้อมูลที่จำเป็นและอ่านการใช้ข้อมูลก่อนดำเนินการต่อ')}</p>
          <label>{t('Full name', 'ชื่อ-นามสกุล')}<input name="name" required autoComplete="name" placeholder={t('Your name', 'ชื่อของคุณ')} /></label>
          <label>{t('Work email', 'อีเมลที่ทำงาน')}<input name="email" required type="email" autoComplete="email" placeholder="name@company.com" /></label>
          <label>{t('Company', 'บริษัท')}<input name="company" required autoComplete="organization" placeholder={t('Company name', 'ชื่อบริษัท')} /></label>
          <label>{t('Job level', 'ตำแหน่ง / ระดับงาน')}<select name="jobLevel" required defaultValue="">
            <option value="">{t('Select job level', 'เลือกตำแหน่ง')}</option>
            <option>Executive / C-level</option><option>Director / VP</option><option>Manager</option>
            <option>Specialist / Individual contributor</option><option>Consultant / Agency</option><option>{t('Other', 'อื่น ๆ')}</option>
          </select></label>
          <label className="consent-choice processing-consent"><input type="checkbox" name="processingConsent" required />
            {locale === 'th'
              ? <span>ยินยอมให้ MarTech Discovery ใช้ข้อมูลเพื่อจัดส่ง Buyer Guide และจัดการคำขอนี้ ดูรายละเอียดใน <Link href="/th/editorial-policy/">นโยบายความเป็นส่วนตัว</Link>.</span>
              : <span>I agree that MarTech Discovery may use my details to provide the Buyer Guide and manage this request. See the <Link href="/en/editorial-policy/">privacy notice</Link>.</span>}
          </label>
          <button className="button full-width" type="button" id="lead-next" onClick={next}>{t('Continue', 'ต่อไป')} <b>→</b></button>
          <small>{t('Step 2 is optional and can be skipped.', 'ขั้นถัดไปเป็นข้อมูลเสริมและข้ามได้')}</small>
        </section>
        <section className="lead-step" data-step="2" hidden={step !== 2}>
          <h3>{t('Tailor your recommendations', 'ข้อมูลเสริมสำหรับแนะนำคู่มือ')}</h3>
          <p>{t('Optional details help tailor category recommendations and evaluation guidance.', 'ข้อมูลทั้งหมดเป็นตัวเลือก ช่วยแนะนำหมวดและกรอบประเมินที่เกี่ยวข้อง')}</p>
          <div className="optional-grid">
            <label>{t('Industry', 'อุตสาหกรรม')}<select name="industry" defaultValue="">
              <option value="">{t('Select industry', 'เลือกอุตสาหกรรม')}</option>
              <option>{t('Financial services', 'บริการทางการเงิน')}</option><option>Retail &amp; commerce</option><option>{t('Technology', 'เทคโนโลยี')}</option>
              <option>{t('Healthcare', 'สาธารณสุข')}</option><option>{t('Manufacturing', 'การผลิต')}</option><option>{t('Agency / consultancy', 'เอเจนซี / ที่ปรึกษา')}</option><option>{t('Other', 'อื่น ๆ')}</option>
            </select></label>
            <label>{t('Company size', 'ขนาดองค์กร')}<select name="companySize" defaultValue="">
              <option value="">{t('Select size', 'เลือกขนาด')}</option>
              <option>1–50</option><option>51–200</option><option>201–1,000</option><option>1,001+</option>
            </select></label>
            <label>{t('Estimated budget', 'งบประมาณโดยประมาณ')}<select name="budget" defaultValue="">
              <option value="">{t('Prefer not to say', 'ไม่ระบุ')}</option>
              <option>{t('Under THB 100,000', 'ต่ำกว่า 100,000 บาท')}</option><option>{t('THB 100,000–500,000', '100,000–500,000 บาท')}</option>
              <option>{t('THB 500,000–2,000,000', '500,000–2,000,000 บาท')}</option><option>{t('Over THB 2,000,000', 'มากกว่า 2,000,000 บาท')}</option>
            </select></label>
            <label>{t('Purchase timeline', 'ช่วงเวลาที่วางแผนซื้อ')}<select name="timeline" defaultValue="">
              <option value="">{t('Not sure yet', 'ยังไม่แน่ใจ')}</option>
              <option>{t('0–3 months', '0–3 เดือน')}</option><option>{t('3–6 months', '3–6 เดือน')}</option>
              <option>{t('6–12 months', '6–12 เดือน')}</option><option>{t('12+ months', 'มากกว่า 12 เดือน')}</option>
            </select></label>
          </div>
          <fieldset className="interest-picks">
            <legend>{t('Categories of interest (select all that apply)', 'หมวดหมู่ที่สนใจ (เลือกได้หลายข้อ)')}</legend>
            <div className="interest-grid">
              {categories.map((c) => (
                <label key={c.slug}><input type="checkbox" name="interestAreas" value={c.slug} /><span>{categoryName(c, locale)}</span></label>
              ))}
            </div>
          </fieldset>
          <fieldset className="consent-block">
            <legend>{t('Optional consent', 'ความยินยอม (ไม่บังคับ)')}</legend>
            <label className="consent-choice"><input type="checkbox" name="newsletter" /><span>{t('I agree to receive MarTech Buyer Guide updates.', 'ยินยอมรับข่าวสารจาก คู่มือเลือกซื้อ MarTech')}</span></label>
            <details className="partner-consent">
              <summary>{t('Choose named providers for data sharing', 'เลือกผู้ให้บริการที่ยินยอมแชร์ข้อมูลด้วย')}</summary>
              <p>{t('Consent is separate for each named provider. Leave all unchecked to continue.', 'ติ๊กแยกตามรายชื่อ ไม่เลือกก็รับคู่มือได้')}</p>
              {PARTNERS.map((p) => (
                <label className="consent-choice" key={p}><input type="checkbox" name="partnerConsent" value={p} />
                  {locale === 'th'
                    ? <span>ฉันยินยอมแชร์ข้อมูลติดต่อให้กับ <b>{p}</b> เพื่อรับข้อมูลผลิตภัณฑ์ที่เกี่ยวข้อง</span>
                    : <span>I consent to share my details with <b>{p}</b> for relevant product information.</span>}
                </label>
              ))}
            </details>
            <label className="consent-choice"><input type="checkbox" name="demoConsent" /><span>{t('I agree to be contacted by the providers I selected above to arrange a demo.', 'ยินยอมให้ผู้ให้บริการที่เลือกไว้ติดต่อเพื่อนัด Demo')}</span></label>
          </fieldset>
          <div className="form-actions">
            <button className="text-cta" type="button" id="lead-back" onClick={() => setStep(1)}>{t('← Back', '← ย้อนกลับ')}</button>
            <button className="button" type="submit">{t('Get the Buyer Guide', 'รับ Buyer Guide')} <b>→</b></button>
          </div>
          <button className="skip-step" type="button" id="lead-skip" onClick={submit}>{t('Skip optional details and submit', 'ข้ามข้อมูลเสริมและส่งคำขอ')}</button>
        </section>
        <section className="lead-step lead-success" data-step="success" hidden={step !== 'success'}>
          <span className="success-mark"><Check strokeWidth={1.75} /></span>
          <h3>{t('You’re all set', 'พร้อมแล้ว')}</h3>
          <p>{successText}</p>
          <Link className="button" href={`/${locale}/buyer-guide/preview/`}>{t('Read the free preview', 'อ่าน Preview ฟรี')} <b>→</b></Link>
        </section>
      </form>
    </div>
  );
}
