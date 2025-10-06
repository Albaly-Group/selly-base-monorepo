# Quick Reference - Authentication Changes

## 🔗 New Routes

| Route | Purpose | Behavior |
|-------|---------|----------|
| `/login` | Login page | Shows login form, redirects authenticated users to `/` |
| `/logout` | Logout page | Clears auth, redirects to `/login` |

## 🔄 Redirect Map

### Unauthenticated Users
```
/ → /login
/lookup → /login
/lists → /login
/staff → /login
/admin → /login
/platform-admin → /login
/reports → /login
/imports → /login
/exports → /login
```

### Authenticated Users on Home
```
/ → /platform-admin  (if platform_admin role)
/ → /admin          (if admin/customer_admin role)
/ → /               (if user/staff role - stays on home)
```

### Edge Cases
```
/login (while authenticated) → /
Invalid cookie → /login
Middleware error → /login
```

## 📝 Component Usage

### Login Form (Existing)
```tsx
// Location: components/login-form.tsx
// Used in: app/login/page.tsx
<LoginForm />
```

### Logout Button (Updated)
```tsx
// Location: components/navigation.tsx
// Old: onClick={logout}
// New: onClick={() => router.push("/logout")}
const handleLogout = () => {
  router.push("/logout")
}
```

## 🔧 API Endpoints

### Frontend API Client
```typescript
// Login
await apiClient.login(email, password)
// Returns: { accessToken, user }

// Logout
await apiClient.logout()
// Calls backend + clears token
```

### Backend Endpoints
```typescript
// Login
POST /api/v1/auth/login
Body: { email, password }
Response: { accessToken, user }

// Logout (NEW)
POST /api/v1/auth/logout
Response: { message: "Logout successful" }

// Get current user
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
Response: { id, email, name, ... }
```

## 🔒 Middleware Logic

### Public Routes
```typescript
["/", "/login", "/logout"]
// These routes don't trigger auth redirect
```

### Protected Routes
```typescript
["/lookup", "/lists", "/staff", "/admin", 
 "/platform-admin", "/reports", "/imports", "/exports"]
// These routes require authentication
```

### Auth Flow
```typescript
1. Check cookie: "selly-user"
2. Parse user data
3. Set isAuthenticated flag
4. Check route protection
5. Apply redirects
```

## 💾 Storage

### localStorage
```typescript
// Key: "selly-user"
// Value: JSON string of User object
{
  id: string
  email: string
  name: string
  role: UserRoleName
  organization_id: string | null
  organization: Organization | null
  roles: UserRole[]
  status: string
  created_at: string
  updated_at: string
}

// Key: "auth_token"
// Value: JWT token string
```

### Cookies
```typescript
// Name: "selly-user"
// Value: Same as localStorage
// Max-Age: 7 days (604800 seconds)
// SameSite: Lax
// Path: /
```

## 🎯 Common Tasks

### Add a New Protected Route
1. Add route to `protectedRoutes` array in `middleware.ts`
```typescript
const protectedRoutes = [..., "/new-route"]
```

### Add Role-Specific Route Protection
1. Add check in `middleware.ts` after protected routes check
```typescript
if (pathname.startsWith("/new-admin-route") && isAuthenticated) {
  if (userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }
}
```

### Test Authentication Flow
```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Clear localStorage and cookies
# 2. Navigate to http://localhost:3000/
# 3. Should redirect to /login
# 4. Login with demo account
# 5. Should redirect to appropriate dashboard
# 6. Click logout
# 7. Should go to /logout then /login
```

### Debug Authentication Issues
```typescript
// Check localStorage
console.log(localStorage.getItem('selly-user'))
console.log(localStorage.getItem('auth_token'))

// Check cookies
console.log(document.cookie)

// Check auth context
const { user, isLoading } = useAuth()
console.log('User:', user)
console.log('Loading:', isLoading)
```

## 📦 File Structure

```
apps/
├── api/
│   └── src/
│       └── modules/
│           └── auth/
│               └── auth.controller.ts  (+ logout endpoint)
└── web/
    ├── app/
    │   ├── login/
    │   │   └── page.tsx  (NEW - login page)
    │   ├── logout/
    │   │   └── page.tsx  (NEW - logout page)
    │   └── page.tsx  (MODIFIED - no login form)
    ├── components/
    │   ├── navigation.tsx  (MODIFIED - use /logout route)
    │   └── login-form.tsx  (unchanged)
    ├── lib/
    │   ├── api-client.ts  (MODIFIED - call logout endpoint)
    │   └── auth.tsx  (unchanged - logout function still works)
    └── middleware.ts  (MODIFIED - redirect to /login)
```

## 🧪 Test Scenarios

### Scenario 1: Login Flow
```
1. Visit / (not logged in)
   → Redirects to /login
2. Enter credentials
   → POST /api/v1/auth/login
3. Success
   → Redirects to /
   → Middleware redirects by role
```

### Scenario 2: Logout Flow
```
1. Click logout in navigation
   → Navigate to /logout
2. Logout page loads
   → Calls logout()
   → POST /api/v1/auth/logout
   → Clear localStorage
   → Clear cookie
3. Redirect
   → Navigate to /login
```

### Scenario 3: Protected Route
```
1. Access /lookup (not logged in)
   → Middleware checks auth
   → Not authenticated
   → Redirects to /login
2. Login
   → Redirects to /
3. Now can access /lookup
```

## 🐛 Troubleshooting

### Issue: Redirect loop
**Cause:** Middleware or page causing circular redirects  
**Fix:** Check middleware logs, ensure public routes include /login

### Issue: Login doesn't persist
**Cause:** localStorage or cookie not being set  
**Fix:** Check browser console for errors, verify login response

### Issue: Logout doesn't work
**Cause:** Auth state not clearing  
**Fix:** Check logout function in auth.tsx, verify API client

### Issue: Can't access protected routes
**Cause:** Auth state not being checked properly  
**Fix:** Verify middleware logic, check user role in cookie

## 📚 Related Files

### Core Auth Files
- `apps/web/lib/auth.tsx` - Auth context and hooks
- `apps/web/middleware.ts` - Route protection
- `apps/web/lib/api-client.ts` - API communication
- `apps/api/src/modules/auth/auth.controller.ts` - Backend endpoints

### UI Components
- `apps/web/components/login-form.tsx` - Login form
- `apps/web/components/navigation.tsx` - Navigation with logout
- `apps/web/app/login/page.tsx` - Login page
- `apps/web/app/logout/page.tsx` - Logout page

### Documentation
- `AUTH_IMPLEMENTATION_SUMMARY.md` - Complete implementation guide

## 🔑 Key Takeaways

1. ✅ All unauthenticated access → `/login`
2. ✅ Logout → Navigate to `/logout` → Redirect to `/login`
3. ✅ Home page (`/`) no longer shows login form
4. ✅ Middleware handles all route protection
5. ✅ Backend logout endpoint available
6. ✅ Clean URL structure for auth

---
**Last Updated:** October 6, 2024  
**Version:** 1.0  
**Status:** Production Ready  
