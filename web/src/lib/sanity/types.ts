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
  coverImage?: SanityImage
}

export type CaseStudy = CaseStudyListItem & {
  coverImage?: SanityImage
  body?: PortableTextBlock[]
}

export type SidebarCaseItem = {
  title: string
  slug: string
}

export type CaseStudySitemapItem = {
  slug: string
  publishedAt?: string
  _updatedAt?: string
}

export type AvatarGender = 'male' | 'female'

export type AvatarSourceType = 'freepik_ai' | 'unsplash'

export type AvatarListItem = {
  _id: string
  _createdAt: string
  _updatedAt: string
  alt: string
  gender: AvatarGender
  sourceType: AvatarSourceType
  sourceUrl?: string
  image?: {
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
}
