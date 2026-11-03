/**
 * Reporting lines from a list of people: resolve each manager reference,
 * break reporting loops, and keep a record of every decision so the data
 * checks can explain it. Nothing here touches the DOM.
 */
import { embeddedId, matchKey, stripBrackets, type Person } from "./fields.ts";

/** Why someone is at the top of a tree: no manager given, listed as their own manager, manager not found, name matches several people, or a loop was broken there. */
export type TopReason = "none" | "self" | "notFound" | "ambiguous" | "loop";

export type Org = {
  people: Person[];
  /** Index of each person's manager, or null at the top of a tree. */
  parent: (number | null)[];
  /** Direct reports, in file order. */
  children: number[][];
  /** People at the top of each tree, in file order. */
  roots: number[];
  /** 1 = top of a tree. */
  level: number[];
  /** People beneath each person, directly or indirectly. */
  below: number[];
  topReason: (TopReason | null)[];
  /** Reporting loops, each listed in "reports to" order. */
  loops: number[][];
  /** Rows sharing an employee ID, one list per ID. */
  duplicates: number[][];
  /** For people whose manager couldn't be placed: the text in the file and, for names, who it matched. */
  unresolved: Map<number, { text: string; matches: number[] }>;
};

/** "Asha Rao" or "Row 12" when the name is blank. */
export const displayName = (p: Person) => p.name || (p.id ? `ID ${p.id}` : `Row ${p.row}`);

export function buildOrg(people: Person[]): Org {
  const n = people.length;
  const byId = new Map<string, number[]>();
  const byName = new Map<string, number[]>();
  people.forEach((p, i) => {
    if (p.id) {
      const k = matchKey(p.id);
      byId.set(k, [...(byId.get(k) ?? []), i]);
    }
    if (p.name) {
      const k = matchKey(p.name);
      byName.set(k, [...(byName.get(k) ?? []), i]);
    }
  });
  const firstWithId = (v: string): number | undefined => {
    const direct = byId.get(matchKey(v));
    if (direct) return direct[0];
    for (const x of embeddedId(v)) {
      const hit = byId.get(matchKey(x));
      if (hit) return hit[0];
    }
    return undefined;
  };
  const withName = (v: string, self: number): number[] => {
    const all = byName.get(matchKey(stripBrackets(v))) ?? [];
    // Nobody manages themselves, so a namesake is the only other candidate.
    return all.length > 1 ? all.filter((i) => i !== self) : all;
  };

  const parent: (number | null)[] = new Array(n).fill(null);
  const topReason: (TopReason | null)[] = new Array(n).fill(null);
  const unresolved = new Map<number, { text: string; matches: number[] }>();

  people.forEach((p, i) => {
    const idRef = p.managerId.trim();
    const nameRef = p.managerName.trim();
    if (!idRef && !nameRef) {
      topReason[i] = "none";
      return;
    }
    let to: number | undefined;
    let ambiguous: number[] = [];
    if (idRef) {
      to = firstWithId(idRef);
      // A manager ID column that holds names after all.
      if (to === undefined) {
        const named = withName(idRef, i);
        if (named.length === 1) to = named[0];
        else if (named.length > 1) ambiguous = named;
      }
    }
    if (to === undefined && nameRef) {
      to = firstWithId(nameRef);
      if (to === undefined) {
        const named = withName(nameRef, i);
        if (named.length === 1) to = named[0];
        else if (named.length > 1) ambiguous = named;
      }
    }
    if (to === i) {
      topReason[i] = "self";
      return;
    }
    if (to !== undefined) {
      parent[i] = to;
      return;
    }
    topReason[i] = ambiguous.length ? "ambiguous" : "notFound";
    unresolved.set(i, { text: idRef || nameRef, matches: ambiguous });
  });

  // Reporting loops: follow each chain of managers; meeting a person already on the chain closes a loop.
  const loops: number[][] = [];
  const state = new Uint8Array(n); // 0 not seen, 1 on the current chain, 2 done
  for (let s = 0; s < n; s++) {
    if (state[s]) continue;
    const chain: number[] = [];
    let v: number | null = s;
    while (v !== null && state[v] === 0) {
      state[v] = 1;
      chain.push(v);
      v = parent[v];
    }
    if (v !== null && state[v] === 1) {
      const loop = chain.slice(chain.indexOf(v));
      loops.push(loop);
      const cut = Math.min(...loop); // the first of them in the file goes to the top
      parent[cut] = null;
      topReason[cut] = "loop";
    }
    for (const x of chain) state[x] = 2;
  }

  const children: number[][] = Array.from({ length: n }, () => []);
  const roots: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = parent[i];
    if (p === null) roots.push(i);
    else children[p].push(i);
  }

  const level = new Array<number>(n).fill(0);
  const order = preorder(children, roots);
  for (const i of order) level[i] = parent[i] === null ? 1 : level[parent[i]!] + 1;
  const below = new Array<number>(n).fill(0);
  for (let k = order.length - 1; k >= 0; k--) {
    const i = order[k];
    const p = parent[i];
    if (p !== null) below[p] += below[i] + 1;
  }

  const duplicates = [...byId.values()].filter((list) => list.length > 1);
  return { people, parent, children, roots, level, below, topReason, loops, duplicates, unresolved };
}

/** Everyone under the given tops, depth first, each person before their reports (file order among reports). */
export function preorder(children: number[][], tops: number[]): number[] {
  const out: number[] = [];
  const stack = [...tops].reverse();
  while (stack.length) {
    const i = stack.pop()!;
    out.push(i);
    const kids = children[i];
    for (let k = kids.length - 1; k >= 0; k--) stack.push(kids[k]);
  }
  return out;
}

/** The chain of managers above someone, nearest first. */
export function managersAbove(org: Org, i: number): number[] {
  const out: number[] = [];
  let p = org.parent[i];
  while (p !== null && out.length < org.people.length) {
    out.push(p);
    p = org.parent[p];
  }
  return out;
}

/** Is `i` inside the tree headed by `top` (or `top` itself)? */
export function isWithin(org: Org, i: number, top: number): boolean {
  return i === top || managersAbove(org, i).includes(top);
}
