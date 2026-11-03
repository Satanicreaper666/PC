/**
 * Components available inside every .mdx chapter and toolkit page
 * without importing them. See docs/CONTENT-GUIDE.md for usage.
 */
import Callout from "./Callout.astro";
import Figure from "./Figure.astro";
import Steps from "./Steps.astro";
import InShort from "./InShort.astro";
import TableWrap from "./TableWrap.astro";
import Fact from "./Fact.astro";
import Snapshot from "./Snapshot.astro";
import Timeline from "../diagrams/Timeline.astro";
import Flow from "../diagrams/Flow.astro";
import Breakdown from "../diagrams/Breakdown.astro";
import Formula from "../diagrams/Formula.astro";
import DecisionTree from "../diagrams/DecisionTree.astro";
import Matrix from "../diagrams/Matrix.astro";
import Cycle from "../diagrams/Cycle.astro";
import KeyNumbers from "../diagrams/KeyNumbers.astro";
import Compare from "../diagrams/Compare.astro";

export const mdxComponents = {
  Callout,
  Figure,
  Steps,
  InShort,
  Timeline,
  Flow,
  Breakdown,
  Formula,
  DecisionTree,
  Matrix,
  Cycle,
  KeyNumbers,
  Compare,
  Fact,
  Snapshot,
  table: TableWrap
};
