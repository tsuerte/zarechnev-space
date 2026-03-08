"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/ui-kit"

import { SvgOptimizerBatch } from "@/components/svg-optimizer-batch"
import { SvgOptimizerSingle } from "@/components/svg-optimizer-single"

export function SvgOptimizer() {
  return (
    <section className="mx-auto min-w-0 w-full max-w-6xl space-y-4">
      <Tabs defaultValue="single" size="md" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Один файл</TabsTrigger>
          <TabsTrigger value="batch">Пакет</TabsTrigger>
        </TabsList>
        <TabsContent value="single" forceMount className="mt-0">
          <SvgOptimizerSingle />
        </TabsContent>
        <TabsContent value="batch" forceMount className="mt-0">
          <SvgOptimizerBatch />
        </TabsContent>
      </Tabs>
    </section>
  )
}
