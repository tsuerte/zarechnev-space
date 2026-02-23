import Image from "next/image"
import Link from "next/link"
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react"

import { cn } from "@/lib/utils"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui-kit"

type ContentImageValue = {
  _type: "contentImage"
  alt: string
  caption?: string
  asset?: {
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width?: number
        height?: number
      }
    }
  }
}

type DividerValue = {
  _type: "divider"
  style?: "line" | "space"
}

type TableRowType = {
  _key?: string
  cells?: string[]
}

type SimpleTableValue = {
  _type: "simpleTable"
  caption?: string
  rows?: TableRowType[]
}

type CalloutValue = {
  _type: "callout"
  tone?: "info" | "success" | "warning"
  title?: string
  text?: string
}

type CodeBlockValue = {
  _type: "codeBlock"
  filename?: string
  language?: string
  code?: string
}

const calloutToneStyles: Record<NonNullable<CalloutValue["tone"]>, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-base leading-7 text-foreground first:mt-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-7 scroll-m-20 text-xl font-semibold tracking-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-5 scroll-m-20 text-lg font-semibold tracking-tight">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-5 border-l-2 pl-5 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 ml-6 list-disc space-y-1.5 text-base leading-7 marker:text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal space-y-1.5 text-base leading-7 marker:text-muted-foreground">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined
      if (!href) return <>{children}</>

      if (href.startsWith("/")) {
        return (
          <Link href={href} className="underline decoration-muted-foreground/60 underline-offset-4">
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-muted-foreground/60 underline-offset-4"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    contentImage: ({ value }) => {
      const image = value as ContentImageValue
      const imageUrl = image?.asset?.url

      if (!imageUrl || !image.alt) return null

      const width = image.asset?.metadata?.dimensions?.width ?? 1200
      const height = image.asset?.metadata?.dimensions?.height ?? 675

      return (
        <figure className="my-7 space-y-2.5">
          <Image
            src={imageUrl}
            alt={image.alt}
            width={width}
            height={height}
            className="h-auto w-full rounded-xl border"
            placeholder={image.asset?.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={image.asset?.metadata?.lqip}
          />
          {image.caption ? (
            <figcaption className="text-center text-sm text-muted-foreground">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      )
    },
    divider: ({ value }) => {
      const divider = value as DividerValue

      if (divider?.style === "space") {
        return <div className="my-7 h-7" aria-hidden="true" />
      }

      return <Separator className="my-7 bg-muted-foreground/25" />
    },
    simpleTable: ({ value }) => {
      const table = value as SimpleTableValue
      const rows = table?.rows ?? []

      if (rows.length < 2) return null

      const [header, ...body] = rows

      return (
        <figure className="my-7">
          <Table>
            <TableHeader>
              <TableRow>
                {(header.cells ?? []).map((cell, index) => (
                  <TableHead key={`head-${index}`} className="whitespace-normal align-top">
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {body.map((row, rowIndex) => (
                <TableRow key={row._key ?? `row-${rowIndex}`}>
                  {(row.cells ?? []).map((cell, cellIndex) => (
                    <TableCell
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="whitespace-normal align-top"
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            {table.caption ? <TableCaption>{table.caption}</TableCaption> : null}
          </Table>
        </figure>
      )
    },
    callout: ({ value }) => {
      const callout = value as CalloutValue
      const tone = callout.tone || "info"

      if (!callout.text) return null

      return (
        <Alert className={cn("my-7", calloutToneStyles[tone])}>
          {callout.title ? <AlertTitle>{callout.title}</AlertTitle> : null}
          <AlertDescription className="text-current">
            {callout.text}
          </AlertDescription>
        </Alert>
      )
    },
    codeBlock: ({ value }) => {
      const block = value as CodeBlockValue

      if (!block.code) return null

      return (
        <figure className="my-7 space-y-2.5">
          {block.filename ? (
            <figcaption className="text-sm text-muted-foreground">{block.filename}</figcaption>
          ) : null}
          <pre className="overflow-x-auto rounded-xl border bg-muted px-4 py-3">
            <code
              data-language={block.language || "text"}
              className="font-mono text-[13px] leading-6"
            >
              {block.code}
            </code>
          </pre>
        </figure>
      )
    },
  },
}

type PortableTextRendererProps = {
  value: PortableTextBlock[]
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />
}
