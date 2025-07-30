"use client"

import { useState, useEffect } from 'react'
import { Settings, Phone, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ApiClient, ThreeCxConfig } from '@/lib/api'

const apiClient = new ApiClient()

export default function ThreeCxSettingsPage() {
  const [config, setConfig] = useState<Partial<ThreeCxConfig>>({
    api_url: '',
    api_username: '',
    api_password: '',
    webhook_secret: '',
    default_extension: '',
    recording_enabled: true,
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    const response = await apiClient.fetchThreeCxConfig()
    if (response.data) {
      setConfig(response.data)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const response = await apiClient.updateThreeCxConfig(config)
    
    if (response.data) {
      setConfig(response.data)
      toast({
        title: "Settings saved",
        description: "Your 3CX configuration has been updated successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to save settings",
        variant: "destructive",
      })
    }
    setSaving(false)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    const response = await apiClient.testThreeCxConnection()
    
    if (response.data) {
      setTestResult(response.data)
      toast({
        title: response.data.success ? "Connection successful" : "Connection failed",
        description: response.data.message,
        variant: response.data.success ? "default" : "destructive",
      })
    } else {
      setTestResult({ success: false, message: response.error || "Test failed" })
      toast({
        title: "Test failed",
        description: response.error || "Failed to test connection",
        variant: "destructive",
      })
    }
    setTesting(false)
  }

  const generateWebhookSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    setConfig(prev => ({ ...prev, webhook_secret: secret }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-pulse mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">3CX Settings</h1>
          <p className="text-gray-600">Configure your 3CX phone system integration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            3CX Configuration
          </CardTitle>
          <CardDescription>
            Configure the connection to your 3CX phone system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="api_url">3CX API URL</Label>
              <Input
                id="api_url"
                placeholder="https://your-3cx-server.com"
                value={config.api_url || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, api_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_extension">Default Extension</Label>
              <Input
                id="default_extension"
                placeholder="100"
                value={config.default_extension || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, default_extension: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="api_username">API Username</Label>
              <Input
                id="api_username"
                placeholder="admin"
                value={config.api_username || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, api_username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_password">API Password</Label>
              <Input
                id="api_password"
                type="password"
                placeholder="••••••••"
                value={config.api_password || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, api_password: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook_secret">Webhook Secret</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateWebhookSecret}
              >
                Generate New
              </Button>
            </div>
            <Input
              id="webhook_secret"
              placeholder="Enter or generate a webhook secret"
              value={config.webhook_secret || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, webhook_secret: e.target.value }))}
            />
            <p className="text-sm text-gray-500">
              This secret is used to validate incoming webhooks from 3CX
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recording Enabled</Label>
                <p className="text-sm text-gray-500">
                  Automatically fetch call recordings when available
                </p>
              </div>
              <Switch
                checked={config.recording_enabled || false}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, recording_enabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integration Active</Label>
                <p className="text-sm text-gray-500">
                  Enable or disable the 3CX integration
                </p>
              </div>
              <Switch
                checked={config.is_active || false}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Connection Test</h3>
              <p className="text-sm text-gray-500">
                Test the connection to your 3CX server
              </p>
            </div>
            <div className="flex items-center gap-3">
              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.message}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || !config.api_url || !config.api_username || !config.api_password}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Configure these webhook URLs in your 3CX Management Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Incoming Call Webhook</Label>
            <Input
              readOnly
              value={`${window.location.origin}/api/3cx/incoming`}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Call Ended Webhook</Label>
            <Input
              readOnly
              value={`${window.location.origin}/api/3cx/call-ended`}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Voicemail Webhook</Label>
            <Input
              readOnly
              value={`${window.location.origin}/api/3cx/voicemail`}
              className="font-mono text-sm"
            />
          </div>
          <p className="text-sm text-gray-500">
            Copy these URLs and configure them in your 3CX Management Console under Settings → Webhooks
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
