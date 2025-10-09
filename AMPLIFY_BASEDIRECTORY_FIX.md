# AWS Amplify baseDirectory Fix for Monorepo

## Problem

AWS Amplify deployment was failing with the error:
```
CustomerError: Artifact directory doesn't exist: apps/web/.next
```

This occurred even though the build completed successfully and the `.next` directory was created.

## Root Cause

When using AWS Amplify with a monorepo configuration that specifies `appRoot`, all paths in the `artifacts` section must be **relative to the `appRoot`**, not relative to the repository root.

### Incorrect Configuration
```yaml
applications:
  - appRoot: apps/web
    frontend:
      artifacts:
        baseDirectory: apps/web/.next  # ❌ WRONG - This looks for apps/web/apps/web/.next
```

AWS Amplify interprets this as:
- `appRoot` = `apps/web` (sets the app root context)
- `baseDirectory` = `apps/web/.next` (relative to appRoot)
- Actual path searched: `apps/web/apps/web/.next` ❌ (does not exist)

### Correct Configuration
```yaml
applications:
  - appRoot: apps/web
    frontend:
      artifacts:
        baseDirectory: .next  # ✅ CORRECT - Relative to appRoot (apps/web)
```

AWS Amplify interprets this as:
- `appRoot` = `apps/web` (sets the app root context)
- `baseDirectory` = `.next` (relative to appRoot)
- Actual path searched: `apps/web/.next` ✅ (exists after build)

## Changes Made

### 1. Root amplify.yml
**Frontend artifacts:**
- Changed `baseDirectory: apps/web/.next` → `baseDirectory: .next`
- Updated cache paths to use `../../node_modules/**/*` (relative to appRoot)
- Updated cache path to use `.next/cache/**/*` (relative to appRoot)

**Backend artifacts:**
- Changed `baseDirectory: apps/api/dist` → `baseDirectory: dist`
- Updated cache paths to use `../../node_modules/**/*` (relative to appRoot)

### 2. apps/web/amplify.yml
- Changed `baseDirectory: apps/web/.next` → `baseDirectory: .next`
- Updated cache paths to use `../../node_modules/**/*` and `.next/cache/**/*`

### 3. apps/api/amplify.yml
- Changed `baseDirectory: apps/api/dist` → `baseDirectory: dist`
- Updated cache paths to use `../../node_modules/**/*`

### 4. AWS_AMPLIFY_DEPLOYMENT.md
- Updated documentation examples to show correct relative paths
- Added clarifying comments about path relativity

## Key Principles for AWS Amplify Monorepo

### Understanding Path Context

When AWS Amplify processes a monorepo with `appRoot` specified:

1. **Build Commands Context**: Commands in `preBuild`, `build`, and `postBuild` run from where you navigate to
   - Example: `cd ../..` navigates to repository root
   - Commands after this run from repository root

2. **Artifacts Context**: All paths in `artifacts` are **relative to `appRoot`**
   - `appRoot: apps/web` sets the base
   - `baseDirectory: .next` means `apps/web/.next`
   - `baseDirectory: dist` means `apps/api/dist`

3. **Cache Context**: Cache paths can be:
   - Relative to `appRoot`: `.next/cache/**/*`
   - Relative to repository root: `../../node_modules/**/*`

### Path Resolution Examples

| appRoot | baseDirectory | Actual Path |
|---------|---------------|-------------|
| `apps/web` | `.next` | `apps/web/.next` ✅ |
| `apps/web` | `apps/web/.next` | `apps/web/apps/web/.next` ❌ |
| `apps/api` | `dist` | `apps/api/dist` ✅ |
| `apps/api` | `apps/api/dist` | `apps/api/apps/api/dist` ❌ |

## Build Process Flow

### Frontend (apps/web)

1. **Context**: AWS Amplify starts in `apps/web` (appRoot)
2. **preBuild**: 
   - `cd ../..` → Now in repository root
   - `npm ci` → Installs dependencies at root
3. **build**:
   - Still in repository root
   - `npx turbo build --filter=web` → Builds `apps/web/.next`
4. **artifacts**:
   - AWS Amplify looks for artifacts relative to appRoot (`apps/web`)
   - `baseDirectory: .next` → Finds `apps/web/.next` ✅

### Backend (apps/api)

1. **Context**: AWS Amplify starts in `apps/api` (appRoot)
2. **preBuild**: 
   - `cd ../..` → Now in repository root
   - `npm ci` → Installs dependencies at root
3. **build**:
   - Still in repository root
   - `npx turbo build --filter=api` → Builds `apps/api/dist`
4. **postBuild**:
   - Still in repository root
   - `cp -r node_modules apps/api/dist/` → Copies dependencies
5. **artifacts**:
   - AWS Amplify looks for artifacts relative to appRoot (`apps/api`)
   - `baseDirectory: dist` → Finds `apps/api/dist` ✅

## Verification

To verify the fix works correctly:

1. The build should complete successfully
2. AWS Amplify should find the artifact directory
3. No error about "Artifact directory doesn't exist"
4. Deployment should proceed to caching and uploading phases

## Related Files

- `/amplify.yml` - Root monorepo configuration
- `/apps/web/amplify.yml` - Frontend-specific configuration
- `/apps/api/amplify.yml` - Backend-specific configuration
- `/AWS_AMPLIFY_DEPLOYMENT.md` - Deployment documentation

## References

- [AWS Amplify Build Specification](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [AWS Amplify Monorepo Support](https://docs.aws.amazon.com/amplify/latest/userguide/monorepo-configuration.html)
