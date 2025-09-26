"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Mail, 
  Globe, 
  Server, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Save
} from "lucide-react"

interface SystemSettings {
  general: {
    platformName: string
    supportEmail: string
    maintenanceMode: boolean
    allowRegistrations: boolean
    defaultTimezone: string
    sessionTimeout: number
  }
  security: {
    enforceHttps: boolean
    passwordMinLength: number
    requireTwoFactor: boolean
    maxLoginAttempts: number
    sessionEncryption: boolean
    auditLogging: boolean
  }
  notifications: {
    emailNotifications: boolean
    systemAlerts: boolean
    maintenanceNotifications: boolean
    securityAlerts: boolean
    webhookUrl: string
  }
  integrations: {
    dbdWarehouseEnabled: boolean
    dbdApiKey: string
    backupFrequency: string
    dataRetentionDays: number
    apiRateLimit: number
  }
}

export function PlatformSettingsTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      platformName: "Selly Base",
      supportEmail: "support@albaly.com",
      maintenanceMode: false,
      allowRegistrations: true,
      defaultTimezone: "Asia/Bangkok",
      sessionTimeout: 480
    },
    security: {
      enforceHttps: true,
      passwordMinLength: 8,
      requireTwoFactor: false,
      maxLoginAttempts: 5,
      sessionEncryption: true,
      auditLogging: true
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      maintenanceNotifications: true,
      securityAlerts: true,
      webhookUrl: "https://hooks.albaly.com/platform"
    },
    integrations: {
      dbdWarehouseEnabled: true,
      dbdApiKey: "api_key_*********************",
      backupFrequency: "daily",
      dataRetentionDays: 2555, // 7 years
      apiRateLimit: 1000
    }
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    // Mock save functionality
    setHasUnsavedChanges(false)
    console.log("Settings saved:", settings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Platform Settings</h2>
          <p className="text-sm text-muted-foreground">
            System-wide configuration and administrative settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">You have unsaved changes</span>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic platform configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <Input 
                      value={settings.general.platformName}
                      onChange={(e) => updateSetting("general", "platformName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input 
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Timezone</Label>
                    <Select 
                      value={settings.general.defaultTimezone}
                      onValueChange={(value) => updateSetting("general", "defaultTimezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input 
                      type="number"
                      value={settings.general.sessionTimeout}
                      onChange={(e) => updateSetting("general", "sessionTimeout", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <div className="text-sm text-gray-500">Temporarily disable access for all users</div>
                    </div>
                    <Switch 
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting("general", "maintenanceMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow New Registrations</Label>
                      <div className="text-sm text-gray-500">Enable customer organizations to register new users</div>
                    </div>
                    <Switch 
                      checked={settings.general.allowRegistrations}
                      onCheckedChange={(checked) => updateSetting("general", "allowRegistrations", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input 
                      type="number"
                      min="6"
                      max="32"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting("security", "passwordMinLength", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input 
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting("security", "maxLoginAttempts", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enforce HTTPS</Label>
                      <div className="text-sm text-gray-500">Redirect all HTTP traffic to HTTPS</div>
                    </div>
                    <Switch 
                      checked={settings.security.enforceHttps}
                      onCheckedChange={(checked) => updateSetting("security", "enforceHttps", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Two-Factor Authentication</Label>
                      <div className="text-sm text-gray-500">Mandatory 2FA for all admin users</div>
                    </div>
                    <Switch 
                      checked={settings.security.requireTwoFactor}
                      onCheckedChange={(checked) => updateSetting("security", "requireTwoFactor", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Encryption</Label>
                      <div className="text-sm text-gray-500">Encrypt user session data</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                      <Switch 
                        checked={settings.security.sessionEncryption}
                        onCheckedChange={(checked) => updateSetting("security", "sessionEncryption", checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <div className="text-sm text-gray-500">Log all administrative actions</div>
                    </div>
                    <Switch 
                      checked={settings.security.auditLogging}
                      onCheckedChange={(checked) => updateSetting("security", "auditLogging", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-gray-500">Send email notifications for important events</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <div className="text-sm text-gray-500">Receive alerts for system errors and issues</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSetting("notifications", "systemAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Notifications</Label>
                      <div className="text-sm text-gray-500">Notify users about scheduled maintenance</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.maintenanceNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "maintenanceNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <div className="text-sm text-gray-500">Immediate alerts for security events</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.securityAlerts}
                      onCheckedChange={(checked) => updateSetting("notifications", "securityAlerts", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input 
                    placeholder="https://your-webhook-url.com"
                    value={settings.notifications.webhookUrl}
                    onChange={(e) => updateSetting("notifications", "webhookUrl", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Optional webhook for external notification systems</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  External Integrations
                </CardTitle>
                <CardDescription>
                  Configure external data sources and API connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>DBD Warehouse Integration</Label>
                      <div className="text-sm text-gray-500">Connect to Thailand Department of Business Development</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Switch 
                        checked={settings.integrations.dbdWarehouseEnabled}
                        onCheckedChange={(checked) => updateSetting("integrations", "dbdWarehouseEnabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>DBD API Key</Label>
                    <Input 
                      type="password"
                      value={settings.integrations.dbdApiKey}
                      onChange={(e) => updateSetting("integrations", "dbdApiKey", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Retention (Days)</Label>
                    <Input 
                      type="number"
                      value={settings.integrations.dataRetentionDays}
                      onChange={(e) => updateSetting("integrations", "dataRetentionDays", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select 
                      value={settings.integrations.backupFrequency}
                      onValueChange={(value) => updateSetting("integrations", "backupFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Rate Limit (per hour)</Label>
                    <Input 
                      type="number"
                      value={settings.integrations.apiRateLimit}
                      onChange={(e) => updateSetting("integrations", "apiRateLimit", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  System Maintenance
                </CardTitle>
                <CardDescription>
                  System maintenance tools and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Database className="h-6 w-6" />
                    <span>Database Backup</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Server className="h-6 w-6" />
                    <span>System Health Check</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Lock className="h-6 w-6" />
                    <span>Security Audit</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Clear Cache</span>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>File Storage</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache System</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Background Jobs</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}