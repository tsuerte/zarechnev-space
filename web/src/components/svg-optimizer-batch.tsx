"use client"

import JSZip from "jszip"
import Image from "next/image"
import { Fragment, useRef, useState, type DragEvent } from "react"
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui-kit"
import { Copy, Download, Eye, FileUp, RotateCcw } from "lucide-react"

import {
  buildOptimizedSvgFileName,
  createSvgPreviewUrl,
  formatBytes,
  formatSavedBytes,
} from "@/lib/svg/client"
import type {
  OptimizeSvgBatchItemResult,
  OptimizeSvgBatchResult,
} from "@/lib/svg/types"
import {
  MAX_SVG_BATCH_FILES,
  MAX_SVG_BATCH_TOTAL_SIZE,
} from "@/lib/svg/upload"
import { cn } from "@/lib/utils"

function downloadSvg(svg: string, fileName: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function SvgOptimizerBatch() {
  const fileInputId = "svg-optimizer-batch-file-input"
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [result, setResult] = useState<OptimizeSvgBatchResult | null>(null)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [expandedPreviewKey, setExpandedPreviewKey] = useState<string | null>(null)
  const [originalPreviewMap, setOriginalPreviewMap] = useState<Record<string, string>>({})
  const [previewErrorMap, setPreviewErrorMap] = useState<Record<string, string>>({})
  const [previewLoadingKey, setPreviewLoadingKey] = useState<string | null>(null)

  async function optimizeFiles(files: File[]) {
    setIsPending(true)
    setError("")

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/svg/optimize-batch", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось обработать SVG.")
      }

      setResult(payload)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не удалось обработать SVG."
      )
      setResult(null)
    } finally {
      setIsPending(false)
    }
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) {
      return
    }

    if (files.length > MAX_SVG_BATCH_FILES) {
      setError(`Можно загрузить не больше ${MAX_SVG_BATCH_FILES} SVG за раз.`)
      setSelectedFiles([])
      setResult(null)
      return
    }

    const totalUploadBytes = files.reduce((sum, file) => sum + file.size, 0)
    if (totalUploadBytes > MAX_SVG_BATCH_TOTAL_SIZE) {
      setError("Общий размер набора слишком большой. Лимит: 20 MB.")
      setSelectedFiles([])
      setResult(null)
      return
    }

    setSelectedFiles(files)
    setResult(null)
    setError("")
    setExpandedPreviewKey(null)
    setOriginalPreviewMap({})
    setPreviewErrorMap({})

    await optimizeFiles(files)
  }

  function handleReset() {
    setSelectedFiles([])
    setResult(null)
    setError("")
    setIsDragOver(false)
    setExpandedPreviewKey(null)
    setOriginalPreviewMap({})
    setPreviewErrorMap({})
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragOver(false)
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragOver(false)

    const files = Array.from(event.dataTransfer.files ?? [])
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  function handleDownloadItem(item: OptimizeSvgBatchItemResult) {
    if (!item.optimizedSvg) {
      return
    }

    downloadSvg(item.optimizedSvg, buildOptimizedSvgFileName(item.fileName))
  }

  async function handleCopyItem(item: OptimizeSvgBatchItemResult) {
    if (!item.optimizedSvg) {
      return
    }

    await navigator.clipboard.writeText(item.optimizedSvg)
  }

  async function handleDownloadZip() {
    if (!result) {
      return
    }

    const successfulItems = result.items.filter(
      (item) => item.error === null && item.optimizedSvg
    )

    if (successfulItems.length === 0) {
      return
    }

    const zip = new JSZip()

    successfulItems.forEach((item) => {
      zip.file(
        buildOptimizedSvgFileName(item.fileName),
        item.optimizedSvg as string
      )
    })

    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "svg-batch-optimized.zip"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleTogglePreview(
    item: OptimizeSvgBatchItemResult,
    index: number
  ) {
    const rowKey = `${item.fileName}-${index}`

    if (expandedPreviewKey === rowKey) {
      setExpandedPreviewKey(null)
      return
    }

    setExpandedPreviewKey(rowKey)

    if (item.error || originalPreviewMap[rowKey]) {
      return
    }

    const sourceFile = selectedFiles[index]
    if (!sourceFile) {
      setPreviewErrorMap((current) => ({
        ...current,
        [rowKey]: "Не удалось найти исходный SVG для превью.",
      }))
      return
    }

    try {
      setPreviewLoadingKey(rowKey)
      const originalSvg = await sourceFile.text()
      setOriginalPreviewMap((current) => ({
        ...current,
        [rowKey]: originalSvg,
      }))
      setPreviewErrorMap((current) => {
        const next = { ...current }
        delete next[rowKey]
        return next
      })
    } catch {
      setPreviewErrorMap((current) => ({
        ...current,
        [rowKey]: "Не удалось прочитать исходный SVG.",
      }))
    } finally {
      setPreviewLoadingKey((current) => (current === rowKey ? null : current))
    }
  }

  const selectedFilesBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0)
  const savedBytes = result ? result.originalBytes - result.optimizedBytes : 0

  return (
    <div className="min-w-0 space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            multiple
            accept=".svg,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              if (files.length > 0) {
                void handleFiles(files)
              }
              event.currentTarget.value = ""
            }}
          />

          {selectedFiles.length === 0 ? (
            <label
              htmlFor={fileInputId}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors ${
                isDragOver
                  ? "border-foreground/20 bg-surface-soft"
                  : "border-border bg-surface-soft/50 hover:bg-surface-soft"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(event) => {
                void handleDrop(event)
              }}
            >
              <FileUp className="mb-3 size-5" />
              <span className="text-sm font-medium">
                Перетащи SVG сюда или выбери файлы
              </span>
              <span className="text-muted-foreground mt-1 text-sm">
                До 10 файлов за раз. До 5 MB на файл и 20 MB на набор.
              </span>
            </label>
          ) : (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">
                  {selectedFiles.length} файлов в наборе
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatBytes(selectedFilesBytes)}
                  {isPending ? " · Обработка..." : result ? " · Готово" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  Загрузить новый набор
                </Button>
                {result ? (
                  <Button
                    type="button"
                    onClick={() => void handleDownloadZip()}
                    disabled={isPending || result.successCount === 0}
                  >
                    <Download className="size-4" />
                    Скачать ZIP
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  <RotateCcw className="size-4" />
                  Сбросить
                </Button>
              </div>
            </div>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <>
          <Card>
            <CardContent className="flex min-w-0 flex-col gap-3 overflow-hidden p-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <Badge variant="outline">{result.totalCount} файлов</Badge>
                <Badge variant="outline">{result.successCount} успешно</Badge>
                {result.failedCount > 0 ? (
                  <Badge variant="outline">{result.failedCount} с ошибкой</Badge>
                ) : null}
                <Separator orientation="vertical" className="hidden h-8 xl:block" />
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    До
                  </p>
                  <p className="font-medium">{formatBytes(result.originalBytes)}</p>
                </div>
                <Separator orientation="vertical" className="hidden h-8 xl:block" />
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    После
                  </p>
                  <p className="font-medium">{formatBytes(result.optimizedBytes)}</p>
                </div>
                <Separator orientation="vertical" className="hidden h-8 xl:block" />
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Экономия
                  </p>
                  <p className="font-medium">
                    {formatSavedBytes(savedBytes)}{" "}
                    <span className="text-muted-foreground">
                      ({result.savedPercent}%)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Файл</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>До</TableHead>
                    <TableHead>После</TableHead>
                    <TableHead>Экономия</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((item, index) => {
                      const rowKey = `${item.fileName}-${index}`
                      const isExpanded = expandedPreviewKey === rowKey
                      const originalPreview = originalPreviewMap[rowKey]
                      const previewError = previewErrorMap[rowKey]

                      return (
                        <Fragment key={rowKey}>
                          <TableRow
                            className={cn(
                              item.error && "bg-destructive/5 hover:bg-destructive/10"
                            )}
                          >
                            <TableCell className="max-w-[320px]">
                              <div className="truncate font-normal">{item.fileName}</div>
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {item.error ? (
                                <div className="space-y-1">
                                  <Badge variant="destructive">Ошибка</Badge>
                                  <p className="text-destructive text-sm">{item.error}</p>
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground border-border"
                                >
                                  Готово
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.error ? "—" : formatBytes(item.originalBytes)}
                            </TableCell>
                            <TableCell>
                              {item.error ? "—" : formatBytes(item.optimizedBytes)}
                            </TableCell>
                            <TableCell>
                              {item.error
                                ? "—"
                                : `${formatSavedBytes(
                                    item.originalBytes - item.optimizedBytes
                                  )} (${item.savedPercent}%)`}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.optimizedSvg ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => void handleTogglePreview(item, index)}
                                    aria-expanded={isExpanded}
                                    aria-label="Сравнить SVG"
                                    title="Сравнить SVG"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => void handleCopyItem(item)}
                                    aria-label="Копировать SVG"
                                    title="Копировать SVG"
                                  >
                                    <Copy className="size-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDownloadItem(item)}
                                    aria-label="Скачать SVG"
                                    title="Скачать SVG"
                                  >
                                    <Download className="size-4" />
                                  </Button>
                                </div>
                              ) : null}
                            </TableCell>
                          </TableRow>
                          {isExpanded ? (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={6} className="p-0">
                                <div className="bg-surface-soft/30 p-4">
                                  {previewError ? (
                                    <Alert variant="destructive">
                                      <AlertDescription>{previewError}</AlertDescription>
                                    </Alert>
                                  ) : previewLoadingKey === rowKey || !originalPreview ? (
                                    <div className="text-muted-foreground text-sm">
                                      Готовим превью...
                                    </div>
                                  ) : (
                                    <div className="grid gap-4 divide-y lg:grid-cols-2 lg:gap-0 lg:divide-y-0 lg:divide-x">
                                      <div className="space-y-3 pb-4 lg:pr-4 lg:pb-0">
                                        <p className="text-sm font-medium">Оригинал</p>
                                        <div className="bg-background flex aspect-[16/10] items-center justify-center rounded-xl p-6">
                                          <Image
                                            src={createSvgPreviewUrl(originalPreview)}
                                            alt={`Оригинал ${item.fileName}`}
                                            width={520}
                                            height={360}
                                            unoptimized
                                            className="h-auto max-h-full w-auto max-w-full"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-3 pt-4 lg:pl-4 lg:pt-0">
                                        <p className="text-sm font-medium">Оптимизированный</p>
                                        <div className="bg-background flex aspect-[16/10] items-center justify-center rounded-xl p-6">
                                          <Image
                                            src={createSvgPreviewUrl(item.optimizedSvg ?? "")}
                                            alt={`Оптимизированный ${item.fileName}`}
                                            width={520}
                                            height={360}
                                            unoptimized
                                            className="h-auto max-h-full w-auto max-w-full"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </Fragment>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
