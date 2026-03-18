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

export type CaseStudySection = 'cases' | 'designops'

export type CaseStudyListItem = {
  _id: string
  section: CaseStudySection
  title: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  coverImage?: SanityImage
}

export type CaseStudy = CaseStudyListItem & {
  coverImage?: SanityImage
  body?: PortableTextBlock[]
}

export type SidebarCaseItem = {
  section: CaseStudySection
  title: string
  slug: string
}

export type CaseStudySitemapItem = {
  section: CaseStudySection
  slug: string
  publishedAt?: string
  _updatedAt?: string
}

export type AvatarGender = 'male' | 'female'

export type AvatarSourceType = 'freepik_ai' | 'unsplash'

export type AvatarListItem = {
  _id: string
  alt: string
  gender: AvatarGender
  sourceType: AvatarSourceType
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
