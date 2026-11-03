/**
 * Fill-in templates: fields on the left, a live document on the right.
 *
 * Everything stays in this browser (localStorage):
 * - drafts, several per template, the active one saved as the reader types (drafts.ts);
 * - company details and a letterhead logo, saved once and filled into every letter (profile.ts);
 * - the people the reader has written about, to fill the next document about them (people.ts).
 * Export: copy, Word (with the letterhead), print or PDF.
 */
import { draftTitles, ensureDraft, makeDraft, MAX_DRAFTS, parseStore, readDrafts, updateDrafts, draftsKey, type Draft, type DraftStore } from "./drafts.ts";
import {
  PROFILE_FIELDS,
  forgetProfile,
  letterheadBox,
  listWords,
  loadLetterhead,
  loadProfile,
  logoForDocx,
  profileShort,
  readLogo,
  removeLetterhead,
  saveLetterhead,
  saveProfile,
  COMPANY_KEY,
  LETTERHEAD_KEY,
  type Letterhead,
  type Profile,
  type ProfileKey
} from "./profile.ts";
import { forgetPeople, loadPeople, matchOption, personLabel, planFill, readPerson, savePeople, upsertPerson, PEOPLE_KEY, type Person, type PersonSlots } from "./people.ts";
import { readJson } from "./store.ts";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Tone = "ok" | "bad";

const root = document.querySelector<HTMLElement>("[data-template]");
if (root) init(root);

function init(root: HTMLElement) {
  const tpl = root.dataset.template!;
  const docTitle = root.dataset.title ?? "Document";
  const companyVoice = root.dataset.voice !== "employee";
  const slots = JSON.parse(root.dataset.people ?? "{}") as PersonSlots;
  const nameField = root.dataset.nameField || undefined;
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);

  const form = q<HTMLFormElement>("[data-tpl-form]")!;
  const doc = q("[data-tpl-doc]")!;
  const status = q("[data-tpl-status]");
  const inputs = Array.from(form.querySelectorAll<Control>("[data-f]"));
  const byId = new Map(inputs.map((el) => [el.name, el]));
  const defaults = new Map(inputs.map((el) => [el.name, defaultOf(el)]));
  const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
  const dayTime = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  function say(el: HTMLElement | null, text: string, tone: Tone = "ok") {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("bad", tone === "bad");
  }

  /* ---------- Values ---------- */
  const values = (): Record<string, string> => Object.fromEntries(inputs.map((el) => [el.name, el.value]));
  function applyValues(saved: Record<string, string>) {
    for (const el of inputs) el.value = saved[el.name] ?? defaults.get(el.name) ?? "";
  }

  /* ---------- Drafts ---------- */
  let store: DraftStore = readDrafts(tpl);
  let draft: Draft = store.drafts.find((d) => d.id === store.active) ?? store.drafts[0];
  const draftSelect = q<HTMLSelectElement>("[data-draft-select]");
  const draftSaved = q("[data-draft-saved]");
  const draftStatus = q("[data-draft-status]");
  const draftForm = q<HTMLFormElement>("[data-draft-form]");
  const draftName = q<HTMLInputElement>("[data-draft-name]");
  const draftConfirm = q("[data-draft-confirm]");
  let draftMode: "saveas" | "rename" = "saveas";
  let draftOpener: HTMLElement | null = null;

  const titleOf = (d: Draft) => draftTitles(store, nameField).get(d.id) ?? `Draft ${d.n}`;

  function renderDrafts() {
    if (!draftSelect) return;
    const titles = draftTitles(store, nameField);
    const list = [...store.drafts].sort((a, b) => a.n - b.n);
    const same = draftSelect.options.length === list.length && list.every((d, i) => draftSelect.options[i].value === d.id && draftSelect.options[i].text === titles.get(d.id));
    if (!same) draftSelect.replaceChildren(...list.map((d) => new Option(titles.get(d.id) ?? `Draft ${d.n}`, d.id)));
    draftSelect.value = draft.id;
  }

  function markSaved(ok: boolean) {
    if (!draftSaved) return;
    if (ok) say(draftSaved, `Saved on this device at ${timeFmt.format(new Date())}`);
    else {
      say(draftSaved, "Not saved: this browser's storage is full or turned off.", "bad");
      say(draftStatus, "This draft couldn't be saved. Download it as a Word file to keep it.", "bad");
    }
  }

  /** Write this tab's draft into the store (and only this draft, so other tabs' drafts survive). */
  function persist(): boolean {
    draft.values = values();
    draft.updated = Date.now();
    const res = updateDrafts(tpl, store, (st) => {
      const d = ensureDraft(st, draft);
      Object.assign(d, { values: draft.values, updated: draft.updated, name: draft.name, personId: draft.personId });
      st.active = draft.id;
    });
    store = res.store;
    draft = store.drafts.find((d) => d.id === draft.id) ?? draft;
    markSaved(res.ok);
    return res.ok;
  }

  function closeDraftPanels(focusBack = true) {
    if (draftForm) draftForm.hidden = true;
    if (draftConfirm) draftConfirm.hidden = true;
    if (focusBack) draftOpener?.focus();
    draftOpener = null;
  }

  /** Show another draft in the form: its values, then the company details in any empty company field. */
  function load(next: Draft) {
    draft = next;
    applyValues(draft.values);
    lastFilled = autofillCompany();
    update();
    renderDrafts();
    renderCompany();
    renderPicker();
    const stored = parseStore(readJson(draftsKey(tpl)))?.drafts.find((d) => d.id === draft.id);
    say(draftSaved, stored?.updated ? `Last saved ${dayTime.format(new Date(stored.updated))}` : "");
  }

  function switchTo(id: string) {
    if (id === draft.id) return;
    capturePerson();
    const fresh = parseStore(readJson(draftsKey(tpl))) ?? store;
    const target = fresh.drafts.find((d) => d.id === id);
    if (!target) {
      renderDrafts();
      return;
    }
    store = fresh;
    load(target);
    const res = updateDrafts(tpl, store, (st) => (st.active = id));
    store = res.store;
    say(draftStatus, `Now editing “${titleOf(draft)}”.`);
  }

  draftSelect?.addEventListener("change", () => {
    closeDraftPanels(false);
    switchTo(draftSelect.value);
  });

  function openDraftForm(mode: "saveas" | "rename", opener: HTMLElement) {
    if (!draftForm || !draftName) return;
    closeDraftPanels(false);
    draftMode = mode;
    draftOpener = opener;
    q("[data-draft-form-label]")!.textContent = mode === "saveas" ? "Name of the new draft" : "New name for this draft";
    q("[data-draft-form-help]")!.textContent =
      mode === "saveas"
        ? "For example the candidate's name. Leave it empty to call the draft after the person in it."
        : "Leave it empty to call the draft after the person in it.";
    q("[data-draft-form-ok]")!.textContent = mode === "saveas" ? "Save draft" : "Save name";
    draftName.value = mode === "rename" ? (draft.name ?? "") : "";
    draftName.placeholder = mode === "rename" ? titleOf(draft) : "Rahul Sharma, Sales";
    draftForm.hidden = false;
    draftName.focus();
    draftName.select();
  }

  draftForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = draftName?.value.trim() ?? "";
    if (draftMode === "saveas") {
      if (store.drafts.length >= MAX_DRAFTS) {
        say(draftStatus, `You have ${MAX_DRAFTS} drafts of this document. Delete one you no longer need, then save again.`, "bad");
        return;
      }
      capturePerson();
      persist();
      const copy = makeDraft(store, values(), name);
      store.drafts.push(copy);
      draft = copy;
      const ok = persist();
      closeDraftPanels(false);
      renderDrafts();
      draftSelect?.focus();
      if (ok) say(draftStatus, `Saved a copy as “${titleOf(draft)}”. You are now editing the copy; the original is unchanged.`);
    } else {
      draft.name = name || undefined;
      const ok = persist();
      closeDraftPanels(false);
      renderDrafts();
      draftSelect?.focus();
      if (ok) say(draftStatus, name ? `Renamed to “${titleOf(draft)}”.` : `Name cleared. The draft is called “${titleOf(draft)}”.`);
    }
  });

  root.querySelectorAll<HTMLElement>("[data-draft-cancel]").forEach((b) => b.addEventListener("click", () => closeDraftPanels()));
  [draftForm, draftConfirm].forEach((p) =>
    p?.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") {
        e.preventDefault();
        closeDraftPanels();
      }
    })
  );

  root.querySelector<HTMLElement>('[data-draft-act="saveas"]')?.addEventListener("click", (e) => openDraftForm("saveas", e.currentTarget as HTMLElement));
  root.querySelector<HTMLElement>('[data-draft-act="rename"]')?.addEventListener("click", (e) => openDraftForm("rename", e.currentTarget as HTMLElement));

  root.querySelector<HTMLElement>('[data-draft-act="blank"]')?.addEventListener("click", () => {
    closeDraftPanels(false);
    if (store.drafts.length >= MAX_DRAFTS) {
      say(draftStatus, `You have ${MAX_DRAFTS} drafts of this document. Delete one you no longer need, then start another.`, "bad");
      return;
    }
    capturePerson();
    persist();
    const blank = makeDraft(store, {});
    store.drafts.push(blank);
    load(blank);
    const ok = persist();
    if (ok) say(draftStatus, `Started “${titleOf(draft)}”.${lastFilled.length ? " Your company details are filled in." : ""} Your other drafts are in the list.`);
  });

  root.querySelector<HTMLElement>('[data-draft-act="delete"]')?.addEventListener("click", (e) => {
    if (!draftConfirm) return;
    closeDraftPanels(false);
    draftOpener = e.currentTarget as HTMLElement;
    const others = store.drafts.length - 1;
    q("[data-draft-confirm-text]")!.textContent = `Delete the draft “${titleOf(draft)}” from this device? ${
      others ? "Your other drafts stay." : "A blank draft takes its place."
    } This can't be undone.`;
    draftConfirm.hidden = false;
    q<HTMLButtonElement>("[data-draft-delete]")?.focus();
  });

  q("[data-draft-delete]")?.addEventListener("click", () => {
    const gone = titleOf(draft);
    const goneId = draft.id;
    const res = updateDrafts(tpl, store, (st) => {
      st.drafts = st.drafts.filter((d) => d.id !== goneId);
      if (!st.drafts.length) st.drafts.push(makeDraft(null, {}));
      st.active = [...st.drafts].sort((a, b) => b.updated - a.updated)[0].id;
    });
    store = res.store;
    load(store.drafts.find((d) => d.id === store.active)!);
    closeDraftPanels(false);
    draftSelect?.focus();
    say(draftStatus, res.ok ? `Deleted “${gone}”. Now editing “${titleOf(draft)}”.` : "The draft couldn't be deleted: this browser's storage is turned off.", res.ok ? "ok" : "bad");
  });

  /* ---------- Company details and letterhead ---------- */
  const co = q("[data-co]");
  const coNote = q("[data-co-note]");
  const coStatus = q("[data-co-status]");
  const coForm = q<HTMLFormElement>("[data-co-form]");
  const coView = q("[data-co-view]");
  const coConfirm = q("[data-co-confirm]");
  const lhFile = q<HTMLInputElement>("[data-lh-file]");
  const coBtn = (act: string) => q<HTMLButtonElement>(`[data-co-act="${act}"]`);
  const keysHere = PROFILE_FIELDS.map((f) => f.key).filter((k) => inputs.some((el) => el.dataset.profile === k));
  let profile: Profile | null = loadProfile();
  let logo: Letterhead | null = loadLetterhead();
  let lastFilled: ProfileKey[] = [];

  /** Fill empty company fields from the saved details. Returns what was filled. */
  function autofillCompany(): ProfileKey[] {
    if (!profile) return [];
    const filled = new Set<ProfileKey>();
    for (const el of inputs) {
      const key = el.dataset.profile as ProfileKey | undefined;
      const v = key ? profile[key] : undefined;
      if (key && v && !el.value.trim()) {
        el.value = v;
        filled.add(key);
      }
    }
    return PROFILE_FIELDS.map((f) => f.key).filter((k) => filled.has(k));
  }

  /** The company details as this draft has them: the first field of each kind that has text. */
  function draftProfile(): Profile {
    const out: Profile = {};
    for (const el of inputs) {
      const key = el.dataset.profile as ProfileKey | undefined;
      if (key && !out[key] && el.value.trim()) out[key] = el.value.trim();
    }
    return out;
  }

  const oneLine = (s: string) => s.split(/\s*\n\s*/).filter(Boolean).join(", ");

  function renderCompany() {
    renderLetterhead();
    if (coNote) {
      coNote.textContent = lastFilled.length ? `Filled in from your saved company details: ${listWords(lastFilled.map(profileShort))}.` : "";
    }
    if (!co) return;
    const saved = profile;
    const here = draftProfile();
    const name = q("[data-co-name]")!;
    name.textContent = saved?.company ?? "Not saved yet";
    name.classList.toggle("empty", !saved?.company);
    const lines = q("[data-co-lines]")!;
    const rows: [string, string][] = [];
    if (saved?.company_address) rows.push(["", oneLine(saved.company_address)]);
    if (saved?.signatory_name || saved?.signatory_role) rows.push(["Signed by ", [saved.signatory_name, saved.signatory_role].filter(Boolean).join(", ")]);
    if (saved?.hr_contact) rows.push(["HR contact: ", saved.hr_contact]);
    lines.replaceChildren(
      ...rows.map(([label, text]) => {
        const li = document.createElement("li");
        if (label) li.append(label);
        const b = document.createElement("b");
        b.textContent = text;
        li.append(b);
        return li;
      })
    );
    q("[data-co-empty]")!.hidden = !!saved;
    const filledNote = q("[data-co-filled]")!;
    filledNote.hidden = !(saved && lastFilled.length);
    q("[data-co-filled-text]")!.textContent = lastFilled.length ? `Filled in on this page: ${listWords(lastFilled.map(profileShort))}.` : "";
    // Where this draft and the saved details disagree, offer both ways to make them match.
    const differ = saved ? keysHere.filter((k) => here[k] && saved[k] && here[k] !== saved[k]) : [];
    const newer = keysHere.filter((k) => here[k] && here[k] !== saved?.[k]);
    const diff = q("[data-co-diff]")!;
    diff.hidden = !differ.length;
    diff.textContent = differ.length ? `This draft's ${listWords(differ.map(profileShort))} ${differ.length === 1 ? "differs" : "differ"} from your saved details.` : "";
    coBtn("save")!.hidden = !!saved && !newer.length;
    coBtn("use")!.hidden = !differ.length;
    coBtn("edit")!.hidden = !saved;
    coBtn("forget")!.hidden = !saved && !logo;
    coBtn("remove-logo")!.hidden = !logo;
    q("[data-lh-label]")!.textContent = logo ? "Change logo" : "Add a logo";
    const swatch = q("[data-lh-swatch]")!;
    swatch.hidden = !logo;
    const thumb = q<HTMLImageElement>("[data-lh-thumb]")!;
    if (logo && thumb.getAttribute("src") !== logo.src) thumb.src = logo.src;
  }

  function renderLetterhead() {
    const box = q("[data-letterhead]")!;
    const img = q<HTMLImageElement>("[data-letterhead-img]")!;
    const show = companyVoice && !!logo;
    box.hidden = !show;
    if (show && logo) {
      const size = letterheadBox(logo);
      if (img.getAttribute("src") !== logo.src) img.src = logo.src;
      img.width = size.width;
      img.height = size.height;
      const company = draftProfile().company ?? profile?.company;
      img.alt = company ? `${company} logo` : "Company logo";
    } else img.removeAttribute("src");
  }

  function openCoEditor(prefill: Profile) {
    if (!coForm || !coView) return;
    for (const f of PROFILE_FIELDS) {
      const el = coForm.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-co-in="${f.key}"]`);
      if (el) el.value = prefill[f.key] ?? "";
    }
    coView.hidden = true;
    if (coConfirm) coConfirm.hidden = true;
    coForm.hidden = false;
    coForm.querySelector<HTMLInputElement>('[data-co-in="company"]')?.focus();
  }

  function closeCoEditor(focus?: HTMLElement | null) {
    if (coForm) coForm.hidden = true;
    if (coConfirm) coConfirm.hidden = true;
    if (coView) coView.hidden = false;
    renderCompany();
    (focus && !focus.hidden ? focus : coBtn(profile ? "edit" : "save"))?.focus();
  }

  function storeProfile(next: Profile, fromEditor: boolean) {
    if (!saveProfile(next)) {
      say(coStatus, "Couldn't save: this browser's storage is full or turned off.", "bad");
      return false;
    }
    profile = loadProfile();
    // Fill this letter's empty company fields too, as every other letter will be.
    const filled = autofillCompany();
    if (filled.length) {
      lastFilled = [...new Set([...lastFilled, ...filled])];
      update();
      persist();
    }
    const what = listWords(PROFILE_FIELDS.filter((f) => profile?.[f.key]).map((f) => f.short));
    say(coStatus, `Company details saved${fromEditor ? "" : " from this letter"}. Every letter and form will fill in the ${what}.`);
    return true;
  }

  coBtn("save")?.addEventListener("click", () => {
    const next: Profile = { ...(profile ?? {}), ...draftProfile() };
    if (!next.company) {
      openCoEditor(next);
      say(coStatus, "Add the company name, then save.");
      return;
    }
    if (storeProfile(next, false)) renderCompany();
    coBtn(profile ? "edit" : "save")?.focus();
  });

  coBtn("use")?.addEventListener("click", () => {
    if (!profile) return;
    for (const el of inputs) {
      const key = el.dataset.profile as ProfileKey | undefined;
      if (key && profile[key]) el.value = profile[key]!;
    }
    update();
    persist();
    renderCompany();
    say(coStatus, "This draft now uses your saved company details.");
    coBtn("edit")?.focus();
  });

  coBtn("edit")?.addEventListener("click", () => {
    say(coStatus, "");
    openCoEditor(profile ?? draftProfile());
  });

  coForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const next: Profile = {};
    for (const f of PROFILE_FIELDS) {
      const el = coForm.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-co-in="${f.key}"]`);
      if (el?.value.trim()) next[f.key] = el.value.trim();
    }
    if (!next.company) {
      say(coStatus, "Add the company name: it goes at the top of every letter.", "bad");
      coForm.querySelector<HTMLInputElement>('[data-co-in="company"]')?.focus();
      return;
    }
    if (storeProfile(next, true)) closeCoEditor(coBtn("edit"));
  });

  coForm?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      say(coStatus, "");
      closeCoEditor(coBtn(profile ? "edit" : "save"));
    }
  });

  root.querySelectorAll<HTMLElement>("[data-co-cancel]").forEach((b) =>
    b.addEventListener("click", () => {
      say(coStatus, "");
      closeCoEditor(coBtn(profile ? "edit" : "save"));
    })
  );

  coBtn("forget")?.addEventListener("click", () => {
    if (!coConfirm || !coView) return;
    coView.hidden = true;
    coConfirm.hidden = false;
    q<HTMLButtonElement>("[data-co-forget]")?.focus();
  });

  coConfirm?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCoEditor(coBtn("forget"));
    }
  });

  q("[data-co-forget]")?.addEventListener("click", () => {
    forgetProfile();
    profile = null;
    logo = null;
    lastFilled = [];
    closeCoEditor(coBtn("save"));
    say(coStatus, "Company details and logo forgotten on this device. Letters you have filled in keep their text.");
  });

  lhFile?.addEventListener("change", async () => {
    const file = lhFile.files?.[0];
    lhFile.value = "";
    if (!file) return;
    try {
      const next = await readLogo(file);
      if (!saveLetterhead(next)) {
        say(coStatus, "Couldn't save the logo: this browser's storage is full. Try a smaller file.", "bad");
        return;
      }
      logo = next;
      renderCompany();
      say(coStatus, `Logo added. It appears at the top of ${companyVoice ? "this letter" : "your letters"}, the printout and the Word file.`);
    } catch (err) {
      say(coStatus, err instanceof Error ? err.message : "That logo couldn't be read. Try another file.", "bad");
    }
  });

  coBtn("remove-logo")?.addEventListener("click", () => {
    removeLetterhead();
    logo = null;
    renderCompany();
    say(coStatus, "Logo removed. Letters print without a letterhead logo.");
    lhFile?.focus();
  });

  /* ---------- People: fill from a recent person ---------- */
  const pick = q("[data-pick]");
  const pickSelect = q<HTMLSelectElement>("[data-pick-select]");
  const pickStatus = q("[data-pick-status]");
  let people: Person[] = loadPeople();

  function renderPicker() {
    if (!pick || !pickSelect) return;
    people = loadPeople();
    pick.hidden = !people.length;
    const keep = pickSelect.value;
    pickSelect.replaceChildren(new Option("Choose a person", ""), ...people.map((p) => new Option(personLabel(p), p.id)));
    if (people.some((p) => p.id === keep)) pickSelect.value = keep;
  }

  /** Keep the person in this document for other documents: name, role, dates, pay. */
  function capturePerson() {
    if (!nameField) return;
    const data = readPerson(values(), slots);
    if (!data.name) return;
    const res = upsertPerson(loadPeople(), data, { linkId: draft.personId, from: docTitle });
    if (!res.id) return;
    if (!savePeople(res.list)) return;
    if (draft.personId !== res.id) {
      draft.personId = res.id;
      persist();
    }
    // The list itself refreshes when a draft opens, so the form never jumps while someone types.
  }

  const accept = (id: string, value: string): string | null => {
    const el = byId.get(id);
    if (!el) return null;
    if (el instanceof HTMLSelectElement) return matchOption(value, Array.from(el.options, (o) => o.value).filter(Boolean));
    if (el.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    return value;
  };

  q("[data-pick-fill]")?.addEventListener("click", () => {
    const person = people.find((p) => p.id === pickSelect?.value);
    if (!person) {
      say(pickStatus, "Choose a person from the list first.");
      pickSelect?.focus();
      return;
    }
    const plan = planFill(person, slots, values(), accept);
    for (const [id, v] of Object.entries(plan.values)) {
      const el = byId.get(id);
      if (el) el.value = v;
    }
    draft.personId = person.id;
    update();
    persist();
    renderDrafts();
    const who = person.data.name ?? "this person";
    const words = plan.filled.length > 4 ? `${plan.filled.slice(0, 3).join(", ")} and ${plan.filled.length - 3} more` : listWords(plan.filled);
    say(
      pickStatus,
      !plan.filled.length
        ? `${who}'s details are already filled in here.`
        : plan.mode === "replace"
          ? `Replaced the person in this draft with ${who}: ${words}.`
          : `Filled in ${plan.filled.length} ${plan.filled.length === 1 ? "detail" : "details"} for ${who}: ${words}.`
    );
  });

  q("[data-pick-forget]")?.addEventListener("click", () => {
    forgetPeople();
    people = [];
    renderPicker();
    // The picker has gone; tell everyone, and put focus somewhere sensible.
    say(draftStatus, "Recent people forgotten on this device. The details already in your letters stay.");
    (nameField ? byId.get(nameField) : inputs[0])?.focus();
  });

  /* ---------- The live document ---------- */
  const format = (type: string, v: string) => {
    if (!v) return "";
    if (type === "date") {
      const d = new Date(`${v}T00:00:00`);
      return Number.isNaN(d.getTime()) ? v : longDate.format(d);
    }
    if (type === "money") {
      const n = Number(v.replace(/[^\d.]/g, ""));
      return Number.isFinite(n) && v.trim() !== "" ? inr.format(n) : v;
    }
    return v;
  };

  function update() {
    const vals: Record<string, string> = {};
    for (const el of inputs) vals[el.name] = el.value.trim();
    doc.querySelectorAll<HTMLElement>(".ph").forEach((ph) => {
      const f = ph.dataset.f!;
      if (f === "today") {
        ph.textContent = longDate.format(new Date());
        ph.classList.add("filled");
        return;
      }
      const v = format(ph.dataset.type ?? "text", vals[f] ?? "");
      if (v.includes("\n")) {
        // Keep the line breaks someone typed in a multi-line field.
        const parts = v.split(/\r?\n/);
        ph.replaceChildren(...parts.flatMap((line, i) => (i ? [document.createElement("br"), document.createTextNode(line)] : [document.createTextNode(line)])));
      } else {
        ph.textContent = v || ph.dataset.label || f;
      }
      ph.classList.toggle("filled", !!v);
    });
    // Hide blocks whose only placeholders are optional and empty. Forms keep them,
    // because people often print a form blank and fill it in by hand.
    const keepEmpty = root.dataset.kind === "form";
    doc.querySelectorAll<HTMLElement>("p, li, h2, h3, h4, tr").forEach((block) => {
      const phs = Array.from(block.querySelectorAll<HTMLElement>(":scope .ph"));
      if (!phs.length) return;
      const allOptEmpty = phs.every((p) => p.classList.contains("opt") && !p.classList.contains("filled"));
      block.hidden = !keepEmpty && allOptEmpty;
    });
    const missing = inputs.filter((el) => el.required && !el.value.trim()).length;
    if (status) status.textContent = missing ? `${missing} required ${missing === 1 ? "field is" : "fields are"} still empty.` : "All required fields are filled in.";
  }

  form.addEventListener("input", (e) => {
    const t = e.target as Control;
    if (!t.matches?.("[data-f]")) return;
    update();
    persist();
    if (t.name === nameField) renderDrafts();
    if (t.dataset.profile) renderCompany();
  });
  // A person's details are kept once a field is finished (on change), not at every keystroke.
  form.addEventListener("change", (e) => {
    const t = e.target as Control;
    if (t.matches?.("[data-f]") && slots[t.name]) capturePerson();
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  window.addEventListener("pagehide", capturePerson);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") capturePerson();
  });

  q("[data-tpl-reset]")?.addEventListener("click", () => {
    applyValues({});
    draft.personId = undefined;
    lastFilled = autofillCompany();
    update();
    persist();
    renderDrafts();
    renderCompany();
    say(status, `Fields cleared.${lastFilled.length ? " Your saved company details are filled in again." : ""}`);
  });

  // Another tab saved company details, a logo, people or drafts: show them here too.
  window.addEventListener("storage", (e) => {
    if (e.key === COMPANY_KEY || e.key === LETTERHEAD_KEY || e.key === null) {
      profile = loadProfile();
      logo = loadLetterhead();
      renderCompany();
    }
    if (e.key === PEOPLE_KEY || e.key === null) renderPicker();
    if (e.key === draftsKey(tpl)) {
      const fresh = parseStore(readJson(draftsKey(tpl)));
      if (fresh) {
        ensureDraft(fresh, draft);
        store = fresh;
        renderDrafts();
      }
    }
  });

  /* ---------- Export ---------- */
  const exportStatus = q("[data-tpl-export-status]");
  /** "Offer letter - Priya Nair": the document, and whose it is. */
  const exportName = () => {
    const t = titleOf(draft);
    return /^Draft \d+$/.test(t) ? docTitle : `${docTitle} - ${t}`;
  };
  const exportFile = () =>
    exportName()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "document";

  q("[data-tpl-copy]")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(doc.innerText.replace(/\n{3,}/g, "\n\n").trim());
      flash(btn, "Copied");
    } catch {
      flash(btn, "Select the text to copy");
    }
  });

  q("[data-tpl-print]")?.addEventListener("click", () => {
    // The browser names a saved PDF after the page title.
    const old = document.title;
    document.title = exportName();
    const restore = () => {
      document.title = old;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    setTimeout(restore, 1000);
  });

  q("[data-tpl-docx]")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true;
    const label = btn.querySelector("[data-label]");
    const old = label?.textContent;
    if (label) label.textContent = "Preparing…";
    say(exportStatus, "");
    try {
      const { toDocx } = await import("./docx-export");
      const company = draftProfile().company ?? profile?.company;
      const docxLogo = companyVoice && logo ? await logoForDocx(logo, company) : null;
      const blob = await toDocx(doc, exportName(), docxLogo ? { logo: docxLogo } : undefined);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${exportFile()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (companyVoice && logo && !docxLogo) say(exportStatus, "The Word file was made without the logo: this browser couldn't convert the SVG. A PNG logo works everywhere.", "bad");
    } catch (err) {
      console.error(err);
      say(exportStatus, "The Word file couldn't be made. Try again, or use Print or save PDF.", "bad");
    } finally {
      btn.disabled = false;
      if (label && old) label.textContent = old;
    }
  });

  /* ---------- Start ---------- */
  load(draft);
}

function defaultOf(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  if (el instanceof HTMLSelectElement) return Array.from(el.options).find((o) => o.defaultSelected)?.value ?? "";
  return el.defaultValue;
}

function flash(btn: HTMLButtonElement, text: string) {
  const label = btn.querySelector("[data-label]");
  if (!label) return;
  const old = label.textContent;
  label.textContent = text;
  setTimeout(() => (label.textContent = old), 1800);
}
