"use client"

import { useState } from "react"
import { useAuth, hasPermission, canManageTenants, canManageOrganizationUsers, canManageDatabase } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/src/components/language-switcher"
import { Menu, X } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navigation() {
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tLogin = useTranslations('login')

  const handleLogout = () => {
    router.push(`/${locale}/logout`)
  }

  if (!user) return null

  // Helper function to create locale-aware links
  const localePath = (path: string) => `/${locale}${path}`

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b bg-white relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="text-xl font-bold text-primary">
              <a href={localePath('/dashboard')}>{tLogin('title')}</a>
            </button>

            <div className="hidden md:block">
              <NavigationMenu>
              <NavigationMenuList>
                {/* Dashboard - available to all authenticated users */}
                <NavigationMenuItem>
                  <Link href={localePath('/dashboard')}>
                    <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      {t('dashboard')}
                    </div>
                  </Link>
                </NavigationMenuItem>

                {/* Basic user features - available to users with company access permissions */}
                {(hasPermission(user, 'companies:read') || hasPermission(user, '*')) && (
                  <>
                    <NavigationMenuItem>
                      <Link href={localePath('/lookup')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('company_lookup')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href={localePath('/lists')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('my_lists')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}

                {/* Staff features - available to users with database management permissions */}
                {canManageDatabase(user) && !canManageTenants(user) && (
                  <>
                    <NavigationMenuItem>
                      <Link href={localePath('/staff')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('database_management')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href={localePath('/reports')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('reports')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}

                {/* Import/Export - available to users with data import/export permissions */}
                {(hasPermission(user, 'data:import') || hasPermission(user, 'data:export') || hasPermission(user, '*')) && !canManageTenants(user) && (
                  <>
                    <NavigationMenuItem>
                      <Link href={localePath('/imports')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('import')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href={localePath('/exports')}>
                        <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                          {t('export')}
                        </div>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}

                {/* Customer Admin - Organization-specific administration */}
                {canManageOrganizationUsers(user) && (
                  <NavigationMenuItem>
                    <Link href={localePath('/admin')}>
                      <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        {t('organization_admin')}
                      </div>
                    </Link>
                  </NavigationMenuItem>
                )}

                {/* Platform Admin - Albaly platform management */}
                {canManageTenants(user) && (
                  <NavigationMenuItem>
                    <Link href={localePath('/platform-admin')}>
                      <div className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        {t('platform_admin')}
                      </div>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Mobile: hamburger opens a full-width panel */}
            <div className="md:hidden">
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
                onClick={() => setMobileOpen((s) => !s)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(localePath('/userProfile'))}>{tCommon('settings')}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>{tCommon('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="absolute left-0 right-0 top-full z-40 border-t bg-white shadow-md">
            <div className="p-4 space-y-2">
              <Link href={localePath('/dashboard')}>
                <div className="px-3 py-2 rounded hover:bg-gray-50">{t('dashboard')}</div>
              </Link>

              {(hasPermission(user, 'companies:read') || hasPermission(user, '*')) && (
                <>
                  <Link href={localePath('/lookup')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('company_lookup')}</div>
                  </Link>
                  <Link href={localePath('/lists')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('my_lists')}</div>
                  </Link>
                </>
              )}

              {canManageDatabase(user) && !canManageTenants(user) && (
                <>
                  <Link href={localePath('/staff')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('database_management')}</div>
                  </Link>
                  <Link href={localePath('/reports')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('reports')}</div>
                  </Link>
                </>
              )}

              {(hasPermission(user, 'data:import') || hasPermission(user, 'data:export') || hasPermission(user, '*')) && !canManageTenants(user) && (
                <>
                  <Link href={localePath('/imports')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('import')}</div>
                  </Link>
                  <Link href={localePath('/exports')}>
                    <div className="px-3 py-2 rounded hover:bg-gray-50">{t('export')}</div>
                  </Link>
                </>
              )}

              {canManageOrganizationUsers(user) && (
                <Link href={localePath('/admin')}>
                  <div className="px-3 py-2 rounded hover:bg-gray-50">{t('organization_admin')}</div>
                </Link>
              )}

              {canManageTenants(user) && (
                <Link href={localePath('/platform-admin')}>
                  <div className="px-3 py-2 rounded hover:bg-gray-50">{t('platform_admin')}</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
