import test from "node:test"
import assert from "node:assert/strict"

import {
  createCustomizedIconPreviewSvg,
  extractIconPreviewColor,
} from "../src/lib/icons/preview"

test("extractIconPreviewColor returns the first non-none presentation color", () => {
  assert.equal(
    extractIconPreviewColor(
      '<svg fill="none"><path stroke="#121212" d="M0 0h24v24"/></svg>'
    ),
    "#121212"
  )

  assert.equal(
    extractIconPreviewColor(
      '<svg><path fill="#ff5500" d="M0 0h24v24"/></svg>'
    ),
    "#ff5500"
  )
})

test("createCustomizedIconPreviewSvg updates stroke, fill, and stroke-width without touching none values", () => {
  const svg = [
    '<svg fill="none" viewBox="0 0 24 24">',
    '<path stroke="#121212" stroke-width="1.5" d="M1 1h22"/>',
    '<path fill="#121212" d="M2 2h20v20H2z"/>',
    '<path stroke="none" fill="none" d="M0 0h24v24"/>',
    "</svg>",
  ].join("")

  const customized = createCustomizedIconPreviewSvg(svg, {
    color: "#ff5500",
    strokeWidth: 2.5,
  })

  assert.match(customized, /stroke="#ff5500"/)
  assert.match(customized, /fill="#ff5500"/)
  assert.match(customized, /stroke-width="2.5"/)
  assert.match(customized, /stroke="none"/)
  assert.match(customized, /fill="none"/)
})
