import { describe, expect, it } from 'vitest'
import {
  safeInvalidEventsDetails,
  safeSchemaErrorDetails,
  safeUrlErrorDetails,
} from '../supabase/functions/_backend/public/webhooks/validation_errors.ts'

describe('webhook validation error redaction', () => {
  it('keeps schema issue metadata without echoing submitted values', () => {
    const submittedValue = 'token=secret-webhook-value'
    const details = safeSchemaErrorDetails({
      issues: [
        {
          code: 'invalid_type',
          path: ['url'],
          data: submittedValue,
          message: `Expected string, got ${submittedValue}`,
        },
      ],
    })

    expect(details).toEqual({
      issue_count: 1,
      issues: [{ code: 'invalid_type', path: ['url'] }],
    })
    expect(JSON.stringify(details)).not.toContain(submittedValue)
  })

  it('reports invalid webhook event counts without echoing event values', () => {
    const invalidEvent = 'apps.SECRET_VALUE'
    const allowedEvents = ['apps', 'channels'] as const
    const details = safeInvalidEventsDetails([invalidEvent], allowedEvents)

    expect(details.invalid_count).toBe(1)
    expect(details.allowed).toEqual(allowedEvents)
    expect(JSON.stringify(details)).not.toContain(invalidEvent)
  })

  it('summarizes invalid webhook URLs without echoing query secrets', () => {
    const details = safeUrlErrorDetails('https://example.com/webhook?token=secret-token')

    expect(details).toMatchObject({
      url_provided: true,
      protocol: 'https:',
      has_hostname: true,
      has_query: true,
    })
    expect(JSON.stringify(details)).not.toContain('secret-token')
    expect(JSON.stringify(details)).not.toContain('example.com')
  })
})
