const FIGMA_API_BASE = "https://api.figma.com/v1"

function getFigmaAccessToken() {
  const token = process.env.FIGMA_ACCESS_TOKEN?.trim()

  if (!token) {
    throw new Error("Не задан FIGMA_ACCESS_TOKEN.")
  }

  return token
}

async function figmaFetchJson<T>(path: string) {
  const response = await fetch(`${FIGMA_API_BASE}${path}`, {
    headers: {
      "X-Figma-Token": getFigmaAccessToken(),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || "Не удалось получить данные из Figma.")
  }

  return (await response.json()) as T
}

export type FigmaImageResponse = {
  err?: string
  images?: Record<string, string | null>
}

export type FigmaNode = {
  id: string
  name: string
  type: string
  visible?: boolean
  children?: FigmaNode[]
  componentPropertyDefinitions?: Record<
    string,
    {
      type?: string
      defaultValue?: string
      variantOptions?: string[]
    }
  > | null
}

export type FigmaNodeResponse = {
  nodes?: Record<
    string,
    {
      document?: FigmaNode
    }
  >
}

export async function getFigmaImageExportUrls(fileKey: string, nodeIds: string[]) {
  if (nodeIds.length === 0) {
    return new Map<string, string>()
  }

  const params = new URLSearchParams({
    ids: nodeIds.join(","),
    format: "svg",
    svg_include_id: "true",
    svg_include_node_id: "true",
    svg_simplify_stroke: "true",
  })

  const payload = await figmaFetchJson<FigmaImageResponse>(`/images/${fileKey}?${params}`)

  if (payload.err) {
    throw new Error(payload.err)
  }

  return new Map(
    Object.entries(payload.images ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0
    )
  )
}

export async function getFigmaNodes(fileKey: string, nodeIds: string[], depth = 1) {
  if (nodeIds.length === 0) {
    return new Map<string, FigmaNode>()
  }

  const params = new URLSearchParams({
    ids: nodeIds.join(","),
    depth: String(depth),
  })

  const payload = await figmaFetchJson<FigmaNodeResponse>(`/files/${fileKey}/nodes?${params}`)
  const entries = Object.entries(payload.nodes ?? {})
    .map(([nodeId, node]) => {
      if (!node.document) {
        return null
      }

      return [nodeId, node.document] as const
    })
    .filter((entry): entry is readonly [string, FigmaNode] => entry !== null)

  return new Map(entries)
}

export async function downloadFigmaSvg(svgUrl: string) {
  const response = await fetch(svgUrl, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Не удалось скачать SVG из Figma.")
  }

  return response.text()
}
