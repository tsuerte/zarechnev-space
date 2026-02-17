'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useMemo} from 'react'

import {formatPublishedDate} from '@/lib/date'
import type {CaseCategory, CaseStudyListItem} from '@/lib/sanity/types'

type CasesBrowserProps = {
  caseStudies: CaseStudyListItem[]
  categories: CaseCategory[]
}

function normalizeCategoryParam(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  return value.length > 0 ? value : null
}

export function CasesBrowser({caseStudies, categories}: CasesBrowserProps) {
  const searchParams = useSearchParams()
  const activeCategory = normalizeCategoryParam(searchParams.get('category'))

  const filteredCaseStudies = useMemo(() => {
    if (!activeCategory) return caseStudies

    return caseStudies.filter((item) =>
      item.categories?.some((category) => category.slug === activeCategory),
    )
  }, [activeCategory, caseStudies])

  return (
    <>
      <section className="cases-filter">
        <Link
          href="/cases"
          className={activeCategory ? 'cases-filter-link' : 'cases-filter-link is-active'}
        >
          All
        </Link>
        {categories
          .filter((item) => item.slug)
          .map((item) => (
            <Link
              key={item.slug}
              href={`/cases?category=${encodeURIComponent(item.slug || '')}`}
              className={activeCategory === item.slug ? 'cases-filter-link is-active' : 'cases-filter-link'}
            >
              {item.title}
            </Link>
          ))}
      </section>

      {filteredCaseStudies.length === 0 ? (
        <p>No case studies for this category yet.</p>
      ) : (
        <ul className="cases-list">
          {filteredCaseStudies.map((item) => (
            <li key={item._id} className="cases-card">
              <h2 className="cases-card-title">
                {item.slug ? <Link href={`/cases/${item.slug}`}>{item.title}</Link> : item.title}
              </h2>

              {item.excerpt ? <p className="cases-card-excerpt">{item.excerpt}</p> : null}

              <div className="cases-card-meta">
                {formatPublishedDate(item.publishedAt)}
              </div>

              {item.categories?.length ? (
                <div className="cases-card-categories">
                  {item.categories.map((category, index) => {
                    if (!category.slug) {
                      return <span key={`${category.title}-${index}`}>{category.title}</span>
                    }

                    return (
                      <Link key={category.slug} href={`/cases?category=${encodeURIComponent(category.slug)}`}>
                        {category.title}
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
