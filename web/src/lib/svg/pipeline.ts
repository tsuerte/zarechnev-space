import { optimize, type PluginConfig } from "svgo"

const CANONICAL_SVG_PLUGINS: PluginConfig[] = [
  {
    name: "preset-default",
    params: {
      overrides: {
        cleanupIds: false,
      },
    },
  },
  "removeDimensions",
]

export function runCanonicalSvgPipeline(svg: string) {
  return optimize(svg, {
    multipass: true,
    js2svg: {
      indent: 2,
      pretty: false,
    },
    plugins: CANONICAL_SVG_PLUGINS,
  }).data
}
