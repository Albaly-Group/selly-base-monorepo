# Selly Base - B2B Prospecting Platform

## 🚀 Production-Ready Monorepo ✅

**Selly Base** is a comprehensive B2B prospecting and lead management platform built with modern enterprise architecture. The system enables business professionals to search, filter, and manage company databases with advanced lead scoring, multi-tenant support, and full audit capabilities.

**Current Status**: Production-ready with complete frontend, backend API (40+ endpoints), comprehensive test suite (195+ tests), and Docker-based infrastructure.

### 📁 Project Structure

```
selly-base-monorepo/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React UI components
│   │   └── lib/          # API client and utilities
│   └── api/              # NestJS backend (port 3001)
│       ├── src/
│       │   ├── modules/  # Feature modules (auth, companies, lists, etc.)
│       │   ├── entities/ # TypeORM database entities
│       │   ├── dtos/     # Validation schemas
│       │   └── config/   # Configuration (DB, JWT, etc.)
│       └── test/         # Backend integration tests
├── packages/
│   └── types/            # Shared TypeScript types
├── e2e/                  # End-to-end Playwright tests
├── docs/                 # Documentation
└── docker-compose.yml    # PostgreSQL + pgAdmin setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Docker & Docker Compose (optional - for local database)
- PostgreSQL (optional - works with mock data)

### Installation & Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd selly-base-frontend
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Option A: Start with Mock Data (Fastest)**
   ```bash
   npm run dev
   ```
   This starts:
   - 🌐 Frontend: http://localhost:3000
   - 🚀 Backend API: http://localhost:3001
   - 📚 API Docs: http://localhost:3001/api/docs

4. **Option B: Start with Docker PostgreSQL (Full Backend Testing)**
   ```bash
   # Start PostgreSQL with pgvector
   docker-compose up -d postgres
   
   # Copy Docker environment configuration
   cp .env.docker apps/api/.env
   
   # Start development
   npm run dev
   ```
   
   **Includes:**
   - ✅ PostgreSQL 16 with pgvector extension
   - ✅ Automatic schema initialization
   - ✅ Sample data pre-loaded
   - ✅ All PostgreSQL extensions (pg_trgm, pgcrypto, citext, uuid-ossp)
   
   **Optional:** Start pgAdmin for database management:
   ```bash
   docker-compose --profile with-pgadmin up -d
   # Access at http://localhost:5050 (admin@selly.com / admin123)
   ```
   
   📖 **Detailed Docker Guide:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)
   📚 **Complete Docker Documentation:** See [DOCKER_INDEX.md](DOCKER_INDEX.md)

5. **Test the integration:**
   - Visit http://localhost:3000/api-test
   - Explore API at http://localhost:3001/api/docs
   - Check health: http://localhost:3001/api/health

## 🛠️ Backend API Features (Production Ready)

### ✅ **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Multi-tenant organization-level security
- Role-based access control
- Secure password handling with bcrypt

### ✅ **Companies Management**
- Full CRUD operations with validation
- Advanced search with 12+ filter options
- Bulk operations support
- Data quality scoring algorithm
- Organization-scoped data access

### ✅ **Company Lists Management**
- Create, read, update, delete operations
- Add/remove companies from lists
- List sharing and permissions
- Organization-scoped access control

### ✅ **Enterprise Features**
- **Audit Logging**: Complete operation tracking for compliance
- **Data Validation**: 25+ comprehensive validation rules
- **Error Handling**: Proper HTTP status codes and secure messaging
- **Documentation**: Interactive Swagger UI with OpenAPI 3.0
- **Performance**: Optimized queries with pagination

### 🔧 **API Endpoints**
```
Authentication:
POST   /api/auth/login          # User login
GET    /api/auth/me             # Get user profile
POST   /api/auth/refresh        # Refresh token

Companies:
GET    /api/companies/search    # Advanced search
POST   /api/companies           # Create company
GET    /api/companies/{id}      # Get company details
PUT    /api/companies/{id}      # Update company
DELETE /api/companies/{id}      # Delete company
POST   /api/companies/bulk      # Bulk operations

Lists:
GET    /api/company-lists       # Get lists
POST   /api/company-lists       # Create list
GET    /api/company-lists/{id}  # Get list details
PUT    /api/company-lists/{id}  # Update list
DELETE /api/company-lists/{id}  # Delete list

System:
GET    /api/health              # Health check
GET    /api/docs                # API documentation
```

## 🔧 Development Commands

### Individual Applications
**Backend only:**
```bash
cd apps/api && npm run dev
```

**Frontend only:**
```bash
cd apps/web && npm run dev
```

**Shared types (watch mode):**
```bash
cd packages/types && npm run dev
```

### Build & Production
```bash
npm run build        # Build all applications
npm run build:api    # Build backend only
npm run build:web    # Build frontend only
npm run lint         # Lint all code
npm test             # Run tests (all test suites)
./run-all-tests.sh   # Run comprehensive test suite
```

## 🔧 Environment Configuration

### Development Mode (Default)
The API runs with mock data by default. No database setup required.

**Backend (`apps/api/.env`):**
```env
SKIP_DATABASE=true
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
```

**Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

### Production Mode
For production with PostgreSQL database:

**Backend (`apps/api/.env`):**
```env
SKIP_DATABASE=false
DATABASE_URL=postgresql://user:password@localhost:5432/selly_base?sslmode=require
NODE_ENV=production
JWT_SECRET=your-production-secret
```

> **Note**: You can use either `DATABASE_URL` (recommended) or individual database environment variables (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`). If `DATABASE_URL` is provided, it takes precedence. For cloud databases, include SSL parameters like `?sslmode=require` or `?ssl=true`.

## 🐳 Production Deployment

### Docker Compose + Traefik (Recommended) ⭐

Complete production setup with SSL/TLS, load balancing, and works on both AWS and traditional servers:

```bash
# Quick start (5 minutes)
cp .env.prod.example .env.prod
nano .env.prod  # Configure: DOMAIN, POSTGRES_PASSWORD, JWT_SECRET
./deploy-production.sh

# Access
Frontend: https://sellybase.albaly.jp
API: https://api.sellybase.albaly.jp
Docs: https://api.sellybase.albaly.jp/docs
```

**Features**:
- ✅ Automatic SSL/TLS (Let's Encrypt)
- ✅ Traefik reverse proxy & load balancer
- ✅ Security headers & rate limiting
- ✅ Health checks & zero-downtime updates
- ✅ Automated backups & maintenance
- ✅ Works on AWS EC2, DigitalOcean, Linode, any VPS

**Documentation**: [Quick Start Guide](./DOCKER_PRODUCTION_QUICKSTART.md) | [Full Guide](./DOCKER_COMPOSE_PRODUCTION.md) | [All Options](./DEPLOYMENT_SUMMARY.md)

### Other Deployment Options

- **AWS Amplify**: Serverless deployment - [Guide](./AWS_AMPLIFY_DEPLOYMENT.md)
- **Vercel**: Fast Next.js deployment - [Guide](./VERCEL_DEPLOYMENT.md)
- **Traditional**: Railway, Heroku, etc. - [Guide](./DEPLOYMENT.md)

## 📊 Current Implementation Status

### ✅ **Production Ready**
- **Backend API**: 100% complete with all endpoints (40+ endpoints across 9 modules)
- **Frontend Application**: Complete UI with all features implemented
- **Authentication**: JWT-based auth system with role-based access control
- **Database Layer**: TypeORM entities with PostgreSQL + pgvector support
- **Data Validation**: Comprehensive input validation (25+ validation rules)
- **Security**: Multi-tenant architecture with organization-level isolation
- **Documentation**: Complete Swagger API documentation
- **Audit Logging**: Enterprise-grade tracking for compliance
- **Docker Integration**: Containerized database with automated setup

### ✅ **Testing Suite Complete + Enhanced**
- **Frontend Component Tests**: 27 tests (Jest + React Testing Library)
- **Backend API Tests**: 65+ tests (Playwright)
- **Backend Integration Tests**: 40+ tests (Jest + Docker)
- **End-to-End Tests**: 25+ tests (Playwright)
- **Visual Regression Tests**: 15+ tests (Playwright Screenshots) ✨
- **Accessibility Tests**: 10+ tests (axe-core) ✨
- **Performance Tests**: Lighthouse CI ✨
- **Load Tests**: k6 configuration ✨
- **Contract Tests**: Pact framework ✨
- **Security Tests**: OWASP ZAP ✨
- **Total Test Coverage**: 195+ tests across all layers

**Quick Start**: See [TEST_QUICK_START.md](./TEST_QUICK_START.md)  
**Enhanced Testing**: See [TEST_ENHANCEMENTS.md](./TEST_ENHANCEMENTS.md) ✨  
**Full Documentation**: See [TEST_SUITE_COMPLETE.md](./TEST_SUITE_COMPLETE.md)

### 📋 **Planned**
- **Real-time Features**: WebSocket integration
- **Performance**: Advanced caching and optimization

## 🧪 Testing

The application has a comprehensive test suite covering all layers with enhanced quality assurance:

### Quick Test Commands
```bash
# Core tests
./run-all-tests.sh              # Run all core tests
npm test                        # Run unit/component tests

# E2E tests (UX-focused) 🎭
npm run test:e2e:docker         # Run E2E tests with Docker (RECOMMENDED)
npm run test:e2e                # Run E2E tests (requires services running)
npm run test:e2e:ui             # Debug E2E tests interactively
npm run test:e2e:report         # View detailed E2E test report

# Enhanced tests ✨
npm run test:visual             # Visual regression
npm run test:a11y               # Accessibility (WCAG 2.1)
npm run test:performance        # Performance (Lighthouse)
npm run test:load               # Load testing (k6)
npm run test:contract           # API contract testing (Pact)
npm run test:security           # Security scan (OWASP ZAP)
npm run test:coverage           # Code coverage report

# All tests
npm run test:all                # Run comprehensive test suite

# Production Readiness 🚀
npm run test:production-ready   # Complete production validation
npm run test:production-ready:quick  # Quick validation (skip core tests)
npm run test:production-ready:e2e-only  # E2E production test only
```

### Test Coverage
- **Frontend**: 27 component tests
- **Backend API**: 65+ API tests
- **Integration**: 40+ database tests
- **E2E**: 78 UX-focused workflow tests 🎭
- **Production Ready**: Comprehensive validation suite 🚀 **NEW**
- **Visual Regression**: 15+ screenshot tests ✨
- **Accessibility**: 10+ WCAG compliance tests ✨
- **Total**: 235+ tests

**E2E Test Highlights:**
- ✅ 100% route coverage (10 major routes)
- ✅ UX-focused testing approach
- ✅ Semantic, accessible selectors
- ✅ Complete Docker environment
- ✅ Automated setup and cleanup

**Production Ready Test Highlights:** 🚀
- ✅ Infrastructure health validation
- ✅ Security & authentication checks
- ✅ Core functionality verification
- ✅ Performance benchmarking
- ✅ Data integrity validation
- ✅ Production configuration checks

### Enhanced Testing Features ✨
- **Visual Regression**: Detect unintended UI changes
- **Performance**: Monitor speed and Core Web Vitals
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Load Testing**: Verify system under high traffic
- **Contract Testing**: API contract validation
- **Security**: OWASP vulnerability scanning
- **Coverage**: Target 90%+ code coverage

### Documentation

**E2E Testing (UX-Focused) 🎭 NEW**
- ⚡ [E2E Quick Start](./E2E_QUICK_START.md) - Run E2E tests in 1 command
- 📖 [E2E Docker Guide](./E2E_DOCKER_GUIDE.md) - Complete Docker setup guide
- 🎨 [UX Improvements](./E2E_UX_IMPROVEMENTS.md) - What changed and why
- 📚 [E2E Documentation Index](./E2E_DOCUMENTATION_INDEX.md) - Navigation hub
- ✅ [Implementation Summary](./E2E_IMPLEMENTATION_COMPLETE.md) - Full summary

**General Testing**
- 📖 [Quick Start Guide](./TEST_QUICK_START.md) - Get started with testing
- ✨ [Test Enhancements](./TEST_ENHANCEMENTS.md) - Enhanced testing capabilities
- ⚡ [Enhancements Quick Start](./TEST_ENHANCEMENTS_QUICK_START.md) - Quick reference
- 📋 [Documentation Index](./TEST_DOCUMENTATION_INDEX.md) - All test documentation
- 📚 [Complete Documentation](./TEST_SUITE_COMPLETE.md) - Full test suite details
- 🏗️ [Test Architecture](./TESTING_ARCHITECTURE.md) - Testing strategy
- 🐳 [Docker Testing](./DOCKER_E2E_TESTING.md) - Backend integration tests

## 📚 Documentation

- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Architecture Guide**: [docs/TURBOREPO_ARCHITECTURE.md](./docs/TURBOREPO_ARCHITECTURE.md)
- **API Documentation**: http://localhost:3001/api/docs (when running)
- **Company Lists**: [docs/COMPANY_LISTS_IMPLEMENTATION.md](./docs/COMPANY_LISTS_IMPLEMENTATION.md)
- **Deployment Guides**:
  - **Docker Compose Production (Traefik)**: [DOCKER_PRODUCTION_QUICKSTART.md](./DOCKER_PRODUCTION_QUICKSTART.md) ⭐ **New - Production Ready**
  - **Full-Stack Vercel Deployment**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
  - **AWS Amplify Deployment**: [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md)
  - **Deployment Options Summary**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
  - **Traditional Deployments**: [DEPLOYMENT.md](./DEPLOYMENT.md) | [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)

## 🤝 Contributing

1. Follow the established monorepo structure
2. Backend changes go in `apps/api/`
3. Frontend changes go in `apps/web/`
4. Shared types go in `packages/types/`
5. Update documentation for significant changes

## 📈 Performance & Quality

### Performance Metrics
- **API Response Time**: < 100ms for most endpoints
- **Database Queries**: Optimized with proper indexing (pgvector for embeddings)
- **Concurrent Users**: Architecture supports 1000+ concurrent users
- **Test Coverage**: 195+ tests across all layers

### Quality Assurance
- **Code Quality**: TypeScript strict mode, ESLint, Prettier
- **Data Quality**: Automated scoring algorithm for company records
- **Security**: OWASP vulnerability scanning, JWT authentication
- **Accessibility**: WCAG 2.1 Level AA compliance testing
- **Performance Testing**: Lighthouse CI (target: 90+ score)

---

## 🏗️ Architecture Overview

### Monorepo Structure
This project uses **Turborepo** for efficient monorepo management with clear separation of concerns:

### Applications

**Frontend (`apps/web`)** - Next.js 15
- **Port**: 3000
- **Framework**: Next.js with App Router
- **UI**: shadcn/ui + Tailwind CSS v4
- **Features**: Complete B2B prospecting interface
- **Authentication**: Role-based access (User/Staff/Platform Admin)

**Backend (`apps/api`)** - NestJS
- **Port**: 3001
- **Framework**: NestJS with TypeORM
- **Database**: PostgreSQL 16 with pgvector
- **Features**: 40+ REST API endpoints across 9 modules
- **Documentation**: Interactive Swagger UI at `/api/docs`

**Shared Types (`packages/types`)**
- TypeScript definitions shared between frontend and backend
- Ensures type safety across the monorepo

### Key Features

#### Core Functionality
- **Company Search & Management**: Advanced filtering with 12+ search options
- **Company Lists**: Create, manage, and share company lists
- **Lead Scoring**: Smart algorithm with configurable weights
- **Bulk Operations**: Import/export with CSV support
- **Dashboard Analytics**: Real-time metrics and reports
- **Platform Administration**: Multi-tenant management

#### Enterprise Features
- **Multi-tenant Architecture**: Organization-level data isolation
- **Audit Logging**: Complete operation tracking for compliance
- **Role-Based Access Control**: User, Staff, and Platform Admin roles
- **Data Validation**: 25+ comprehensive validation rules
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

### Demo Accounts
\`\`\`
User:           user@selly.com  / password123
Staff:          staff@selly.com / staff123
Platform Admin: admin@selly.com / admin123
\`\`\`

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **State Management**: React Query + Context API
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 16 with pgvector extension
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.0

### DevOps & Tools
- **Monorepo**: Turborepo
- **Package Manager**: npm
- **Testing**: Jest, Playwright, React Testing Library
- **Linting**: ESLint + Prettier
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### Enhanced Testing Suite ✨
- **Visual Regression**: lost-pixel
- **Performance**: Lighthouse CI
- **Accessibility**: axe-core
- **Load Testing**: k6
- **Contract Testing**: Pact
- **Security**: OWASP ZAP
