import { optimize, type Config, type CustomPlugin, type XastElement } from "svgo"

const FLATTENABLE_GROUP_ATTRS = new Set([
  "clip-rule",
  "fill",
  "fill-opacity",
  "fill-rule",
  "opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
])

function isElement(node: XastElement["children"][number]): node is XastElement {
  return node.type === "element"
}

function getSingleChildElement(node: XastElement) {
  if (node.children.length !== 1) {
    return null
  }

  const [child] = node.children

  return isElement(child) ? child : null
}

function canFlattenRootGroup(group: XastElement) {
  if (group.name !== "g" || group.children.length === 0) {
    return false
  }

  const attrNames = Object.keys(group.attributes)

  return (
    attrNames.length > 0 &&
    attrNames.every((name) => FLATTENABLE_GROUP_ATTRS.has(name)) &&
    group.children.every(isElement)
  )
}

function parseNumber(value: string | undefined) {
  if (value == null) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function areNumbersEqual(left: number, right: number) {
  return Math.abs(left - right) < 0.0001
}

function parseViewBox(svg: XastElement) {
  const rawViewBox = svg.attributes.viewBox

  if (!rawViewBox) {
    return null
  }

  const parts = rawViewBox
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number(part))

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null
  }

  const [minX, minY, width, height] = parts

  return { minX, minY, width, height }
}

function hasOnlyElementChild(node: XastElement) {
  const children = node.children.filter(isElement)

  return children.length === 1 ? children[0] : null
}

function isViewBoxRectElement(node: XastElement, viewBox: NonNullable<ReturnType<typeof parseViewBox>>) {
  if (node.name !== "rect") {
    return false
  }

  if (node.attributes.transform != null || node.attributes.rx != null || node.attributes.ry != null) {
    return false
  }

  const x = parseNumber(node.attributes.x) ?? 0
  const y = parseNumber(node.attributes.y) ?? 0
  const width = parseNumber(node.attributes.width)
  const height = parseNumber(node.attributes.height)

  return (
    width !== null &&
    height !== null &&
    areNumbersEqual(x, viewBox.minX) &&
    areNumbersEqual(y, viewBox.minY) &&
    areNumbersEqual(width, viewBox.width) &&
    areNumbersEqual(height, viewBox.height)
  )
}

function isViewBoxPathElement(node: XastElement, viewBox: NonNullable<ReturnType<typeof parseViewBox>>) {
  if (node.name !== "path" || node.attributes.transform != null) {
    return false
  }

  const normalizedPath = node.attributes.d?.replace(/\s+/g, " ").trim()

  if (!normalizedPath) {
    return false
  }

  const lowerCaseMatch = normalizedPath.match(
    /^M(-?\d*\.?\d+) (-?\d*\.?\d+)h(-?\d*\.?\d+)v(-?\d*\.?\d+)H(-?\d*\.?\d+)z$/i
  )

  if (!lowerCaseMatch) {
    return false
  }

  const [, startX, startY, width, height, endX] = lowerCaseMatch.map(Number)

  return (
    areNumbersEqual(startX, viewBox.minX) &&
    areNumbersEqual(startY, viewBox.minY) &&
    areNumbersEqual(width, viewBox.width) &&
    areNumbersEqual(height, viewBox.height) &&
    areNumbersEqual(endX, viewBox.minX)
  )
}

function findTrivialClipPathIds(svg: XastElement) {
  const viewBox = parseViewBox(svg)

  if (!viewBox) {
    return new Set<string>()
  }

  const trivialClipPathIds = new Set<string>()

  for (const child of svg.children) {
    if (!isElement(child) || child.name !== "defs") {
      continue
    }

    for (const defsChild of child.children) {
      if (!isElement(defsChild) || defsChild.name !== "clipPath") {
        continue
      }

      const clipPathId = defsChild.attributes.id
      const clipPathShape = hasOnlyElementChild(defsChild)

      if (!clipPathId || !clipPathShape) {
        continue
      }

      if (
        isViewBoxRectElement(clipPathShape, viewBox) ||
        isViewBoxPathElement(clipPathShape, viewBox)
      ) {
        trivialClipPathIds.add(clipPathId)
      }
    }
  }

  return trivialClipPathIds
}

function removeClipPathReferences(node: XastElement, trivialClipPathIds: Set<string>) {
  const clipPathReference = node.attributes["clip-path"]

  if (clipPathReference) {
    const clipPathMatch = clipPathReference.match(/^url\(#(.+)\)$/)

    if (clipPathMatch && trivialClipPathIds.has(clipPathMatch[1])) {
      delete node.attributes["clip-path"]
    }
  }

  for (const child of node.children) {
    if (isElement(child)) {
      removeClipPathReferences(child, trivialClipPathIds)
    }
  }
}

function removeTrivialClipPaths(svg: XastElement) {
  const trivialClipPathIds = findTrivialClipPathIds(svg)

  if (trivialClipPathIds.size === 0) {
    return
  }

  removeClipPathReferences(svg, trivialClipPathIds)

  svg.children = svg.children.filter((child) => {
    if (!isElement(child) || child.name !== "defs") {
      return true
    }

    child.children = child.children.filter((defsChild) => {
      return !(
        isElement(defsChild) &&
        defsChild.name === "clipPath" &&
        defsChild.attributes.id &&
        trivialClipPathIds.has(defsChild.attributes.id)
      )
    })

    return child.children.some(isElement)
  })
}

function flattenRootGroup(svg: XastElement) {
  let group = getSingleChildElement(svg)

  while (group && canFlattenRootGroup(group)) {
    const elementChildren = group.children.filter(isElement)

    for (const child of elementChildren) {
      for (const [name, value] of Object.entries(group.attributes)) {
        if (child.attributes[name] == null) {
          child.attributes[name] = value
        }
      }
    }

    svg.children = elementChildren
    group = getSingleChildElement(svg)
  }
}

const flattenRootGroupPlugin: CustomPlugin = {
  name: "flattenRootGroup",
  fn: () => ({
    element: {
      exit: (node) => {
        if (node.name === "svg") {
          flattenRootGroup(node)
        }
      },
    },
  }),
}

const removeTrivialClipPathsPlugin: CustomPlugin = {
  name: "removeTrivialClipPaths",
  fn: () => ({
    element: {
      exit: (node) => {
        if (node.name === "svg") {
          removeTrivialClipPaths(node)
        }
      },
    },
  }),
}

const CANONICAL_SVG_PLUGINS = [
  {
    name: "preset-default",
    params: {
      overrides: {
        cleanupIds: true,
      },
    },
  },
  {
    name: "removeAttrs",
    params: {
      attrs: ["*:data-node-id"],
    },
  },
  removeTrivialClipPathsPlugin,
  flattenRootGroupPlugin,
  "removeDimensions",
]

export function runCanonicalSvgPipeline(svg: string) {
  const config: Config = {
    multipass: true,
    js2svg: {
      indent: 2,
      pretty: false,
    },
    plugins: CANONICAL_SVG_PLUGINS as Config["plugins"],
  }

  return optimize(svg, config).data
}
