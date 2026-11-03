import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyGender, classifyStatus, detectColumns, findHeaderRow, guessSalaryPeriod, parseMoney, type Cell } from "./fields.ts";

const pick = (headers: string[], rows: Cell[][] = []) => {
  const { map } = detectColumns(headers, rows);
  return Object.fromEntries(Object.entries(map).map(([k, i]) => [k, headers[i!]]));
};

test("recognises common Indian HR export headers", () => {
  const headers = ["Emp Code", "Employee Name", "Gender", "Date of Birth", "Date of Joining", "Last Working Day", "Status", "Department", "Designation", "Grade", "Location", "Reporting Manager", "Annual CTC"];
  const rows: Cell[][] = [["E1001", "Asha Rao", "Female", "14-Mar-1990", "01-Apr-2020", "", "Active", "Sales", "Sales executive", "G1", "Pune", "E1000", "540000"]];
  assert.deepEqual(pick(headers, rows), {
    id: "Emp Code", name: "Employee Name", gender: "Gender", dob: "Date of Birth", doj: "Date of Joining", doe: "Last Working Day",
    status: "Status", dept: "Department", designation: "Designation", grade: "Grade", location: "Location", manager: "Reporting Manager", salary: "Annual CTC"
  });
});

test("short and decorated headers", () => {
  const headers = ["S.No", "ECode", "Name of Employee", "D.O.J", "LWD", "CTC (₹ per annum)", "Manager ID", "Work Location", "Sex", "Dept"];
  const rows: Cell[][] = [["1", "A12", "Ravi", "01/02/2021", "", "6,00,000", "A01", "Chennai", "M", "Ops"]];
  const m = pick(headers, rows);
  assert.equal(m.id, "ECode");
  assert.equal(m.doj, "D.O.J");
  assert.equal(m.doe, "LWD");
  assert.equal(m.salary, "CTC (₹ per annum)");
  assert.equal(m.manager, "Manager ID");
  assert.equal(m.location, "Work Location");
  assert.equal(m.gender, "Sex");
  assert.equal(m.dept, "Dept");
});

test("look-alike headers don't steal a field", () => {
  const headers = ["Employee ID", "Home City", "Location Code", "Contract End Date", "Exit Reason", "Marital Status", "Is Manager", "Date of Joining"];
  const rows: Cell[][] = [
    ["E1", "Kochi", "BLR", "31/03/2027", "", "Married", "Y", "01/01/2024"],
    ["E2", "Delhi", "BLR", "", "Better offer", "Single", "N", "02/01/2024"]
  ];
  const m = pick(headers, rows);
  assert.equal(m.id, "Employee ID");
  assert.notEqual(m.location, "Home City", "a home town is not the work location");
  assert.equal(m.doe, undefined, "contract end date is not a last working day");
  assert.equal(m.status, undefined, "marital status is not employment status");
  assert.equal(m.manager, undefined, "a yes/no column is not a manager");
  assert.equal(m.doj, "Date of Joining");
});

test("a date column must hold dates", () => {
  const m = pick(["Joining", "Date of Joining"], [["Yes", "12/01/2024"], ["No", "15/03/2023"]]);
  assert.equal(m.doj, "Date of Joining");
});

test("finds the header row under a title", () => {
  const rows: Cell[][] = [["Employee master as on 31-10-2026"], [], ["Emp ID", "Name", "DOJ", "Department"], ["E1", "Asha", "01/01/2024", "HR"]];
  assert.equal(findHeaderRow(rows), 2);
  assert.equal(findHeaderRow([["ID", "Name"], ["1", "Ravi"]]), 0);
});

test("detects month-first files and monthly salaries", () => {
  const d = detectColumns(["Hire Date", "Monthly Salary"], [["03/25/2024", "45000"], ["11/30/2023", "62000"]]);
  assert.equal(d.dateOrder, "mdy");
  assert.equal(d.salaryPeriod, "monthly");
  assert.equal(guessSalaryPeriod([540000, 900000, 1200000]), "annual");
});

test("gender values", () => {
  assert.deepEqual(classifyGender("F"), { gender: "women", recognised: true });
  assert.deepEqual(classifyGender(" female "), { gender: "women", recognised: true });
  assert.deepEqual(classifyGender("MALE"), { gender: "men", recognised: true });
  assert.deepEqual(classifyGender("Transgender"), { gender: "other", recognised: true });
  assert.deepEqual(classifyGender("Prefer not to say"), { gender: "unknown", recognised: true });
  assert.deepEqual(classifyGender(""), { gender: "unknown", recognised: true });
  assert.deepEqual(classifyGender("Femal"), { gender: "unknown", recognised: false });
});

test("status values", () => {
  for (const v of ["Active", "Confirmed", "On probation", "Notice period", "Serving notice", "Resigned - serving notice", "Yet to join", "On leave"]) assert.equal(classifyStatus(v), "active", v);
  for (const v of ["Resigned", "Inactive", "Terminated", "Absconding", "Retired", "Separated", "Left", "Ex-employee", "Not working", "F&F done", "Contract ended"]) assert.equal(classifyStatus(v), "left", v);
  assert.equal(classifyStatus("Band B"), null);
  assert.equal(classifyStatus(""), null);
});

test("salary values", () => {
  assert.equal(parseMoney("₹12,00,000"), 1_200_000);
  assert.equal(parseMoney("12,00,000/-"), 1_200_000);
  assert.equal(parseMoney("Rs. 45,000"), 45_000);
  assert.equal(parseMoney("12 LPA"), 1_200_000);
  assert.equal(parseMoney("12.5 lakh"), 1_250_000);
  assert.equal(parseMoney("1.2 Cr"), 12_000_000);
  assert.equal(parseMoney("45k"), 45_000);
  assert.equal(parseMoney("540000 per annum"), 540_000);
  assert.equal(parseMoney(540000), 540_000);
  assert.equal(parseMoney("NA"), null);
  assert.equal(parseMoney(-5), null);
  assert.equal(parseMoney(""), null);
});
