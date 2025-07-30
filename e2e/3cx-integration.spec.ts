import { test, expect, Page } from '@playwright/test'

const mockIncomingCallPayload = {
  EventType: 'CallStarted',
  CallId: 'test-call-12345',
  CallerNumber: '+1234567890',
  CalleeNumber: '+1987654321',
  Timestamp: new Date().toISOString(),
  Extension: '100'
}

const mockCallEndedPayload = {
  EventType: 'CallEnded',
  CallId: 'test-call-12345',
  Duration: 180,
  Timestamp: new Date().toISOString(),
  RecordingUrl: 'https://test-3cx.com/recordings/test-call-12345.wav'
}

const mockVoicemailPayload = {
  EventType: 'VoicemailReceived',
  CallId: 'test-call-12345',
  CallerNumber: '+1234567890',
  VoicemailUrl: 'https://test-3cx.com/voicemails/test-call-12345.wav',
  Timestamp: new Date().toISOString(),
  Duration: 45
}

function generateHMACSignature(payload: any, secret: string): string {
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
}

test.describe('3CX Phone Integration E2E Tests', () => {
  let page: Page
  const webhookSecret = 'test-webhook-secret-key'
  const baseURL = process.env.BASE_URL || 'http://localhost:3000'

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    
    await page.goto(`${baseURL}/login`)
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Complete 3CX Integration Workflow', async () => {
    await test.step('Configure 3CX Settings', async () => {
      await page.goto(`${baseURL}/settings/3cx`)
      
      await page.fill('[data-testid="api-url"]', 'https://test-3cx.com')
      await page.fill('[data-testid="api-username"]', 'test-admin')
      await page.fill('[data-testid="api-password"]', 'test-password')
      await page.fill('[data-testid="webhook-secret"]', webhookSecret)
      await page.fill('[data-testid="default-extension"]', '100')
      
      await page.click('[data-testid="test-connection"]')
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected')
      
      await page.click('[data-testid="save-config"]')
      await expect(page.locator('.toast')).toContainText('Configuration saved')
    })

    await test.step('Test Click-to-Call', async () => {
      await page.goto(`${baseURL}/clients`)
      
      const phoneLink = page.locator('[data-testid="phone-link"]').first()
      await expect(phoneLink).toBeVisible()
      
      await phoneLink.click()
      
      await expect(page.locator('[data-testid="call-status"]')).toContainText('Initiating call')
      
      await page.waitForTimeout(2000)
      await expect(page.locator('[data-testid="call-status"]')).toContainText('Ringing')
    })

    await test.step('Simulate Incoming Call', async () => {
      const signature = generateHMACSignature(mockIncomingCallPayload, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: mockIncomingCallPayload
      })
      
      expect(response.status()).toBe(200)
      
      await expect(page.locator('[data-testid="incoming-call-toast"]')).toBeVisible()
      await expect(page.locator('[data-testid="caller-number"]')).toContainText('+1234567890')
      
      await expect(page.locator('[data-testid="view-client-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="add-note-btn"]')).toBeVisible()
    })

    await test.step('Simulate Call Ended', async () => {
      const signature = generateHMACSignature(mockCallEndedPayload, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/call-ended`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: mockCallEndedPayload
      })
      
      expect(response.status()).toBe(200)
      
      await expect(page.locator('[data-testid="incoming-call-toast"]')).not.toBeVisible()
      
      await expect(page.locator('[data-testid="time-entry-prompt"]')).toBeVisible()
      await expect(page.locator('[data-testid="call-duration"]')).toContainText('3 min')
    })

    await test.step('Verify Call in Dashboard', async () => {
      await page.goto(`${baseURL}/calls`)
      
      await expect(page.locator('[data-testid="call-history"]')).toBeVisible()
      
      const callRow = page.locator(`[data-testid="call-${mockIncomingCallPayload.CallId}"]`)
      await expect(callRow).toBeVisible()
      await expect(callRow).toContainText('+1234567890')
      await expect(callRow).toContainText('3 min')
      
      const playButton = callRow.locator('[data-testid="play-recording"]')
      if (await playButton.isVisible()) {
        await playButton.click()
        await expect(page.locator('[data-testid="audio-player"]')).toBeVisible()
      }
    })

    await test.step('Test Time Entry Integration', async () => {
      const logTimeBtn = page.locator(`[data-testid="log-time-${mockIncomingCallPayload.CallId}"]`)
      await logTimeBtn.click()
      
      await expect(page.locator('[data-testid="time-entry-dialog"]')).toBeVisible()
      await expect(page.locator('[data-testid="duration-input"]')).toHaveValue('3')
      
      await page.fill('[data-testid="description-input"]', 'Client consultation call')
      await page.selectOption('[data-testid="matter-select"]', { index: 0 })
      
      await page.click('[data-testid="save-time-entry"]')
      await expect(page.locator('.toast')).toContainText('Time entry saved')
    })

    await test.step('Test Voicemail Handling', async () => {
      const signature = generateHMACSignature(mockVoicemailPayload, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/voicemail`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: mockVoicemailPayload
      })
      
      expect(response.status()).toBe(200)
      
      await expect(page.locator('[data-testid="voicemail-notification"]')).toBeVisible()
      await expect(page.locator('[data-testid="voicemail-caller"]')).toContainText('+1234567890')
      
      await page.click('[data-testid="play-voicemail"]')
      await expect(page.locator('[data-testid="voicemail-player"]')).toBeVisible()
    })

    await test.step('Test Unassigned Call Assignment', async () => {
      await page.goto(`${baseURL}/calls`)
      
      const unassignedWidget = page.locator('[data-testid="unassigned-calls-widget"]')
      if (await unassignedWidget.isVisible()) {
        await page.click('[data-testid="assign-call-btn"]')
        
        await expect(page.locator('[data-testid="assignment-modal"]')).toBeVisible()
        
        await page.fill('[data-testid="client-search"]', 'Test Client')
        await page.selectOption('[data-testid="client-select"]', { index: 0 })
        
        await page.click('[data-testid="assign-to-client"]')
        await expect(page.locator('.toast')).toContainText('Call assigned')
      }
    })

    await test.step('Test SSE Connection', async () => {
      await page.goto(`${baseURL}/dashboard`)
      
      const sseLogs: string[] = []
      page.on('console', msg => {
        if (msg.text().includes('SSE')) {
          sseLogs.push(msg.text())
        }
      })
      
      await page.waitForTimeout(3000)
      
      expect(sseLogs.some(log => log.includes('connection established'))).toBeTruthy()
      
      await page.evaluate(() => {
        if (window.EventSource) {
          const connections = document.querySelectorAll('[data-sse-connection]')
          connections.forEach(conn => {
            if ('close' in conn && typeof conn.close === 'function') {
              conn.close()
            }
          })
        }
      })
      
      await page.waitForTimeout(5000)
      expect(sseLogs.some(log => log.includes('reconnect'))).toBeTruthy()
    })
  })

  test('HMAC Signature Validation', async () => {
    await test.step('Test Valid Signature', async () => {
      const signature = generateHMACSignature(mockIncomingCallPayload, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: mockIncomingCallPayload
      })
      
      expect(response.status()).toBe(200)
    })

    await test.step('Test Invalid Signature', async () => {
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': 'sha256=invalid-signature'
        },
        data: mockIncomingCallPayload
      })
      
      expect(response.status()).toBe(401)
    })

    await test.step('Test Missing Signature', async () => {
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: mockIncomingCallPayload
      })
      
      expect(response.status()).toBe(401)
    })
  })

  test('Error Handling and Edge Cases', async () => {
    await test.step('Test Malformed Webhook Payload', async () => {
      const signature = generateHMACSignature({ invalid: 'payload' }, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: { invalid: 'payload' }
      })
      
      expect(response.status()).toBe(400)
    })

    await test.step('Test 3CX Server Unavailable', async () => {
      await page.goto(`${baseURL}/settings/3cx`)
      
      await page.fill('[data-testid="api-url"]', 'https://invalid-3cx-server.com')
      await page.click('[data-testid="test-connection"]')
      
      await expect(page.locator('[data-testid="connection-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="connection-error"]')).toContainText('Connection failed')
    })

    await test.step('Test Call Without Client Match', async () => {
      const unknownCallerPayload = {
        ...mockIncomingCallPayload,
        CallerNumber: '+9999999999' // Unknown number
      }
      
      const signature = generateHMACSignature(unknownCallerPayload, webhookSecret)
      
      const response = await page.request.post(`${baseURL}/api/3cx/incoming`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3CX-Signature': `sha256=${signature}`
        },
        data: unknownCallerPayload
      })
      
      expect(response.status()).toBe(200)
      
      await expect(page.locator('[data-testid="incoming-call-toast"]')).toBeVisible()
      await expect(page.locator('[data-testid="add-new-contact-btn"]')).toBeVisible()
    })
  })

  test.afterEach(async () => {
    await page.close()
  })
})
