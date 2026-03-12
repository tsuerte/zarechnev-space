import test from "node:test"
import assert from "node:assert/strict"

import {
  createVariantKey,
  createVariantLabel,
  parseVariantPropsFromName,
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
