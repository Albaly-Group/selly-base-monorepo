"use client"

import { useState } from "react"
import { useAuth, canManageOrganizationSettings } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plug, Globe, Mail, FileText, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"

export function IntegrationsTab() {
  const { user: currentUser } = useAuth()
  
  // Initialize all hooks first (must be called unconditionally)
  const [webhooks, setWebhooks] = useState([
    {
      id: "1",
      name: "Export Notification Webhook",
      url: "https://api.example.com/webhooks/export",
      enabled: true,
      events: ["export.completed", "export.failed"],
      status: "active",
      lastTriggered: "2024-12-08T14:30:00Z"
    },
    {
      id: "2", 
      name: "User Registration Webhook",
      url: "https://slack.example.com/webhooks/user-activity",
      enabled: false,
      events: ["user.created", "user.activated"],
      status: "inactive",
      lastTriggered: null
    }
  ])

  const [ssoSettings, setSsoSettings] = useState({
    enabled: false,
    provider: "keycloak",
    serverUrl: "",
    realm: "",
    clientId: "",
    autoCreateUsers: true
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "noreply@example.com",
    smtpPassword: "••••••••",
    fromEmail: "noreply@example.com",
    fromName: "Selly BASE System"
  })

  const handleWebhookToggle = (webhookId: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, enabled: !webhook.enabled, status: !webhook.enabled ? "active" : "inactive" }
        : webhook
    ))
  }

  const testWebhook = (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId)
    if (webhook) {
      alert(`Testing webhook: ${webhook.name}\nSending test payload to ${webhook.url}`)
    }
  }

  const saveIntegrations = () => {
    console.log("Saving integrations:", { webhooks, ssoSettings, emailSettings })
    alert("Integration settings saved successfully!")
  }

  // Check permissions after all hooks
  if (!currentUser || !canManageOrganizationSettings(currentUser)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have permission to manage integrations.</p>
            <p className="text-sm mt-2">This feature requires customer admin privileges within your organization.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-gray-600">Configure external system integrations and notifications</p>
        </div>
        <Button onClick={saveIntegrations} className="gap-2">
          <Plug className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>Configure HTTP webhooks for system events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{webhook.name}</h4>
                    <p className="text-sm text-gray-500">{webhook.url}</p>
                  </div>
                  <Badge variant="secondary" className={
                    webhook.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }>
                    {webhook.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testWebhook(webhook.id)}
                  >
                    Test
                  </Button>
                  <Switch 
                    checked={webhook.enabled}
                    onCheckedChange={() => handleWebhookToggle(webhook.id)}
                  />
                </div>
              </div>
              
              <div className="text-sm">
                <div className="text-gray-600">Events:</div>
                <div className="flex gap-2 mt-1">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline">{event}</Badge>
                  ))}
                </div>
              </div>
              
              {webhook.lastTriggered && (
                <div className="text-sm text-gray-500">
                  Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                </div>
              )}
            </div>
          ))}

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Add New Webhook</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input placeholder="Enter webhook name" />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://your-server.com/webhook" />
              </div>
            </div>
            <Button variant="outline">Add Webhook</Button>
          </div>
        </CardContent>
      </Card>

      {/* SSO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Single Sign-On (SSO)
          </CardTitle>
          <CardDescription>Configure OIDC/SAML authentication via Keycloak</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SSO Authentication</Label>
              <div className="text-sm text-gray-500">Allow users to login with external identity provider</div>
            </div>
            <Switch 
              checked={ssoSettings.enabled}
              onCheckedChange={(checked) => setSsoSettings({...ssoSettings, enabled: checked})}
            />
          </div>

          {ssoSettings.enabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Keycloak Server URL</Label>
                  <Input 
                    placeholder="https://auth.example.com"
                    value={ssoSettings.serverUrl}
                    onChange={(e) => setSsoSettings({...ssoSettings, serverUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Realm</Label>
                  <Input 
                    placeholder="selly-base"
                    value={ssoSettings.realm}
                    onChange={(e) => setSsoSettings({...ssoSettings, realm: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input 
                    placeholder="selly-base-frontend"
                    value={ssoSettings.clientId}
                    onChange={(e) => setSsoSettings({...ssoSettings, clientId: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Create Users</Label>
                  <div className="text-sm text-gray-500">Automatically create user accounts on first SSO login</div>
                </div>
                <Switch 
                  checked={ssoSettings.autoCreateUsers}
                  onCheckedChange={(checked) => setSsoSettings({...ssoSettings, autoCreateUsers: checked})}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>SMTP settings for system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input 
                placeholder="smtp.gmail.com"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input 
                placeholder="587"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input 
                placeholder="username@example.com"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input 
                type="password"
                placeholder="••••••••"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input 
                placeholder="noreply@example.com"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input 
                placeholder="Selly BASE System"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Test Email</Button>
            <Button variant="outline">Send Test Notification</Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Templates
          </CardTitle>
          <CardDescription>Download templates for data import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Company Import Template</h4>
              <p className="text-sm text-gray-600 mb-3">
                Template with required and optional fields for company data import
              </p>
              <Button variant="outline" size="sm">Download Template</Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Contact Import Template</h4>
              <p className="text-sm text-gray-600 mb-3">
                Template for importing contact person information
              </p>
              <Button variant="outline" size="sm">Download Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}