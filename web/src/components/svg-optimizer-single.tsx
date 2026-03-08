"use client"

import Image from "next/image"
import {
  ArrowRight,
  Copy,
  Download,
  FileUp,
  RotateCcw,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState, type DragEvent } from "react"

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  Separator,
} from "@/ui-kit"
import {
  buildOptimizedSvgFileName,
  createPastedSvgFile,
  createSvgPreviewUrl,
  formatBytes,
  formatSavedBytes,
  isEditableTarget,
} from "@/lib/svg/client"
import type { OptimizeSvgResult } from "@/lib/svg/types"

export function SvgOptimizerSingle() {
  const fileInputId = "svg-optimizer-file-input"
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<OptimizeSvgResult | null>(null)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)

  async function optimizeFile(file: File) {
    setIsPending(true)
    setError("")
    setCopied(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/svg/optimize", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось оптимизировать SVG.")
      }

      setResult(payload)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось оптимизировать SVG.")
      setResult(null)
    } finally {
      setIsPending(false)
    }
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".svg")) {
      setError("Нужен файл в формате SVG.")
      setSelectedFile(null)
      setResult(null)
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError("")
    setCopied(false)

    await optimizeFile(file)
  }, [])

  async function handleCopy() {
    if (!result) {
      return
    }

    await navigator.clipboard.writeText(result.optimizedSvg)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  function handleDownload() {
    if (!result || !selectedFile) {
      return
    }

    const blob = new Blob([result.optimizedSvg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = buildOptimizedSvgFileName(selectedFile.name)
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    setSelectedFile(null)
    setResult(null)
    setError("")
    setIsDragOver(false)
    setCopied(false)
  }

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText()

      if (!clipboardText.trim()) {
        setError("Буфер обмена пуст.")
        return
      }

      await handleFile(createPastedSvgFile(clipboardText))
    } catch {
      setError("Не удалось прочитать SVG из буфера обмена.")
    }
  }

  const handleWindowPaste = useCallback((event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      const clipboardText = event.clipboardData?.getData("text/plain") ?? ""

      if (!clipboardText.trim()) {
        return
      }

      event.preventDefault()
      void handleFile(createPastedSvgFile(clipboardText))
  }, [handleFile])

  useEffect(() => {
    window.addEventListener("paste", handleWindowPaste)

    return () => {
      window.removeEventListener("paste", handleWindowPaste)
    }
  }, [handleWindowPaste])

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

    const file = event.dataTransfer.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const savedBytes = result ? result.originalBytes - result.optimizedBytes : 0

  return (
    <div className="min-w-0 space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleFile(file)
              }
              event.currentTarget.value = ""
            }}
          />

          {!selectedFile ? (
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
              <span className="text-sm font-medium">Перетащи SVG сюда или выбери файл</span>
              <span className="text-muted-foreground mt-1 text-sm">Или вставь SVG из буфера обмена. До 5 MB.</span>
            </label>
          ) : (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-sm">
                  {formatBytes(selectedFile.size)}
                  {isPending ? " · Оптимизация..." : result ? " · Готово" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                  Загрузить новый
                </Button>
                <Button type="button" variant="outline" onClick={() => void handlePaste()} disabled={isPending}>
                  Вставить из буфера
                </Button>
                <Button type="button" variant="ghost" onClick={handleReset} disabled={isPending}>
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
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">До</p>
                  <p className="font-medium">{formatBytes(result.originalBytes)}</p>
                </div>
                <ArrowRight className="text-muted-foreground hidden size-4 xl:block" />
                <Separator orientation="vertical" className="hidden h-8 xl:block" />
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">После</p>
                  <p className="font-medium">{formatBytes(result.optimizedBytes)}</p>
                </div>
                <Separator orientation="vertical" className="hidden h-8 xl:block" />
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Экономия</p>
                  <p className="font-medium">
                    {formatSavedBytes(savedBytes)} <span className="text-muted-foreground">({result.savedPercent}%)</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleCopy}>
                  <Copy className="size-4" />
                  {copied ? "Скопировано" : "Копировать SVG"}
                </Button>
                <Button type="button" variant="outline" onClick={handleDownload}>
                  <Download className="size-4" />
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="min-w-0 space-y-4 p-4">
              <div className="grid gap-4 divide-y lg:grid-cols-2 lg:gap-0 lg:divide-y-0 lg:divide-x">
                <div className="space-y-3 pb-4 lg:pr-4 lg:pb-0">
                  <p className="text-sm font-medium">Оригинал</p>
                  <div className="bg-surface-soft/40 flex aspect-[16/10] items-center justify-center rounded-xl p-6">
                    <Image
                      src={createSvgPreviewUrl(result.originalSvg)}
                      alt="Оригинальный SVG preview"
                      width={520}
                      height={360}
                      unoptimized
                      className="h-auto max-h-full w-auto max-w-full"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-4 lg:pl-4 lg:pt-0">
                  <p className="text-sm font-medium">Оптимизированный</p>
                  <div className="bg-surface-soft/40 flex aspect-[16/10] items-center justify-center rounded-xl p-6">
                    <Image
                      src={createSvgPreviewUrl(result.optimizedSvg)}
                      alt="Оптимизированный SVG preview"
                      width={520}
                      height={360}
                      unoptimized
                      className="h-auto max-h-full w-auto max-w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
