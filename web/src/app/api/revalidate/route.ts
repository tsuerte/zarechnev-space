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

function runRevalidate(payload?: {_id?: string; _type?: string; slug?: unknown}) {
  revalidatePath('/')
  revalidatePath('/cases')

  const slug = extractSlug(payload)
  if (slug) {
    revalidatePath(`/cases/${slug}`)
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    paths: slug ? ['/', '/cases', `/cases/${slug}`] : ['/', '/cases'],
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

  let payload: {_id?: string; _type?: string; slug?: unknown} | undefined

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
