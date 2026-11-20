'use client';

// Small editing pieces for the Featured profile editor: click-to-edit text, an upload button and an add/delete card list.
import { useEffect, useRef, useState } from 'react';
import { textLength } from '@/lib/profiles';
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Plus, Trash2, X } from 'lucide-react';

/** Shows the text; a click turns it into an input (or textarea). Enter or leaving the field keeps the change, Escape cancels. */
export function Txt({ value, onChange, multiline = false, placeholder, max, label, className = '', caption = true }: {
  value: string; onChange: (v: string) => void; multiline?: boolean; placeholder: string; max?: number; label: string; className?: string; caption?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const open = () => { setDraft(value); setEditing(true); };
  const done = (keep: boolean) => { setEditing(false); if (keep && draft !== value) onChange(draft.trim()); };
  const cap = caption && <span className="ek-cap" aria-hidden="true">{label}</span>;
  if (!editing) return (
    <span className="ek-field">{cap}<span role="button" tabIndex={0} aria-label={`${label}: ${value || placeholder}`} className={`ek-text ${value ? '' : 'is-empty'} ${className}`}
      onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}>
      {value || placeholder}
    </span>{max && <small className={`ek-count${textLength(value) > max ? ' is-over' : ''}`}>{textLength(value)}/{max}</small>}</span>
  );
  const props = {
    ref, value: draft, 'aria-label': label, className: `ek-input ${className}`,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: () => done(true),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Escape') done(false); if (e.key === 'Enter' && !multiline) { e.preventDefault(); done(true); } },
  };
  return <span className="ek-field">{cap}<span className="ek-edit">{multiline ? <textarea rows={4} {...props} /> : <input {...props} />}{max && <small className={`ek-count${textLength(draft) > max ? ' is-over' : ''}`}>{textLength(draft)}/{max}</small>}</span></span>;
}

/** A button that opens the file picker and hands back a local preview URL. */
export function Upload({ label, accept, onFile, className = '' }: { label: string; accept: string; onFile: (url: string) => void; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={`ek-upload ${className}`} onClick={() => ref.current?.click()}><ImagePlus size={16} strokeWidth={1.75} aria-hidden="true" />{label}</button>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => {
        const f = e.target.files?.[0];
        // shortcut: images are kept inline (data URL) and videos as a page-only object URL; Phase 2 uploads files to storage
        if (f && f.type.startsWith('image/') && f.size <= 1_500_000) {
          const r = new FileReader();
          r.onload = () => onFile(String(r.result));
          r.readAsDataURL(f);
        } else if (f && f.type.startsWith('image/')) {
          // too big to keep inline as is: scale to at most 2880 px wide and re-encode as JPEG
          const img = new Image();
          const src = URL.createObjectURL(f);
          img.onload = () => {
            const w = Math.min(img.naturalWidth, 2880), h = Math.round(img.naturalHeight * (w / img.naturalWidth));
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            c.getContext('2d')!.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(src);
            onFile(c.toDataURL('image/jpeg', 0.85));
          };
          img.src = src;
        } else if (f) onFile(URL.createObjectURL(f));
        e.target.value = '';
      }} />
    </>
  );
}

export type ToolLabels = { del: string; prev: string; next: string; drag: string };
export const move = <T,>(items: T[], from: number, to: number) => {
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

/** Drag to reorder (mouse), arrow buttons (keyboard and touch) and a labelled delete button, shared by cards and images. */
export function ItemTools({ i, count, onMove, onDelete, labels }: { i: number; count: number; onMove: (to: number) => void; onDelete: () => void; labels: ToolLabels }) {
  return (
    <div className="ek-tools">
      {/* only the handle starts a drag: pressing it makes its card draggable until the drag or click ends */}
      <span className="ek-grip" title={labels.drag} aria-hidden="true" onPointerDown={(e) => {
        const item = e.currentTarget.closest('[data-ek-item]');
        if (!item) return;
        item.setAttribute('draggable', 'true');
        document.addEventListener('pointerup', () => item.removeAttribute('draggable'), { once: true });
      }}><GripVertical size={16} strokeWidth={1.75} /></span>
      <button type="button" className="ek-icon" aria-label={`${labels.prev} (${i + 1})`} disabled={i === 0} onClick={() => onMove(i - 1)}><ChevronLeft size={16} strokeWidth={1.75} /></button>
      <span className="ek-pos">{i + 1}/{count}</span>
      <button type="button" className="ek-icon" aria-label={`${labels.next} (${i + 1})`} disabled={i === count - 1} onClick={() => onMove(i + 1)}><ChevronRight size={16} strokeWidth={1.75} /></button>
      <button type="button" className="ek-del" onClick={onDelete}><Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />{labels.del}</button>
    </div>
  );
}

/** Drag-and-drop props for item i of a reorderable list (dragging starts from ItemTools' handle); the dragged index rides in dataTransfer. */
export const dragProps = (i: number, onDrop: (from: number, to: number) => void) => ({
  'data-ek-item': '',
  onDragEnd: (e: React.DragEvent) => e.currentTarget.removeAttribute('draggable'),
  onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData('text/x-ek-index', String(i)); e.dataTransfer.effectAllowed = 'move'; },
  onDragOver: (e: React.DragEvent) => { if (e.dataTransfer.types.includes('text/x-ek-index')) { e.preventDefault(); e.currentTarget.classList.add('is-over'); } },
  onDragLeave: (e: React.DragEvent) => e.currentTarget.classList.remove('is-over'),
  onDrop: (e: React.DragEvent) => {
    e.currentTarget.classList.remove('is-over');
    const from = Number(e.dataTransfer.getData('text/x-ek-index'));
    if (!Number.isNaN(from) && from !== i) { e.preventDefault(); onDrop(from, i); }
  },
});

/** Cards that can be reordered and deleted, and an "add" card until the package limit is reached. */
export function CardList<T>({ items, max, onChange, make, render, addLabel, tools, className = 'pf-cards' }: {
  items: T[]; max: number; onChange: (items: T[]) => void; make: () => T;
  render: (item: T, set: (next: T) => void, i: number) => React.ReactNode; addLabel: string; tools: ToolLabels; className?: string;
}) {
  return (
    <div className={`${className} ek-cards`}>
      {items.map((item, i) => (
        <article className="pf-card ek-card" key={i} {...dragProps(i, (from, to) => onChange(move(items, from, to)))}>
          <ItemTools i={i} count={items.length} labels={tools} onMove={(to) => onChange(move(items, i, to))} onDelete={() => onChange(items.filter((_, j) => j !== i))} />
          {render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))), i)}
        </article>
      ))}
      {items.length < max && (
        <button type="button" className="pf-card ek-add" onClick={() => onChange([...items, make()])}>
          <Plus size={18} strokeWidth={1.75} aria-hidden="true" /><span>{addLabel}</span><small>{items.length}/{max}</small>
        </button>
      )}
    </div>
  );
}

export type CatOption = { slug: string; name: string };
export type CatLabels = { main: string; more: string; pick: string; add: string; del: string };

/** Category dropdowns from the 18 directory categories: the main one first, then more up to the package limit. */
export function CategoryPicker({ options, value, max, onChange, labels, name }: {
  options: CatOption[]; value: string[]; max: number; onChange: (v: string[]) => void; labels: CatLabels; name?: string;
}) {
  const rows = value.length ? value : [''];
  const set = (i: number, slug: string) => onChange(rows.map((x, j) => (j === i ? slug : x)).filter((x, j) => x || j === 0));
  return (
    <div className="ek-cats">
      {rows.map((slug, i) => (
        <div className="ek-cat-row" key={i}>
          <label className="vendor-input"><span>{i === 0 ? labels.main : `${labels.more} ${i}`}</span>
            <select name={name ? `${name}.${i}` : undefined} value={slug} onChange={(e) => set(i, e.target.value)}>
              <option value="">{labels.pick}</option>
              {options.map((o) => <option key={o.slug} value={o.slug} disabled={o.slug !== slug && rows.includes(o.slug)}>{o.name}</option>)}
            </select>
          </label>
          {i > 0 && <button type="button" className="ek-del" onClick={() => onChange(rows.filter((_, j) => j !== i))}><Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />{labels.del}</button>}
        </div>
      ))}
      {rows.length < max && rows.every(Boolean) && (
        <button type="button" className="ek-upload" onClick={() => onChange([...rows, ''])}><Plus size={16} strokeWidth={1.75} aria-hidden="true" />{labels.add} ({rows.length}/{max})</button>
      )}
    </div>
  );
}

/** Tags as removable chips; type a new one and press Enter (or the add button) to add it. A hidden field carries them in a form. */
export function TagInput({ tags, onChange, label, placeholder, addLabel, removeLabel, max = 10, name }: {
  tags: string[]; onChange: (t: string[]) => void; label: string; placeholder: string; addLabel: string; removeLabel: string; max?: number; name?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v && !tags.includes(v) && tags.length < max) onChange([...tags, v]); setDraft(''); };
  return (
    <div className="ek-tags vendor-input">
      <span>{label} <small>{tags.length}/{max}</small></span>
      <div className="ek-tag-list">
        {tags.map((tag, i) => (
          <span className="ek-tag" key={tag}>{tag}<button type="button" aria-label={`${removeLabel} ${tag}`} onClick={() => onChange(tags.filter((_, j) => j !== i))}><X size={13} strokeWidth={2} /></button></span>
        ))}
        {tags.length < max && <span className="ek-tag-new">
          <input value={draft} placeholder={placeholder} aria-label={label} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <button type="button" className="ek-upload" onClick={add} disabled={!draft.trim()}><Plus size={14} strokeWidth={1.75} aria-hidden="true" />{addLabel}</button>
        </span>}
      </div>
      {name && <input type="hidden" name={name} value={tags.join('|')} />}
    </div>
  );
}
