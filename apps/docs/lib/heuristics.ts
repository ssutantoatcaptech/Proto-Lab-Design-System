// Jakob Nielsen's 10 usability heuristics (Nielsen Norman Group, 1994; updated 2020).
// Names follow NN/g; summaries are paraphrased for Proto-Lab.
export const heuristics = [
  { id: 1, slug: "visibility-of-system-status", name: "Visibility of system status", short: "Status" },
  { id: 2, slug: "match-between-system-and-the-real-world", name: "Match between system and the real world", short: "Real world" },
  { id: 3, slug: "user-control-and-freedom", name: "User control and freedom", short: "Control" },
  { id: 4, slug: "consistency-and-standards", name: "Consistency and standards", short: "Consistency" },
  { id: 5, slug: "error-prevention", name: "Error prevention", short: "Prevention" },
  { id: 6, slug: "recognition-rather-than-recall", name: "Recognition rather than recall", short: "Recognition" },
  { id: 7, slug: "flexibility-and-efficiency-of-use", name: "Flexibility and efficiency of use", short: "Efficiency" },
  { id: 8, slug: "aesthetic-and-minimalist-design", name: "Aesthetic and minimalist design", short: "Minimalism" },
  { id: 9, slug: "help-users-recognize-diagnose-and-recover-from-errors", name: "Help users recognize, diagnose, and recover from errors", short: "Recovery" },
  { id: 10, slug: "help-and-documentation", name: "Help and documentation", short: "Help" },
] as const

export const heuristicUrl = (id: number) =>
  `/docs/foundations/heuristics#${heuristics[id - 1].slug}`
