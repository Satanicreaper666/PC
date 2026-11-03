import { test } from "node:test";
import assert from "node:assert/strict";
import { detectOrgColumns, embeddedId, findOrgHeaderRow, managerColumnKind, mappingProblem, readPeople, stripBrackets, templateCsv, type Cell, type OcColumnMap } from "./fields.ts";

const pick = (headers: string[], rows: Cell[][] = []) => {
  const map = detectOrgColumns(headers, rows);
  return Object.fromEntries(Object.entries(map).map(([k, i]) => [k, headers[i!]]));
};

test("recognises the template and common HR export headers", () => {
  assert.deepEqual(pick(["Employee ID", "Name", "Job title", "Manager's employee ID", "Department", "Location"]), {
    id: "Employee ID", name: "Name", title: "Job title", managerId: "Manager's employee ID", dept: "Department", location: "Location"
  });
  assert.deepEqual(pick(["Emp Code", "Employee Name", "Designation", "Reporting Manager Code", "Reporting Manager Name", "Dept", "Work Location"]), {
    id: "Emp Code", name: "Employee Name", title: "Designation", managerId: "Reporting Manager Code", managerName: "Reporting Manager Name", dept: "Dept", location: "Work Location"
  });
});

test("a manager column never becomes the person's own ID or name", () => {
  const m = pick(["Manager Employee ID", "Manager Name", "Emp ID", "Full Name"]);
  assert.equal(m.id, "Emp ID");
  assert.equal(m.name, "Full Name");
  assert.equal(m.managerId, "Manager Employee ID");
  assert.equal(m.managerName, "Manager Name");
});

test("a generic 'Reporting Manager' column is read as IDs or names from its values", () => {
  const headers = ["Emp Code", "Employee Name", "Reporting Manager"];
  const byId: Cell[][] = [["E1", "Asha Rao", ""], ["E2", "Ravi Iyer", "E1"], ["E3", "Meera Das", "E1"]];
  assert.equal(pick(headers, byId).managerId, "Reporting Manager");
  const byName: Cell[][] = [["E1", "Asha Rao", ""], ["E2", "Ravi Iyer", "Asha Rao"], ["E3", "Meera Das", "asha  rao"]];
  const m = pick(headers, byName);
  assert.equal(m.managerName, "Reporting Manager");
  assert.equal(m.managerId, undefined);
  const withBrackets: Cell[][] = [["E1", "Asha Rao", ""], ["E2", "Ravi Iyer", "Asha Rao (E1)"]];
  assert.equal(pick(headers, withBrackets).managerId, "Reporting Manager");
});

test("without an ID column, a generic manager column holds names", () => {
  const m = pick(["Name", "Reports To", "Team"], [["Asha", "", "Ops"], ["Ravi", "Asha", "Ops"]]);
  assert.equal(m.managerName, "Reports To");
  assert.equal(m.dept, "Team");
});

test("look-alike columns don't steal a field", () => {
  const rows: Cell[][] = [["Mr", "E1", "Asha"], ["Ms", "E1", "Ravi"]];
  const m = pick(["Title", "Code", "Name"], rows);
  assert.equal(m.title, undefined, "a salutation column is not a job title");
  assert.equal(m.id, undefined, "a column of repeated values is not an employee ID");
  assert.equal(m.name, "Name");
});

test("an exactly named ID column with a few duplicates is still the ID column", () => {
  const rows: Cell[][] = [["A1", "Asha", ""], ["A2", "Ravi", "A1"], ["A2", "Ravi again", "A1"], ["A3", "Meera", "A2"]];
  const m = pick(["Emp ID", "Full Name", "Reporting Manager"], rows);
  assert.equal(m.id, "Emp ID");
  assert.equal(m.managerId, "Reporting Manager");
  assert.equal(pick(["Code", "Name"], [["X"], ["X"], ["Y"]]).id, undefined, "a generic header still needs unique values");
});

test("value helpers", () => {
  assert.deepEqual(embeddedId("Asha Rao (E102)"), ["E102"]);
  assert.deepEqual(embeddedId("E102 - Asha Rao"), ["E102"]);
  assert.equal(stripBrackets("Asha Rao (E102)"), "Asha Rao");
  assert.equal(managerColumnKind(["", ""], ["E1"], ["Asha"]), null);
  assert.equal(managerColumnKind(["E1", "Asha"], ["E1"], ["Asha"]), "id", "a tie goes to IDs");
});

test("finds the header row under a title line", () => {
  const rows: Cell[][] = [["Org structure as on 31 Oct 2026"], [], ["Emp ID", "Name", "Reports to", "Department"], ["E1", "Asha", "", "HR"]];
  assert.equal(findOrgHeaderRow(rows), 2);
  assert.equal(findOrgHeaderRow([["ID", "Name"], ["1", "Ravi"]]), 0);
});

test("reads people and skips blank lines", () => {
  const map: OcColumnMap = { id: 0, name: 1, managerId: 2, dept: 3 };
  const people = readPeople({ headers: ["a", "b", "c", "d"], rows: [["E1", " Asha  Rao ", "", "HR"], ["", "", "", ""], ["E2", "Ravi", "E1", 42]], firstRow: 2 }, map);
  assert.equal(people.length, 2);
  assert.deepEqual(people[0], { row: 2, id: "E1", name: "Asha Rao", title: "", dept: "HR", location: "", managerId: "", managerName: "" });
  assert.equal(people[1].row, 4, "row numbers match the spreadsheet");
  assert.equal(people[1].dept, "42");
});

test("explains what's missing from the column choice", () => {
  const h = ["ID", "Name", "Manager"];
  assert.match(mappingProblem({ id: 0 }, h), /name/);
  assert.match(mappingProblem({ name: 1 }, h), /reports to/);
  assert.match(mappingProblem({ name: 1, managerId: 2 }, h), /Employee ID column/);
  assert.match(mappingProblem({ id: 0, name: 1, managerId: 1 }, h), /chosen for both/);
  assert.equal(mappingProblem({ id: 0, name: 1, managerId: 2 }, h), "");
  assert.equal(mappingProblem({ name: 1, managerName: 2 }, h), "");
});

test("the template has the headers the detector expects", () => {
  const headers = templateCsv().trim().split(",").map((h) => h.replace(/^"|"$/g, ""));
  assert.deepEqual(Object.keys(detectOrgColumns(headers, [])).sort(), ["dept", "id", "location", "managerId", "name", "title"]);
});
