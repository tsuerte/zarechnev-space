import { SvgOptimizer } from "@/components/svg-optimizer"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "SVG",
  description: "Инструмент для очистки и сжатия SVG.",
  path: "/lab/svg",
})

export default function SvgPage() {
  return (
    <main className="w-full">
      <SvgOptimizer />
    </main>
  )
}
