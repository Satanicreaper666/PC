/**
 * Unique, build-stable ids for Learn components that can appear more than once on a
 * page (a quiz in the body and another after it; the practice page's many quizzes).
 * Ids only need to be unique within one page, so a counter shared by the build is enough.
 */
let n = 0;
export const uid = (prefix: string) => `${prefix}${(++n).toString(36)}`;

/** "Self-determination theory" -> "self-determination-theory" */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
