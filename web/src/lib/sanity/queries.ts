import groq from 'groq'

export const caseStudiesListQuery = groq`*[
  _type == "caseStudy"
] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "categories": categories[]->{
    title,
    "slug": slug.current
  }
}`

export const caseStudyBySlugQuery = groq`*[_type == "caseStudy" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "categories": categories[]->{
    title,
    "slug": slug.current
  },
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
    _type == "simpleTable" => {
      ...,
      rows[]{
        ...,
        cells[]
      }
    }
  }
}`

export const caseStudySlugsQuery = groq`*[_type == "caseStudy" && defined(slug.current)]{"slug": slug.current}`

export const caseStudySitemapQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current)
]{
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`

export const sidebarCaseItemsQuery = groq`*[
  _type == "caseStudy" &&
  defined(slug.current)
] | order(coalesce(publishedAt, _createdAt) desc) {
  title,
  "slug": slug.current
}`

export const categoriesQuery = groq`*[_type == "category"] | order(title asc) {
  title,
  "slug": slug.current
}`
