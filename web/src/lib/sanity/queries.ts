import groq from 'groq'

export const caseStudiesListQuery = groq`*[
  _type == "caseStudy" &&
  section == "cases"
] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  section,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage {
    alt,
    caption,
    asset->{
      url,
      metadata {
        lqip,
        dimensions {width, height}
      }
    }
  }
}`

export const designOpsListQuery = groq`*[
  _type == "caseStudy" &&
  section == "designops" &&
  defined(slug.current)
] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  section,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage {
    alt,
    caption,
    asset->{
      url,
      metadata {
        lqip,
        dimensions {width, height}
      }
    }
  }
}`

export const caseStudyBySlugAndSectionQuery = groq`*[
  _type == "caseStudy" &&
  slug.current == $slug &&
  section == $section
][0] {
  _id,
  section,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage {
    alt,
    caption,
    asset->{
      url,
      metadata {
        lqip,
        dimensions {width, height}
      }
    }
  },
  body[] {
    ...,
    _type == "contentImage" => {
      ...,
      asset->{
        url,
        metadata {
          lqip,
          dimensions {width, height}
        }
      }
    },
    _type == "contentCarousel" => {
      ...,
      items[]{
        ...,
        image{
          ...,
          asset->{
            url,
            metadata {
              lqip,
              dimensions {width, height}
            }
          }
        }
      }
    },
    _type == "simpleTable" => {
      ...,
      rows[]{
        ...,
        cells[]
      }
    }
  }
}`

export const caseStudySlugsQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current) &&
  section == "cases"
]{"slug": slug.current}`

export const designOpsSlugsQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current) &&
  section == "designops"
]{"slug": slug.current}`

export const caseStudyPathBySlugQuery = groq`*[
  _type == "caseStudy" &&
  slug.current == $slug
][0]{
  "slug": slug.current,
  section
}`

export const caseStudySitemapQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current)
]{
  section,
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`

export const sidebarCaseItemsQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current)
] | order(coalesce(publishedAt, _createdAt) desc) {
  section,
  title,
  "slug": slug.current
}`

export const avatarsListQuery = groq`*[
  _type == "avatar" &&
  defined(image.asset)
] | order(_createdAt desc) {
  _id,
  alt,
  gender,
  sourceType,
  image {
    asset->{
      url,
      metadata {
        lqip,
        dimensions {width, height}
      }
    }
  }
}`

export const avatarsByIdsQuery = groq`*[
  _type == "avatar" &&
  _id in $ids &&
  defined(image.asset)
] {
  _id,
  alt,
  gender,
  sourceType,
  image {
    asset->{
      url
    }
  }
}`
