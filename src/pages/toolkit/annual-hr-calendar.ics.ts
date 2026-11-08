/** The annual HR calendar's statutory dates as a calendar file, built with the site. */
import type { APIRoute } from "astro";
import { HR_CALENDAR_2026_27 } from "../../data/hr-calendar";
import { toIcs } from "../../lib/ics/ics";

export const GET: APIRoute = () =>
  new Response(toIcs("PeopleCraft HR calendar 2026-27", HR_CALENDAR_2026_27), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" }
  });
