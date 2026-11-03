/**
 * Named drafts: more than one draft of each template, for example one offer
 * letter per candidate. The active draft saves itself as the reader types, as
 * the single draft always did.
 *
 * Storage: "pc-drafts-<template id>" holds every draft of a template. A draft
 * saved by the earlier single-draft version ("pc_tpl_<template id>") becomes
 * draft 1 the first time the page opens.
 *
 * Each tab writes only its own draft's values, re-reading the store first, so
 * two open tabs never overwrite each other's drafts.
 */
import { readJson, removeKey, shortId, writeJson } from "./store.ts";

export type Draft = {
  id: string;
  /** Draft 1, Draft 2… for drafts the reader hasn't named and that have no person in them. */
  n: number;
  /** Set when the reader names the draft; otherwise it is called after the person in it. */
  name?: string;
  /** The recent person this draft is about, so changes here update them. */
  personId?: string;
  updated: number;
  values: Record<string, string>;
};
export type DraftStore = { v: 1; active: string; drafts: Draft[] };

export const MAX_DRAFTS = 20;
export const draftsKey = (tpl: string) => `pc-drafts-${tpl}`;
export const legacyKey = (tpl: string) => `pc_tpl_${tpl}`;

function cleanValues(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) if (typeof v === "string") out[k] = v;
  return out;
}

export function makeDraft(store: DraftStore | null, values: Record<string, string> = {}, name?: string): Draft {
  const n = Math.max(0, ...(store?.drafts ?? []).map((d) => d.n)) + 1;
  return { id: shortId(), n, name: name?.trim() || undefined, updated: Date.now(), values: { ...values } };
}

/** A valid store from whatever is saved, or null when nothing is. */
export function parseStore(raw: unknown): DraftStore | null {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as DraftStore).drafts)) return null;
  const drafts: Draft[] = [];
  for (const d of (raw as DraftStore).drafts) {
    if (!d || typeof d !== "object" || typeof d.id !== "string") continue;
    drafts.push({
      id: d.id,
      n: Number(d.n) || drafts.length + 1,
      name: typeof d.name === "string" && d.name.trim() ? d.name.trim().slice(0, 80) : undefined,
      personId: typeof d.personId === "string" ? d.personId : undefined,
      updated: Number(d.updated) || 0,
      values: cleanValues(d.values)
    });
  }
  if (!drafts.length) return null;
  const active = drafts.some((d) => d.id === (raw as DraftStore).active) ? (raw as DraftStore).active : drafts[0].id;
  return { v: 1, active, drafts };
}

/** The saved drafts of a template. Nothing is written until the reader changes something. */
export function readDrafts(tpl: string): DraftStore {
  const store = parseStore(readJson(draftsKey(tpl)));
  if (store) return store;
  const legacy = cleanValues(readJson(legacyKey(tpl)));
  const first = makeDraft(null, legacy);
  return { v: 1, active: first.id, drafts: [first] };
}

export function writeDrafts(tpl: string, store: DraftStore): boolean {
  const ok = writeJson(draftsKey(tpl), store);
  // The single-draft key has been carried into the store; remove it so it can't come back.
  if (ok) removeKey(legacyKey(tpl));
  return ok;
}

/**
 * Change the stored drafts safely: re-read what is saved (another tab may have
 * added or deleted a draft), apply the change, write it back. `current` is the
 * page's own copy, used when nothing has been saved yet.
 */
export function updateDrafts(tpl: string, current: DraftStore, change: (store: DraftStore) => void): { store: DraftStore; ok: boolean } {
  const store = parseStore(readJson(draftsKey(tpl))) ?? structuredClone(current);
  change(store);
  return { store, ok: writeDrafts(tpl, store) };
}

/** The draft with this id, put back from the page's copy if another tab deleted it meanwhile. */
export function ensureDraft(store: DraftStore, draft: Draft): Draft {
  let d = store.drafts.find((x) => x.id === draft.id);
  if (!d) {
    d = structuredClone(draft);
    store.drafts.push(d);
  }
  return d;
}

/** What a draft is called: its own name, else the person in it, else "Draft 2". */
export function draftTitle(d: Draft, nameField?: string): string {
  return d.name || (nameField ? (d.values[nameField] ?? "").trim() : "") || `Draft ${d.n}`;
}

/** Titles for the draft list, with "(2)" added where two drafts would read the same. */
export function draftTitles(store: DraftStore, nameField?: string): Map<string, string> {
  const seen = new Map<string, number>();
  const out = new Map<string, string>();
  for (const d of [...store.drafts].sort((a, b) => a.n - b.n)) {
    const t = draftTitle(d, nameField);
    const k = t.toLowerCase();
    const count = (seen.get(k) ?? 0) + 1;
    seen.set(k, count);
    out.set(d.id, count > 1 ? `${t} (${count})` : t);
  }
  return out;
}

export function hasText(values: Record<string, string>): boolean {
  return Object.values(values).some((v) => v.trim());
}
