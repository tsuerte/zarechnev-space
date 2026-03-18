import test from "node:test"
import assert from "node:assert/strict"

import {
  buildOptimizedSvgFileName,
  buildUniqueOptimizedSvgFileNames,
} from "../src/lib/svg/client"

test("buildOptimizedSvgFileName appends the optimized suffix", () => {
  assert.equal(buildOptimizedSvgFileName("icon.svg"), "icon.optimized.svg")
  assert.equal(buildOptimizedSvgFileName("icon"), "icon.optimized.svg")
})

test("buildUniqueOptimizedSvgFileNames disambiguates duplicate names deterministically", () => {
  assert.deepEqual(
    buildUniqueOptimizedSvgFileNames([
      "logo.svg",
      "logo.svg",
      "logo.svg",
      "badge.svg",
      "badge.svg",
    ]),
    [
      "logo.optimized.svg",
      "logo.optimized-2.svg",
      "logo.optimized-3.svg",
      "badge.optimized.svg",
      "badge.optimized-2.svg",
    ]
  )
})
