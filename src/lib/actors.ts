/**
 * Distinguishing a person's name from a system's name-and-version — e.g. `PolicyGate.
 * evaluatedBy`, `PolicyGate.waiver.by` and `Decision.by`, per docs/spec-review-screen.md's
 * Content rules, "Who did what": "a person by name, or a system by name and version."
 *
 * There is no field in the data model saying which one a given string is — adding one is out
 * of scope for this task (no new data-model fields). This is a heuristic over the string
 * itself, not a real distinction: every system name in this app's fixtures ends in a version
 * tag ("policy-engine v2.3", "license-scanner v1.4"); no person's name does. Verified against
 * every actual `evaluatedBy`/`waiver.by`/`decision.by` value across all three fixtures (see
 * actors.test.ts) — correct on all of them, but a future system name that doesn't end in a
 * version tag, or a person whose name coincidentally does, would be misclassified. See
 * docs/DECISIONS.md for the trade-off.
 */
const VERSION_SUFFIX = /\sv\d+(\.\d+)*$/i

export function isSystemActor(name: string): boolean {
  return VERSION_SUFFIX.test(name.trim())
}
