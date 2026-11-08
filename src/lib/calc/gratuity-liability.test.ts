import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLiability, readLiability, type Cell } from "./gratuity-liability.ts";

const table: Cell[][] = [
  ["Emp Code", "Employee Name", "Department", "Date of Joining", "Basic + DA", "Employment Type", "Last Working Day"],
  ["E1", "Asha", "Sales", "01/04/2019", "60,000", "Permanent", ""],
  ["E2", "Ravi", "Sales", "2024-01-15", "40000", "Permanent", ""],
  ["E3", "Meena", "Ops", "2025-01-01", "30000", "Fixed-term", ""],
  ["E4", "Yusuf", "Ops", "2010-01-01", "3,00,000", "Permanent", ""],
  ["E5", "Diya", "Ops", "2018-01-01", "50000", "Permanent", "2026-06-30"]
];

test("accrued and vested gratuity at 31 March 2027", () => {
  const { people, found } = readLiability(table);
  assert.equal(found.wages, 4);
  const r = computeLiability(people, "2027-03-31");
  const [asha, ravi, meena, yusuf, diya] = r.rows;
  // Asha: 8 years → 60,000 × 15/26 × 8 = 2,76,923; vested.
  assert.equal(asha.accrued, 276923);
  assert.equal(asha.vested, true);
  // Ravi: 3 years 2 months → 3 counted; accrued but not vested.
  assert.equal(ravi.counted, 3);
  assert.equal(ravi.vested, false);
  // Meena: fixed-term, 2 years 3 months → vested after one year.
  assert.equal(meena.vested, true);
  // Yusuf: capped at the ceiling.
  assert.equal(yusuf.capped, true);
  assert.equal(yusuf.accrued, 2000000);
  assert.equal(diya.excluded, "Has left");
  assert.equal(r.counted, 4);
  assert.equal(r.total, asha.accrued + ravi.accrued + meena.accrued + yusuf.accrued);
  assert.equal(r.vested, asha.accrued + meena.accrued + yusuf.accrued);
});
