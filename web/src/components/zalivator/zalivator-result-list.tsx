"use client"

import { ClipboardCopy, Inbox } from "lucide-react"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui-kit"
import type { ZalivatorGenerateResponse } from "@/lib/zalivator/types"

type ZalivatorResultListProps = {
  result: ZalivatorGenerateResponse | null
  isPending: boolean
  error: string | null
}

export function ZalivatorResultList({
  result,
  isPending,
  error,
}: ZalivatorResultListProps) {
  const statusMessage = error
    ? error
    : isPending
      ? "Обновляю результаты..."
      : null

  if (!result || result.values.length === 0) {
    return (
      <Card className="min-h-0 flex-1 overflow-hidden rounded-none border-0 ring-0 shadow-none lg:h-full">
        <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-4 text-center lg:min-h-0">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </span>
          {error ? (
            <p className="text-sm leading-5 text-destructive">{error}</p>
          ) : isPending ? (
            <p className="text-sm leading-5 text-muted-foreground">Обновляю результаты...</p>
          ) : (
            <p className="text-sm leading-5 text-muted-foreground">Результаты появятся здесь</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(result.values.join("\n"))
  }

  return (
    <Card className="min-h-0 flex-1 overflow-hidden rounded-none border-0 ring-0 shadow-none lg:h-full">
      <CardHeader
        className={
          statusMessage
            ? "flex-row items-center justify-between gap-4 space-y-0 px-4 pb-2 pt-3"
            : "flex-row items-center justify-between gap-4 space-y-0 px-4 py-0"
        }
      >
        {statusMessage ? (
          <p
            className={
              error
                ? "min-w-0 flex-1 text-sm leading-5 text-destructive"
                : "min-w-0 flex-1 text-sm leading-5 text-muted-foreground"
            }
          >
            {statusMessage}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <Button variant="outline" size="sm" onClick={copyAll}>
          <ClipboardCopy className="size-4" />
          Скопировать всё
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Значение</TableHead>
              <TableHead className="w-16 text-right">Копия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.values.map((value, index) => (
              <TableRow key={`${value}-${index}`} className="group">
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="py-3 font-medium">{value}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => navigator.clipboard.writeText(value)}
                    aria-label={`Скопировать значение ${index + 1}`}
                  >
                    <ClipboardCopy className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
