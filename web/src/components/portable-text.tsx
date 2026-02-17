import Image from 'next/image'
import Link from 'next/link'
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from '@portabletext/react'

type ContentImageValue = {
  _type: 'contentImage'
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
  _type: 'divider'
  style?: 'line' | 'space'
}

type TableRow = {
  _key?: string
  cells?: string[]
}

type SimpleTableValue = {
  _type: 'simpleTable'
  caption?: string
  rows?: TableRow[]
}

type CalloutValue = {
  _type: 'callout'
  tone?: 'info' | 'success' | 'warning'
  title?: string
  text?: string
}

type CodeBlockValue = {
  _type: 'codeBlock'
  filename?: string
  language?: string
  code?: string
}

const components: PortableTextComponents = {
  block: {
    h2: ({children}) => <h2 className="pt-h2">{children}</h2>,
    h3: ({children}) => <h3 className="pt-h3">{children}</h3>,
    h4: ({children}) => <h4 className="pt-h4">{children}</h4>,
    blockquote: ({children}) => (
      <blockquote className="pt-blockquote">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="pt-list">{children}</ul>,
    number: ({children}) => <ol className="pt-list">{children}</ol>,
  },
  marks: {
    link: ({value, children}) => {
      const href = value?.href as string | undefined
      if (!href) return <>{children}</>

      if (href.startsWith('/')) {
        return <Link href={href}>{children}</Link>
      }

      return (
        <a href={href} target="_blank" rel="noreferrer noopener">
          {children}
        </a>
      )
    },
  },
  types: {
    contentImage: ({value}) => {
      const image = value as ContentImageValue
      const imageUrl = image?.asset?.url

      if (!imageUrl || !image.alt) return null

      const width = image.asset?.metadata?.dimensions?.width ?? 1200
      const height = image.asset?.metadata?.dimensions?.height ?? 675

      return (
        <figure className="pt-figure">
          <Image
            src={imageUrl}
            alt={image.alt}
            width={width}
            height={height}
            className="pt-image"
            placeholder={image.asset?.metadata?.lqip ? 'blur' : 'empty'}
            blurDataURL={image.asset?.metadata?.lqip}
          />
          {image.caption ? (
            <figcaption className="pt-caption">{image.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
    divider: ({value}) => {
      const divider = value as DividerValue

      if (divider?.style === 'space') {
        return <div className="pt-divider-space" aria-hidden="true" />
      }

      return <hr className="pt-divider" />
    },
    simpleTable: ({value}) => {
      const table = value as SimpleTableValue
      const rows = table?.rows ?? []

      if (rows.length < 2) return null

      const [header, ...body] = rows

      return (
        <figure className="pt-figure">
          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  {(header.cells ?? []).map((cell, index) => (
                    <th key={`head-${index}`} className="pt-th">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={row._key ?? `row-${rowIndex}`}>
                    {(row.cells ?? []).map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className="pt-td">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.caption ? (
            <figcaption className="pt-caption">{table.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
    callout: ({value}) => {
      const callout = value as CalloutValue
      const tone = callout.tone || 'info'

      if (!callout.text) return null

      return (
        <aside className={`pt-callout pt-callout-${tone}`} role="note">
          {callout.title ? <h4 className="pt-callout-title">{callout.title}</h4> : null}
          <p className="pt-callout-text">{callout.text}</p>
        </aside>
      )
    },
    codeBlock: ({value}) => {
      const block = value as CodeBlockValue

      if (!block.code) return null

      return (
        <figure className="pt-code-wrap">
          {block.filename ? <figcaption className="pt-code-caption">{block.filename}</figcaption> : null}
          <pre className="pt-code-pre">
            <code data-language={block.language || 'text'}>{block.code}</code>
          </pre>
        </figure>
      )
    },
  },
}

type PortableTextRendererProps = {
  value: PortableTextBlock[]
}

export function PortableTextRenderer({value}: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />
}
