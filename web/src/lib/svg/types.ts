export type OptimizeSvgResult = {
  originalSvg: string
  optimizedSvg: string
  originalBytes: number
  optimizedBytes: number
  savedPercent: number
}

export type OptimizeSvgBatchItemResult = {
  fileName: string
  optimizedSvg: string | null
  originalBytes: number
  optimizedBytes: number
  savedPercent: number
  error: string | null
}

export type OptimizeSvgBatchResult = {
  items: OptimizeSvgBatchItemResult[]
  totalCount: number
  successCount: number
  failedCount: number
  originalBytes: number
  optimizedBytes: number
  savedPercent: number
}
