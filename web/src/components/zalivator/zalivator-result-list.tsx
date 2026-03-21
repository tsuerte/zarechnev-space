"use client"

import { useEffect, useRef, useState } from "react"

import { Check, Copy, Inbox } from "lucide-react"

import {
  Button,
  Field,
  FieldLabel,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
  Spinner,
  Switch,
} from "@/ui-kit"
import type { ZalivatorGenerateResponse } from "@/lib/zalivator/types"
import { ZalivatorQuantityControl } from "@/components/zalivator/zalivator-quantity-control"

type ZalivatorResultListProps = {
  result: ZalivatorGenerateResponse | null
  isPending: boolean
  error: string | null
  quantity: number
  onQuantityChange: (value: number, mode?: "immediate" | "debounced") => void
  unique: boolean
  supportsUnique: boolean
  onUniqueChange: (value: boolean) => void
}

export function ZalivatorResultList({
  result,
  isPending,
  error,
  quantity,
  onQuantityChange,
  unique,
  supportsUnique,
  onUniqueChange,
}: ZalivatorResultListProps) {
  const [isAllCopied, setIsAllCopied] = useState(false)
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null)
  const copiedAllTimeoutRef = useRef<number | null>(null)
  const copiedTimeoutRef = useRef<number | null>(null)
  const values = result?.values ?? []
  const hasValues = values.length > 0
  const statusMessage = error
    ? error
    : isPending
      ? "Обновляю набор..."
      : null

  useEffect(() => {
    return () => {
      if (copiedAllTimeoutRef.current !== null) {
        window.clearTimeout(copiedAllTimeoutRef.current)
      }
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current)
      }
    }
  }, [])

  const markCopied = (rowId: string) => {
    setCopiedRowId(rowId)

    if (copiedTimeoutRef.current !== null) {
      window.clearTimeout(copiedTimeoutRef.current)
    }

    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopiedRowId(null)
      copiedTimeoutRef.current = null
    }, 1400)
  }

  const copyAll = async () => {
    if (!hasValues) {
      return
    }

    await navigator.clipboard.writeText(values.join("\n"))
    setIsAllCopied(true)

    if (copiedAllTimeoutRef.current !== null) {
      window.clearTimeout(copiedAllTimeoutRef.current)
    }

    copiedAllTimeoutRef.current = window.setTimeout(() => {
      setIsAllCopied(false)
      copiedAllTimeoutRef.current = null
    }, 1400)
  }

  const copyValue = async (value: string, rowId: string) => {
    await navigator.clipboard.writeText(value)
    markCopied(rowId)
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-5">
          <Button onClick={copyAll} disabled={!hasValues}>
            {isAllCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {isAllCopied ? "Скопировано" : "Копировать"}
          </Button>
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <p className="text-sm font-medium">Количество</p>
            <ZalivatorQuantityControl value={quantity} onChange={onQuantityChange} />
          </div>
          {supportsUnique ? (
            <Field orientation="horizontal" className="w-auto gap-2">
              <Switch
                id="zalivator-result-unique"
                size="sm"
                checked={unique}
                onCheckedChange={(checked) => onUniqueChange(checked === true)}
              />
              <FieldLabel htmlFor="zalivator-result-unique">
                Только уникальные
              </FieldLabel>
            </Field>
          ) : null}
        </div>
        {statusMessage ? (
          <div className="mt-3 flex items-center gap-2">
            {!error ? (
              <Spinner className="size-3.5 text-muted-foreground" />
            ) : null}
            <p
              className={
                error
                  ? "text-sm leading-5 text-destructive"
                  : "text-sm leading-5 text-muted-foreground"
              }
            >
              {statusMessage}
            </p>
          </div>
        ) : null}
      </header>
      {hasValues ? (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <ItemGroup className="gap-2">
            {values.map((value, index) => {
              const rowId = `${value}-${index}`
              const isCopied = copiedRowId === rowId

              return (
                <Item
                  key={rowId}
                  asChild
                  variant={isCopied ? "muted" : "outline"}
                  size="sm"
                  className="cursor-pointer text-left"
                >
                  <button
                    type="button"
                    onClick={() => {
                      void copyValue(value, rowId)
                    }}
                    aria-label={`Скопировать значение ${value}`}
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 select-none text-sm text-muted-foreground"
                    >
                      {index + 1}
                    </span>
                    <ItemContent>
                      <ItemTitle className="w-full">{value}</ItemTitle>
                    </ItemContent>
                    <ItemActions className="ml-auto text-muted-foreground">
                      {isCopied ? (
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Check className="size-4" />
                          Скопировано
                        </span>
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </ItemActions>
                  </button>
                </Item>
              )
            })}
          </ItemGroup>
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 p-4 text-center lg:min-h-0">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </span>
          {error ? (
            <p className="text-sm leading-5 text-destructive">{error}</p>
          ) : isPending ? (
            <p className="text-sm leading-5 text-muted-foreground">Обновляю набор...</p>
          ) : (
            <p className="text-sm leading-5 text-muted-foreground">Результаты появятся здесь</p>
          )}
        </div>
      )}
    </section>
  )
}
