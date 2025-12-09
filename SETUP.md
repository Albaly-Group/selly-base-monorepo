# Setup Guide

## 📦 After Pulling Updates

If you've just pulled the latest changes and are seeing errors like:
- `'turbo' is not recognized as an internal or external command`
- `'next' is not recognized as an internal or external command`
- `npm error could not determine executable to run`

**Solution: Install dependencies**

```bash
# Run this from the root directory of the monorepo
npm install
```

This command will:
- ✅ Install all root dependencies (including `turbo`)
- ✅ Install dependencies for all workspaces (`apps/web`, `apps/api`, `packages/types`)
- ✅ Verify the setup is complete

## 🚀 First Time Setup

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd selly-base-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment files**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 🔧 Common Issues

### Commands not found (turbo, next, nest)
**Problem:** You see errors about commands not being recognized.

**Solution:** 
```bash
# Install dependencies from the root directory
npm install
```

### Port already in use
**Problem:** Port 3000 or 3001 is already in use.

**Solution:**
```bash
# Kill processes using the ports (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change ports in .env files
```

### Database connection errors
**Problem:** Cannot connect to PostgreSQL.

**Solution:**
```bash
# Option 1: Start with mock data (no database needed)
npm run dev

# Option 2: Start PostgreSQL with Docker
docker-compose up -d postgres
cp .env.docker apps/api/.env
npm run dev
```

## 📚 More Documentation

- [README.md](README.md) - Complete project documentation
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker setup guide
- [TESTING.md](TESTING.md) - Testing guide
