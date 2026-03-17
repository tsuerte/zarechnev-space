import assert from "node:assert/strict"
import test from "node:test"

import type { AvatarListItem } from "../sanity/types"

import { createAvatarFileName } from "./file-name"

function createAvatarItem(overrides: Partial<AvatarListItem> = {}): AvatarListItem {
  return {
    _id: "avatar-1",
    alt: "Creative Portrait",
    gender: "male",
    sourceType: "freepik_ai",
    image: {
      asset: {
        url: "https://cdn.sanity.io/images/example/avatar-1.png",
      },
    },
    ...overrides,
  }
}

test("createAvatarFileName includes readable metadata and a stable suffix", () => {
  const fileName = createAvatarFileName(createAvatarItem(), "png")

  assert.match(fileName, /^creative-portrait-male-freepik-ai-[a-z0-9]+\.png$/)
})

test("createAvatarFileName falls back to a safe base for non-latin alt text", () => {
  const fileName = createAvatarFileName(
    createAvatarItem({
      _id: "avatar-2",
      alt: "Сам",
      gender: "female",
      sourceType: "unsplash",
    }),
    "webp"
  )

  assert.match(fileName, /^avatar-female-unsplash-[a-z0-9]+\.webp$/)
})

test("createAvatarFileName stays unique for same human-readable fields", () => {
  const firstFileName = createAvatarFileName(createAvatarItem({ _id: "avatar-1" }), "png")
  const secondFileName = createAvatarFileName(createAvatarItem({ _id: "avatar-2" }), "png")

  assert.notEqual(firstFileName, secondFileName)
})
