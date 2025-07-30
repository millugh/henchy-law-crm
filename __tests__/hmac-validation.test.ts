import { validateHMACSignature } from '@/lib/3cx-service'

describe('HMAC Signature Validation', () => {
  const testSecret = 'test-webhook-secret-key'
  const testPayload = {
    EventType: 'CallStarted',
    CallId: '12345',
    CallerNumber: '+1234567890',
    CalleeNumber: '+1987654321',
    Timestamp: '2024-01-15T10:30:00Z',
    Extension: '100'
  }

  beforeEach(() => {
    process.env.THREECX_WEBHOOK_SECRET = testSecret
  })

  afterEach(() => {
    delete process.env.THREECX_WEBHOOK_SECRET
  })

  describe('Valid HMAC Signatures', () => {
    test('should validate correct HMAC signature', () => {
      const crypto = require('crypto')
      const payloadString = JSON.stringify(testPayload)
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, `sha256=${expectedSignature}`, testSecret)
      expect(result).toBe(true)
    })

    test('should validate signature with different payload', () => {
      const differentPayload = {
        ...testPayload,
        CallerNumber: '+9876543210'
      }
      const payloadString = JSON.stringify(differentPayload)
      
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, `sha256=${expectedSignature}`, testSecret)
      expect(result).toBe(true)
    })

    test('should validate signature with empty payload', () => {
      const emptyPayload = ''
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(emptyPayload)
        .digest('hex')

      const result = validateHMACSignature(emptyPayload, `sha256=${expectedSignature}`, testSecret)
      expect(result).toBe(true)
    })
  })

  describe('Invalid HMAC Signatures', () => {
    test('should reject incorrect HMAC signature', () => {
      const payloadString = JSON.stringify(testPayload)
      const invalidSignature = 'sha256=invalid-signature-hash'

      const result = validateHMACSignature(payloadString, invalidSignature, testSecret)
      expect(result).toBe(false)
    })

    test('should reject signature with wrong secret', () => {
      const payloadString = JSON.stringify(testPayload)
      const wrongSecret = 'wrong-secret-key'
      
      const crypto = require('crypto')
      const signatureWithWrongSecret = crypto
        .createHmac('sha256', wrongSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, `sha256=${signatureWithWrongSecret}`, testSecret)
      expect(result).toBe(false)
    })

    test('should reject malformed signature header', () => {
      const payloadString = JSON.stringify(testPayload)
      const malformedSignature = 'invalid-format-signature'

      const result = validateHMACSignature(payloadString, malformedSignature, testSecret)
      expect(result).toBe(false)
    })

    test('should reject signature without sha256 prefix', () => {
      const payloadString = JSON.stringify(testPayload)
      const crypto = require('crypto')
      const signatureWithoutPrefix = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, signatureWithoutPrefix, testSecret)
      expect(result).toBe(false)
    })

    test('should reject empty signature', () => {
      const payloadString = JSON.stringify(testPayload)
      const emptySignature = ''

      const result = validateHMACSignature(payloadString, emptySignature, testSecret)
      expect(result).toBe(false)
    })

    test('should reject null signature', () => {
      const payloadString = JSON.stringify(testPayload)

      const result = validateHMACSignature(payloadString, null as any, testSecret)
      expect(result).toBe(false)
    })

    test('should reject undefined signature', () => {
      const payloadString = JSON.stringify(testPayload)

      const result = validateHMACSignature(payloadString, undefined as any, testSecret)
      expect(result).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    test('should handle payload with special characters', () => {
      const specialPayload = {
        message: 'Test with special chars: àáâãäåæçèéêë ñòóôõö ùúûüý',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: '🔥💯✨🚀'
      }
      const payloadString = JSON.stringify(specialPayload)
      
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, `sha256=${expectedSignature}`, testSecret)
      expect(result).toBe(true)
    })

    test('should handle very long payload', () => {
      const longPayload = {
        data: 'x'.repeat(10000),
        timestamp: new Date().toISOString()
      }
      const payloadString = JSON.stringify(longPayload)
      
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')

      const result = validateHMACSignature(payloadString, `sha256=${expectedSignature}`, testSecret)
      expect(result).toBe(true)
    })

    test('should be case sensitive for signature hash', () => {
      const payloadString = JSON.stringify(testPayload)
      const crypto = require('crypto')
      const correctSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')
      
      const uppercaseSignature = `sha256=${correctSignature.toUpperCase()}`

      const result = validateHMACSignature(payloadString, uppercaseSignature, testSecret)
      expect(result).toBe(false)
    })

    test('should handle different secret lengths', () => {
      const shortSecret = 'abc'
      const longSecret = 'a'.repeat(100)
      const payloadString = JSON.stringify(testPayload)

      const crypto = require('crypto')
      const shortSecretSignature = crypto
        .createHmac('sha256', shortSecret)
        .update(payloadString)
        .digest('hex')

      const shortResult = validateHMACSignature(payloadString, `sha256=${shortSecretSignature}`, shortSecret)
      expect(shortResult).toBe(true)

      const longSecretSignature = crypto
        .createHmac('sha256', longSecret)
        .update(payloadString)
        .digest('hex')

      const longResult = validateHMACSignature(payloadString, `sha256=${longSecretSignature}`, longSecret)
      expect(longResult).toBe(true)
    })
  })

  describe('Timing Attack Protection', () => {
    test('should take consistent time for valid and invalid signatures', async () => {
      const payloadString = JSON.stringify(testPayload)
      const crypto = require('crypto')
      
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(payloadString)
        .digest('hex')
      
      const invalidSignature = 'invalid-signature-hash'

      const validStart = process.hrtime.bigint()
      validateHMACSignature(payloadString, `sha256=${validSignature}`, testSecret)
      const validEnd = process.hrtime.bigint()
      const validTime = Number(validEnd - validStart)

      const invalidStart = process.hrtime.bigint()
      validateHMACSignature(payloadString, `sha256=${invalidSignature}`, testSecret)
      const invalidEnd = process.hrtime.bigint()
      const invalidTime = Number(invalidEnd - invalidStart)

      const timeDifference = Math.abs(validTime - invalidTime)
      const averageTime = (validTime + invalidTime) / 2
      const relativeTimeDifference = timeDifference / averageTime

      expect(relativeTimeDifference).toBeLessThan(0.5)
    })
  })
})
