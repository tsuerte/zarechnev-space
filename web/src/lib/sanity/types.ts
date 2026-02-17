import type {PortableTextBlock} from '@portabletext/react'

export type SanityImage = {
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

export type CaseCategory = {
  title: string
  slug?: string
}

export type CaseStudyListItem = {
  _id: string
  title: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  categories?: CaseCategory[]
}

export type CaseStudy = CaseStudyListItem & {
  coverImage?: SanityImage
  body?: PortableTextBlock[]
}
