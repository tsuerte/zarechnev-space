import {revalidatePath} from 'next/cache'
import {NextRequest, NextResponse} from 'next/server'

function isAuthorized(request: NextRequest, expectedSecret: string): boolean {
  const headerSecret = request.headers.get('x-revalidate-secret')
  const querySecret = request.nextUrl.searchParams.get('secret')

  return headerSecret === expectedSecret || querySecret === expectedSecret
}

function extractSlug(payload?: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined

  const maybePayload = payload as {slug?: unknown}

  if (typeof maybePayload.slug === 'string') {
    return maybePayload.slug
  }

  if (
    maybePayload.slug &&
    typeof maybePayload.slug === 'object' &&
    typeof (maybePayload.slug as {current?: unknown}).current === 'string'
  ) {
    return (maybePayload.slug as {current: string}).current
  }

  return undefined
}

function extractSection(payload?: unknown): 'cases' | 'designops' | undefined {
  if (!payload || typeof payload !== 'object') return undefined

  const maybePayload = payload as {section?: unknown}

  if (maybePayload.section === 'cases' || maybePayload.section === 'designops') {
    return maybePayload.section
  }

  return undefined
}

function runRevalidate(payload?: {_id?: string; _type?: string; slug?: unknown; section?: unknown}) {
  const paths = ['/', '/cases', '/designops']

  if (!payload?._type || payload._type === 'avatar') {
    paths.push('/lab/avatars')
  }

  const slug = extractSlug(payload)
  if (slug && (!payload?._type || payload._type === 'caseStudy')) {
    const section = extractSection(payload)

    if (section === 'designops') {
      paths.push(`/designops/${slug}`)
    } else if (section === 'cases') {
      paths.push(`/cases/${slug}`)
    } else {
      paths.push(`/cases/${slug}`, `/designops/${slug}`)
    }
  }

  paths.forEach((path) => revalidatePath(path))

  return NextResponse.json({
    ok: true,
    revalidated: true,
    paths,
    documentId: payload?._id ?? null,
    documentType: payload?._type ?? null,
    now: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      {ok: false, error: 'Missing SANITY_REVALIDATE_SECRET'},
      {status: 500},
    )
  }

  if (!isAuthorized(request, expectedSecret)) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401})
  }

  let payload: {_id?: string; _type?: string; slug?: unknown; section?: unknown} | undefined

  try {
    payload = await request.json()
  } catch {
    payload = undefined
  }

  return runRevalidate(payload)
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      {ok: false, error: 'Missing SANITY_REVALIDATE_SECRET'},
      {status: 500},
    )
  }

  if (!isAuthorized(request, expectedSecret)) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401})
  }

  return runRevalidate()
}
