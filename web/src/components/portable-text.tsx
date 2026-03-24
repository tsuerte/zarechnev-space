import Image from "next/image"
import Link from "next/link"
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui-kit"
import { getEditorialImageDisplayDimensions } from "@/lib/editorial-image"
import { cn } from "@/lib/utils"

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

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-lg leading-[26px] text-foreground first:mt-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-1 mb-3 scroll-m-20 text-2xl leading-7 font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-1 mb-3 scroll-m-20 text-xl leading-6 font-medium tracking-tight">{children}</h3>
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
      <ul className="my-4 ml-6 list-disc space-y-1.5 text-lg leading-[26px] marker:text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal space-y-1.5 text-lg leading-[26px] marker:text-muted-foreground">
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

      const assetWidth = image.asset?.metadata?.dimensions?.width ?? 1200
      const assetHeight = image.asset?.metadata?.dimensions?.height ?? 675
      const { displayWidth: width, displayHeight: height } =
        getEditorialImageDisplayDimensions(assetWidth, assetHeight)

      return (
        <figure className="mx-auto my-7 w-full space-y-2.5" style={{ maxWidth: `${width}px` }}>
          <Image
            src={imageUrl}
            alt={image.alt}
            width={width}
            height={height}
            className="h-auto w-full rounded-xl"
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

      return <hr className="my-7 border-0 border-t border-muted-foreground/25" />
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
        <Alert
          variant={tone === "warning" ? "destructive" : "default"}
          className={cn("my-7", tone === "success" && "border-emerald-500/30")}
        >
          {callout.title ? <AlertTitle>{callout.title}</AlertTitle> : null}
          <AlertDescription>{callout.text}</AlertDescription>
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
