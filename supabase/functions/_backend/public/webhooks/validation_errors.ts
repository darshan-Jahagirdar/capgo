export function safeSchemaErrorDetails(error: any) {
  const issues = (error?.issues ?? []).map((issue: any) => ({
    code: issue.code ?? 'unknown',
    path: Array.isArray(issue.path) ? issue.path.map(String) : [],
  }))

  return {
    issue_count: issues.length,
    issues,
  }
}

export function safeInvalidEventsDetails(invalidEvents: string[], allowedEvents: readonly string[]) {
  return {
    invalid_count: invalidEvents.length,
    allowed: allowedEvents,
  }
}

export function safeUrlErrorDetails(rawUrl: string | null | undefined) {
  if (!rawUrl) {
    return { url_provided: false }
  }

  try {
    const url = new URL(rawUrl)
    return {
      url_provided: true,
      protocol: url.protocol,
      has_hostname: url.hostname !== '',
      hostname_length: url.hostname.length,
      path_segment_count: url.pathname.split('/').filter(Boolean).length,
      has_query: url.search !== '',
      has_credentials: url.username !== '' || url.password !== '',
    }
  }
  catch {
    return {
      url_provided: true,
      invalid_url: true,
      length: rawUrl.length,
    }
  }
}
