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
