'use client';

// Prototype vendor sign-in: which sample profile the visitor "owns", the Basic edit requests they sent
// and the Featured edits they published (which go live straight away).
// shortcut: kept in this browser only, no server or review queue; Phase 2 moves both to real vendor accounts in D1.
import { useSyncExternalStore } from 'react';
import type { ProfileContent } from './profiles';

export type DemoPlan = 'free' | 'featured';
export type EditRequest = { id: string; slug: string; parts: string[]; note: string; link: string; at: string };

const KEY = 'mdp-demo-vendor-v1';
const EVENT = 'mdp-demo-vendor';
type State = { plan: DemoPlan | null; requests: EditRequest[]; live: Record<string, ProfileContent> };
const EMPTY: State = { plan: null, requests: [], live: {} };

let cache: { raw: string | null; state: State } = { raw: null, state: EMPTY };
function read(): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { /* storage blocked: behave as signed out */ }
  if (raw !== cache.raw) {
    let state = EMPTY;
    try { const p = JSON.parse(raw || 'null'); if (p) state = { plan: p.plan === 'free' || p.plan === 'featured' ? p.plan : null, requests: Array.isArray(p.requests) ? p.requests : [], live: p.live && typeof p.live === 'object' ? p.live : {} }; } catch { /* bad JSON: signed out */ }
    cache = { raw, state };
  }
  return cache.state;
}
function write(state: State): boolean {
  let ok = true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { ok = false; /* storage blocked or full */ }
  window.dispatchEvent(new Event(EVENT));
  return ok;
}
function subscribe(fn: () => void) {
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', fn);
  return () => { window.removeEventListener(EVENT, fn); window.removeEventListener('storage', fn); };
}

/** undefined while rendering on the server, then the stored state. */
export function useDemoVendor(): State | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

// same slugs as SAMPLE_SLUGS in profiles.ts, repeated so the vendor JSON stays out of the client bundle
export const demoSlug = (plan: DemoPlan) => (plan === 'featured' ? 'sample-featured' : 'sample-free');
// requests stay across sign-in and sign-out; each one carries its profile's slug
// the sample profiles' logo, used as the demo vendor's account picture
export const DEMO_LOGO = '/assets/sample/sample-crm-logo.svg';

export const demoSignIn = (plan: DemoPlan) => write({ ...read(), plan });
export const demoSignOut = () => write({ ...read(), plan: null });
/** Publishes a Featured vendor's edited profile; false when the browser could not store it (for example, images too large). */
export function publishProfile(content: ProfileContent): boolean {
  const s = read();
  if (s.plan !== 'featured') return false;
  return write({ ...s, live: { ...s.live, [demoSlug(s.plan)]: content } });
}
/** Drops the published edits so the sample profile shows its original content again. */
export function resetProfile(slug: string) {
  const s = read();
  const live = { ...s.live };
  delete live[slug];
  write({ ...s, live });
}
export function addRequest(r: Omit<EditRequest, 'id' | 'at' | 'slug'>) {
  const s = read();
  if (!s.plan) return;
  write({ ...s, requests: [{ ...r, slug: demoSlug(s.plan), id: Math.random().toString(36).slice(2, 10), at: new Date().toISOString() }, ...s.requests] });
}
