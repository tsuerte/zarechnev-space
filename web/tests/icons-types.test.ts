import test from "node:test"
import assert from "node:assert/strict"

import {
  createPublicIconFileName,
  createVariantKey,
  createVariantLabel,
  parseVariantPropsFromName,
  sortFamilies,
  sortVariants,
  splitIconFullName,
} from "../src/lib/icons/types"

test("splitIconFullName extracts group and display name from slash-separated names", () => {
  assert.deepEqual(splitIconFullName("Source / Loginet"), {
    group: "Source",
    displayName: "Loginet",
  })

  assert.deepEqual(splitIconFullName("Chevron-Up"), {
    group: null,
    displayName: "Chevron-Up",
  })
})

test("variant helpers normalize props, keys, labels, and size sorting", () => {
  const props = parseVariantPropsFromName("State=Active, Size=24")

  assert.deepEqual(props, {
    state: "Active",
    size: "24",
  })
  assert.equal(createVariantKey(props), "size=24, state=Active")
  assert.equal(createVariantLabel(props), "size=24 / state=Active")

  const sorted = sortVariants([
    { label: "Default", props: {}, variantKey: "default" },
    { label: "32", props: { size: "32" }, variantKey: "size=32" },
    { label: "16", props: { size: "16" }, variantKey: "size=16" },
    { label: "24", props: { size: "24" }, variantKey: "size=24" },
  ])

  assert.deepEqual(
    sorted.map((variant) => variant.variantKey),
    ["size=16", "size=24", "size=32", "default"]
  )
})

test("createPublicIconFileName sanitizes public download names", () => {
  assert.equal(
    createPublicIconFileName("Queue / Params", "Default"),
    "Queue-Params-Default.svg"
  )

  assert.equal(
    createPublicIconFileName("Search  Large", "size=24 / state=Active"),
    "Search-Large-size=24-state=Active.svg"
  )

  assert.equal(
    createPublicIconFileName("///", "***"),
    "icon-icon.svg"
  )
})

test("sortFamilies keeps grouped icons ordered before ungrouped ones", () => {
  const sorted = sortFamilies([
    { group: null, displayName: "Zeta", fullName: "Zeta" },
    { group: "Actions", displayName: "Play", fullName: "Actions / Play" },
    { group: "Actions", displayName: "Pause", fullName: "Actions / Pause" },
    { group: "Brands", displayName: "Logo", fullName: "Brands / Logo" },
  ])

  assert.deepEqual(
    sorted.map((family) => family.fullName),
    ["Actions / Pause", "Actions / Play", "Brands / Logo", "Zeta"]
  )
})
