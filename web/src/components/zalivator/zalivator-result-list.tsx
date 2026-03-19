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
          <div className="space-y-1">
            <p className="text-sm leading-5">Результаты появятся здесь</p>
            <p className="text-sm leading-5 text-muted-foreground">
              Выбери тип данных, настрой параметры и запусти генерацию.
            </p>
          </div>
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
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b">
        <div className="space-y-2">
          <CardTitle>{generator.label}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{result.quantity} значений</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={copyAll}>
          <ClipboardCopy className="size-4" />
          Скопировать всё
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 p-0">
        <div className="min-h-0 overflow-auto">
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
                <TableRow key={`${value}-${index}`}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="py-3">{value}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
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
