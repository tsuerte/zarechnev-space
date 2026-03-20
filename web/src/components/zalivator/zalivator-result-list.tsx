"use client"

import { ClipboardCopy, Inbox } from "lucide-react"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui-kit"
import { getZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import type { ZalivatorGenerateResponse } from "@/lib/zalivator/types"

type ZalivatorResultListProps = {
  result: ZalivatorGenerateResponse | null
}

export function ZalivatorResultList({ result }: ZalivatorResultListProps) {
  if (!result || result.values.length === 0) {
    return (
      <Card className="min-h-0 flex-1 border-dashed">
        <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </span>
          <p className="text-sm leading-5 text-muted-foreground">Результаты появятся здесь</p>
        </CardContent>
      </Card>
    )
  }

  const generator = getZalivatorGeneratorMetadata(result.generator)

  const copyAll = async () => {
    await navigator.clipboard.writeText(result.values.join("\n"))
  }

  return (
    <Card className="min-h-0 flex-1 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b">
        <div className="flex min-w-0 items-center gap-3">
          <CardTitle className="truncate">{generator.label}</CardTitle>
          <Badge variant="secondary">{result.quantity}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={copyAll}>
          <ClipboardCopy className="size-4" />
          Скопировать всё
        </Button>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>{generator.label}</TableHead>
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
        </div>
      </CardContent>
    </Card>
  )
}
