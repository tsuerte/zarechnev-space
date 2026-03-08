type RateLimitState = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  ok: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

const buckets = new Map<string, RateLimitState>()

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })

    return {
      ok: true,
      remaining: limit - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  buckets.set(key, current)

  return {
    ok: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  }
}

export function getRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  const realIp = request.headers.get("x-real-ip")
  return realIp?.trim() || "unknown"
}
