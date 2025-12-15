"use client"

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
import { useLocale } from 'next-intl'
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navigation() {
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  const handleLogout = () => {
    router.push(`/${locale}/logout`)
  }

  if (!user) return null

  // Helper function to create locale-aware links
  const localePath = (path: string) => `/${locale}${path}`

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link href={localePath('/dashboard')}> 
            <Button variant="ghost">SalesSphere Base</Button>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href={localePath('/dashboard')}>
                    <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      Dashboard
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {(hasPermission(user, 'companies:read') || hasPermission(user, '*')) && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={localePath('/lookup')}>
                      <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                        Company Lookup
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {(hasPermission(user, 'companies:read') || hasPermission(user, '*')) && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={localePath('/lists')}>
                      <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                        My Lists
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {canManageDatabase(user) && !canManageTenants(user) && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href={localePath('/staff')}>
                        <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                          Database Management
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href={localePath('/reports')}>
                        <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                          Reports
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}

              {(hasPermission(user, 'data:import') || hasPermission(user, 'data:export') || hasPermission(user, '*')) && !canManageTenants(user) && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href={localePath('/imports')}>
                        <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                          Imports
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href={localePath('/exports')}>
                        <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                          Exports
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}

              {canManageOrganizationUsers(user) && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={localePath('/admin')}>
                      <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                        Organization Admin
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {canManageTenants(user) && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={localePath('/platform-admin')}>
                      <div className="group inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                        Platform Admin
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
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
              <DropdownMenuItem onClick={() => router.push(localePath('/userProfile'))}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
