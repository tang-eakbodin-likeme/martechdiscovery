// Profile parts a vendor can change, and which package allows each one (limits come from CAPS in profiles.ts).
export type Part = { key: string; en: string; th: string; featuredOnly?: boolean };

export const PARTS: Part[] = [
  { key: 'logo', en: 'Logo', th: 'โลโก้' },
  { key: 'description', en: 'Company description', th: 'คำอธิบายบริษัท' },
  { key: 'product', en: 'Product and features', th: 'ผลิตภัณฑ์และฟีเจอร์' },
  { key: 'categories', en: 'Categories', th: 'หมวดหมู่' },
  { key: 'contact', en: 'Website and contact', th: 'เว็บไซต์และการติดต่อ' },
  { key: 'pricing', en: 'Pricing', th: 'ราคา' },
  { key: 'media', en: 'Images and video', th: 'ภาพและวิดีโอ' },
  { key: 'proof', en: 'Case studies, customer logos and testimonials', th: 'กรณีศึกษา โลโก้ลูกค้า และคำรับรอง', featuredOnly: true },
  { key: 'promo', en: 'Promotion banner and action buttons', th: 'แบนเนอร์โปรโมชันและปุ่มดำเนินการ', featuredOnly: true },
  { key: 'other', en: 'Other', th: 'อื่น ๆ' },
];
