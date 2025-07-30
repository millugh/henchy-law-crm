# 3CX Phone Integration Documentation

## Overview

The Henchy Law CRM includes a comprehensive bi-directional 3CX phone integration that provides real-time caller identification, click-to-call functionality, automatic call logging, voicemail handling, and time-entry prompting.

## Features

### Real-Time Caller Identification
- Incoming call notifications with client matching
- Pop-up toasts showing caller information
- Automatic client lookup by phone number

### Click-to-Call
- All phone numbers in the CRM are clickable
- Initiates calls through 3CX API
- Real-time status feedback (Ringing, Connected, Failed)

### Automatic Call Logging
- Records call start/end times and duration
- Links calls to existing clients automatically
- Handles unmatched calls with assignment workflow

### Voicemail & Recordings
- Voicemail notifications and playback
- Call recording storage and retrieval
- Secure access controls for recordings

### Time-Entry Integration
- Post-call prompts for billable time logging
- Pre-filled duration and client information
- Seamless integration with existing time tracking

## Setup Instructions

### 1. 3CX Configuration

#### Create API Application
1. Log into 3CX Management Console
2. Navigate to **Integrations → API**
3. Create new application with **Configuration** role
4. Note the API key for CRM configuration

#### Configure Webhooks
1. Go to **Settings → Security → Webhooks**
2. Whitelist your CRM webhook URL: `https://your-crm-domain.com/api/3cx/webhook`
3. Generate and save HMAC secret for webhook security

### 2. CRM Configuration

#### Environment Variables
Add the following to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 3CX Configuration (optional - can be set via admin UI)
THREECX_API_URL=https://your-3cx-server.com
THREECX_API_USERNAME=your_api_username
THREECX_API_PASSWORD=your_api_password
THREECX_WEBHOOK_SECRET=your_webhook_secret
```

#### Database Migration
Run the database migration to create required tables:

```bash
pnpm migrate
```

This creates the following tables:
- `phone_calls` - Call records and metadata
- `voicemails` - Voicemail recordings and transcriptions
- `threecx_config` - 3CX configuration per user

#### Admin Settings
1. Navigate to **Settings → 3CX Integration**
2. Enter your 3CX server details:
   - API URL: `https://your-3cx-server.com`
   - Username: Your 3CX API username
   - Password: Your 3CX API password
   - Webhook Secret: HMAC secret for security
   - Default Extension: Your desk phone extension
3. Click **Test Connection** to verify setup
4. Enable **Register Webhooks** to automatically subscribe to 3CX events

## API Endpoints

### Webhook Endpoints

#### Incoming Call Webhook
**POST** `/api/3cx/incoming`

Handles incoming call notifications from 3CX.

**Expected Payload:**
```json
{
  "EventType": "CallStarted",
  "CallId": "12345",
  "CallerNumber": "+1234567890",
  "CalleeNumber": "+1987654321",
  "Timestamp": "2024-01-15T10:30:00Z",
  "Extension": "100"
}
```

**Sample curl command:**
```bash
curl -X POST https://your-crm-domain.com/api/3cx/incoming \
  -H "Content-Type: application/json" \
  -H "X-3CX-Signature: sha256=your_hmac_signature" \
  -d '{
    "EventType": "CallStarted",
    "CallId": "12345",
    "CallerNumber": "+1234567890",
    "CalleeNumber": "+1987654321",
    "Timestamp": "2024-01-15T10:30:00Z",
    "Extension": "100"
  }'
```

#### Call Ended Webhook
**POST** `/api/3cx/call-ended`

Handles call completion events from 3CX.

**Expected Payload:**
```json
{
  "EventType": "CallEnded",
  "CallId": "12345",
  "Duration": 180,
  "Timestamp": "2024-01-15T10:33:00Z",
  "RecordingUrl": "https://3cx-server.com/recordings/12345.wav"
}
```

**Sample curl command:**
```bash
curl -X POST https://your-crm-domain.com/api/3cx/call-ended \
  -H "Content-Type: application/json" \
  -H "X-3CX-Signature: sha256=your_hmac_signature" \
  -d '{
    "EventType": "CallEnded",
    "CallId": "12345",
    "Duration": 180,
    "Timestamp": "2024-01-15T10:33:00Z",
    "RecordingUrl": "https://3cx-server.com/recordings/12345.wav"
  }'
```

#### Voicemail Webhook
**POST** `/api/3cx/voicemail`

Handles voicemail notifications from 3CX.

**Expected Payload:**
```json
{
  "EventType": "VoicemailReceived",
  "CallId": "12345",
  "CallerNumber": "+1234567890",
  "VoicemailUrl": "https://3cx-server.com/voicemails/12345.wav",
  "Timestamp": "2024-01-15T10:35:00Z",
  "Duration": 45
}
```

**Sample curl command:**
```bash
curl -X POST https://your-crm-domain.com/api/3cx/voicemail \
  -H "Content-Type: application/json" \
  -H "X-3CX-Signature: sha256=your_hmac_signature" \
  -d '{
    "EventType": "VoicemailReceived",
    "CallId": "12345",
    "CallerNumber": "+1234567890",
    "VoicemailUrl": "https://3cx-server.com/voicemails/12345.wav",
    "Timestamp": "2024-01-15T10:35:00Z",
    "Duration": 45
  }'
```

### API Endpoints

#### Originate Call
**POST** `/api/3cx/originate`

Initiates an outbound call through 3CX.

**Request Body:**
```json
{
  "callerNumber": "+1234567890",
  "calleeNumber": "+1987654321",
  "extension": "100"
}
```

#### Test Connection
**POST** `/api/3cx/test-connection`

Tests connectivity to 3CX server.

#### Get Call Recordings
**GET** `/api/phone-calls/{id}/recording`

Retrieves call recording URL for a specific call.

## 3CX Recording Retrieval

To retrieve call recordings from 3CX, use the REST API endpoint:

```bash
curl -X GET "https://your-3cx-server.com/api/Rest/Calls/GetRecording?callId=12345" \
  -H "Authorization: Basic base64(username:password)"
```

## HMAC Signature Validation

All webhook requests include an HMAC signature for security validation:

1. **Header**: `X-3CX-Signature: sha256=signature_hash`
2. **Algorithm**: HMAC-SHA256
3. **Secret**: Configured webhook secret
4. **Payload**: Raw request body

**Example signature generation (Node.js):**
```javascript
const crypto = require('crypto')

function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

const signature = generateSignature(JSON.stringify(payload), webhookSecret)
```

## Database Schema

### phone_calls Table
```sql
CREATE TABLE phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),
  call_id_3cx TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  caller_number TEXT,
  callee_number TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- seconds
  status TEXT CHECK (status IN ('ringing', 'connected', 'completed', 'missed', 'failed', 'unassigned')),
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### voicemails Table
```sql
CREATE TABLE voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES phone_calls(id),
  user_id UUID REFERENCES auth.users(id),
  caller_number TEXT,
  voicemail_url TEXT,
  transcription TEXT,
  duration INTEGER, -- seconds
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### threecx_config Table
```sql
CREATE TABLE threecx_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  api_url TEXT NOT NULL,
  api_username TEXT NOT NULL,
  api_password TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  default_extension TEXT,
  recording_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
1. Verify webhook URL is accessible from 3CX server
2. Check HMAC signature validation
3. Ensure 3CX webhook subscriptions are active
4. Review server logs for connection errors

#### Click-to-Call Not Working
1. Verify 3CX API credentials in admin settings
2. Test connection using "Test Connection" button
3. Check extension mapping for user
4. Review 3CX server logs for API errors

#### Call Matching Issues
1. Verify phone number formats match between systems
2. Check client phone number data quality
3. Review caller ID normalization logic
4. Test with known client phone numbers

#### Recording Playback Issues
1. Verify recording URLs are accessible
2. Check user permissions for recording access
3. Ensure 3CX recording is enabled
4. Test direct recording URL access

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG_3CX=true
```

This provides detailed logging for:
- Webhook payload processing
- API call requests/responses
- Client matching logic
- Recording retrieval attempts

### Support

For additional support:
1. Check server logs for detailed error messages
2. Verify 3CX server connectivity and API access
3. Test webhook endpoints with sample payloads
4. Review database migration status
5. Contact system administrator for 3CX configuration issues

## Security Considerations

- All webhook requests are validated with HMAC signatures
- Recording access is restricted by user permissions
- API credentials are encrypted in database storage
- Phone number data is sanitized on input
- Call logs include audit trails for compliance
