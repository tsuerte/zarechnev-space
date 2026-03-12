import test from "node:test"
import assert from "node:assert/strict"

import { runCanonicalSvgPipeline } from "../src/lib/svg/pipeline"

test("runCanonicalSvgPipeline removes figma ids and flattens a safe root group", () => {
  const input = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <g id="Icons / Queue / Params" stroke="#121212" stroke-width="1.5" data-node-id="156:1986">
        <path id="Vector" stroke-linecap="round" stroke-linejoin="round" d="M12 7h8" data-node-id="156:1987" />
        <circle id="Ellipse 65" cx="9" cy="7" r="2.5" data-node-id="156:1991" />
      </g>
    </svg>
  `

  const output = runCanonicalSvgPipeline(input)

  assert.match(output, /viewBox="0 0 24 24"/)
  assert.doesNotMatch(output, /\sid="/)
  assert.doesNotMatch(output, /data-node-id=/)
  assert.doesNotMatch(output, /<g[\s>]/)
  assert.match(output, /<path[^>]*stroke="#121212"[^>]*stroke-width="1\.5"/)
  assert.match(output, /<circle[^>]*stroke="#121212"[^>]*stroke-width="1\.5"/)
})
