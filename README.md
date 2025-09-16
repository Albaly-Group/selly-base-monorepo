# Selly Base - B2B Prospecting Platform

## Project Overview
Selly Base is a comprehensive B2B prospecting and lead management platform designed for business professionals and staff administrators. The platform enables users to search, filter, and manage company databases with advanced lead scoring capabilities.

## Current Implementation Status

### ✅ Completed Features

#### Core Infrastructure
- **Authentication System**: Role-based authentication with user/staff/admin roles
- **Route Protection**: Middleware-based route protection with role validation
- **Modern UI**: Professional design system with shadcn/ui components
- **Responsive Layout**: Mobile-first design with proper navigation

#### User Features (TR.001 & TR.002)
- **Company Lookup Page** (`/lookup`): 
  - Global search bar with keyword, company name, and registered number search
  - Advanced filtering (industry, province, company size, contact status)
  - Results table with all required fields
  - Add to list functionality with dialog
  - Export capabilities
  - Tab navigation (All Companies / My Lists)

#### List Management (TR.001 & TR.002)
- **List Management Page** (`/lists`):
  - List content table with company records
  - Lead scoring with smart filtering
  - Partial matching algorithm
  - Row-level and page-level actions
  - Export ranked lists

#### Staff Features (TR.001)
- **Staff Dashboard** (`/staff`):
  - Database management table
  - Approve/Reject workflow
  - Bulk operations
  - Company editing capabilities
  - Import/Export functionality

### 🔧 Technical Implementation

#### Data Layer
- **Mock Data System**: Comprehensive mock data with 5+ sample companies
- **TypeScript Types**: Full type safety with interfaces for all entities
- **Utility Functions**: Search, filter, and lead scoring algorithms

#### Authentication
- **Demo Accounts**:
  - User: `user@selly.com` / `password123`
  - Staff: `staff@selly.com` / `staff123`
  - Admin: `admin@selly.com` / `admin123`

## Open Questions & Decisions

### 🤔 Ambiguities Resolved

#### 1. Navigation Structure
**Question**: Should the navigation be in a sidebar or top navigation?
**Options**: 
- A) Top navigation bar
- B) Sidebar navigation
- C) Hybrid approach

**DECISION**: Top navigation bar for simplicity and mobile responsiveness
**Rationale**: Matches the requirements specification layout descriptions and provides better mobile experience

#### 2. Data Persistence
**Question**: How should user lists and preferences be stored without database integration?
**Options**:
- A) localStorage only
- B) sessionStorage for temporary data
- C) Hybrid localStorage + sessionStorage

**DECISION**: localStorage for user session and lists, with fallback handling
**Rationale**: Provides persistence across browser sessions while maintaining demo functionality

#### 3. Lead Scoring Algorithm
**Question**: Exact scoring weights not specified in requirements
**Options**:
- A) Equal weights for all criteria
- B) Industry-focused weighting
- C) Balanced approach with data completeness bonus

**DECISION**: Balanced approach (Industry: 20pts, Province: 15pts, Size: 10pts, Status: 10pts, + completeness bonus)
**Rationale**: Reflects business importance hierarchy while rewarding data quality

#### 4. Export Format
**Question**: Requirements mention "Excel/CSV" but don't specify default
**Options**:
- A) CSV only (simpler)
- B) Excel only (richer format)
- C) User choice between formats

**DECISION**: CSV format with proper headers and UTF-8 encoding
**Rationale**: Universal compatibility and easier implementation for demo

### 📋 TODO Items

#### High Priority
- [ ] **TODO(spec-needed)**: Clarify exact TSIC industry categories from DBD datawarehouse
- [ ] **TODO(spec-needed)**: Define complete list of Thai provinces for filtering
- [ ] **TODO(spec-needed)**: Specify company size classification criteria (S/M/L thresholds)

#### Medium Priority  
- [ ] **TODO(enhancement)**: Add pagination for large result sets
- [ ] **TODO(enhancement)**: Implement advanced search operators (AND, OR, quotes)
- [ ] **TODO(enhancement)**: Add keyboard shortcuts for power users

#### Low Priority
- [ ] **TODO(polish)**: Add loading states for all async operations
- [ ] **TODO(polish)**: Implement toast notifications for user feedback
- [ ] **TODO(accessibility)**: Add ARIA labels for screen readers

## Architecture Decisions

### Component Structure
\`\`\`
app/
├── page.tsx              # Home/Login page
├── lookup/page.tsx       # Company lookup (TR.001)
├── lists/page.tsx        # List management (TR.002)
├── staff/page.tsx        # Staff dashboard (TR.001 Staff)
└── layout.tsx            # Root layout with auth

components/
├── company-*.tsx         # Company-related components
├── list-*.tsx           # List management components
├── staff-*.tsx          # Staff-specific components
└── ui/                  # Reusable UI components
\`\`\`

### State Management
- **Authentication**: React Context with localStorage persistence
- **Component State**: useState for local component state
- **Data Fetching**: Direct function calls to mock data utilities

### Styling Approach
- **Design System**: shadcn/ui with Tailwind CSS v4
- **Color Palette**: Professional blue-gray theme with high contrast
- **Typography**: Geist Sans for UI, Geist Mono for code/data
- **Responsive**: Mobile-first with breakpoint-specific layouts

## Getting Started

### Demo Accounts
\`\`\`
User Account:  user@selly.com  / password123
Staff Account: staff@selly.com / staff123
Admin Account: admin@selly.com / admin123
\`\`\`

### Key Features to Test
1. **Company Search**: Try searching for "ABC", "Bangkok", or "0105564111698"
2. **Filtering**: Use the filters dropdown to narrow results
3. **List Management**: Add companies to lists and use lead scoring
4. **Staff Functions**: Login as staff to approve/reject companies
5. **Export**: Test CSV export functionality

## Production Readiness Checklist

### ✅ Completed
- [x] TypeScript implementation with strict types
- [x] Responsive design with mobile support
- [x] Role-based authentication and authorization
- [x] Error boundaries and loading states
- [x] Accessible UI components
- [x] SEO-friendly metadata

### 🔄 In Progress
- [ ] Database integration (currently using mock data)
- [ ] API endpoints for CRUD operations
- [ ] Real authentication with JWT/sessions
- [ ] File upload for bulk imports
- [ ] Email notifications for staff workflows

### 📝 Future Enhancements
- [ ] Advanced analytics and reporting
- [ ] Integration with external data sources
- [ ] Automated lead scoring with ML
- [ ] Multi-language support (Thai/English)
- [ ] Mobile app companion

## Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: React Context + localStorage
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono
