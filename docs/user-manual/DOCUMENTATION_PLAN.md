# Selly Base User Manual - Documentation Plan

## Overview
This document outlines the comprehensive documentation structure for the Selly Base B2B Prospecting Platform user manual. The manual will cover every user flow, function, and feature with annotated screenshots captured using Playwright.

## Documentation Objectives
1. **Completeness**: Cover 100% of user-facing features and workflows
2. **Clarity**: Use simple, client-friendly language
3. **Visual**: Include annotated screenshots for every step
4. **Professional**: Follow industry documentation standards
5. **Maintainable**: Structured for easy updates

## User Roles & Personas

### 1. Platform Admin
**Responsibilities**: Manage entire platform, tenants, and shared data  
**Access Level**: Unrestricted (all features)  
**Primary Pages**: Platform Admin, Dashboard  
**Key Workflows**:
- Tenant organization management
- Shared company data management
- Cross-tenant user management
- Platform-wide analytics
- System configuration

### 2. Customer Admin
**Responsibilities**: Manage organization users and policies  
**Access Level**: Organization-scoped  
**Primary Pages**: Admin, Dashboard  
**Key Workflows**:
- Organization user management
- Policy configuration
- Organization settings
- Team analytics

### 3. Staff
**Responsibilities**: Database management and reporting  
**Access Level**: Data management  
**Primary Pages**: Dashboard, Lookup, Lists, Imports, Exports, Reports, Staff  
**Key Workflows**:
- Company search and lookup
- Company list management
- Data import/export
- Report generation
- Staff coordination

### 4. User (Regular)
**Responsibilities**: Basic prospecting and research  
**Access Level**: Read-only with limited exports  
**Primary Pages**: Dashboard, Lookup, Lists, Reports  
**Key Workflows**:
- Company search
- Personal list creation
- Basic exports
- View reports

## Documentation Structure

### Part 1: Getting Started (10-15 pages)
- Introduction to Selly Base
- System requirements
- Accessing the platform
- Account types overview
- First-time login guide
- Dashboard overview
- Navigation guide
- Basic terminology

### Part 2: Authentication & Account Management (5-8 pages)
- Login process
- Password management
- Session management
- Logout process
- Access denied scenarios

### Part 3: Dashboard & Analytics (8-12 pages)
- Dashboard layout
- Key metrics explanation
- Activity feed
- Quick actions
- Performance indicators
- Role-specific dashboard views
- Customization options

### Part 4: Company Search & Lookup (15-20 pages)
- Search interface overview
- Basic search
- Advanced search filters
- Search operators
- Filtering options
- Sort and pagination
- Company detail view
- Contact information
- Company activities
- Lead scoring

### Part 5: Company Lists Management (10-15 pages)
- Lists overview
- Creating new lists
- Adding companies to lists
- Removing companies from lists
- Editing list details
- Deleting lists
- Sharing lists (if applicable)
- List analytics

### Part 6: Data Import (12-18 pages)
- Import overview
- Preparing import files
- File format requirements
- Upload process
- Data validation
- Error handling
- Import execution
- Import history
- Canceling imports

### Part 7: Data Export (10-15 pages)
- Export overview
- Creating export requests
- Export formats
- Field selection
- Filter application
- Export status tracking
- Downloading exports
- Export history
- Canceling exports

### Part 8: Reports & Analytics (12-18 pages)
- Reports overview
- Available report types
- Generating reports
- Report parameters
- Report visualization
- Exporting reports
- Scheduled reports (if applicable)
- Report history

### Part 9: Staff Management (8-12 pages)
- Staff overview
- Adding staff members
- Editing staff details
- Staff permissions
- Staff activities
- Removing staff members

### Part 10: Organization Admin Functions (15-20 pages)
- Admin panel overview
- User management
  - Adding users
  - Editing users
  - Assigning roles
  - Deactivating users
- Policy management
  - Data access policies
  - Export policies
  - User policies
- Organization settings
- Integration management
- Activity monitoring

### Part 11: Platform Admin Functions (20-25 pages)
- Platform admin overview
- Tenant management
  - Creating tenants
  - Managing tenant subscriptions
  - Tenant analytics
  - Tenant settings
- Shared data management
  - Uploading shared companies
  - Bulk data operations
  - Data quality management
- Cross-tenant user management
- Platform-wide analytics
- System configuration
- Audit logs

### Part 12: API Testing (5-8 pages)
- API test page overview
- Testing endpoints
- Viewing responses
- Debugging tools

### Part 13: Troubleshooting & FAQ (10-15 pages)
- Common issues and solutions
- Error messages explained
- Performance tips
- Browser compatibility
- Support contact information

### Part 14: Reference & Appendices (8-12 pages)
- Glossary of terms
- Keyboard shortcuts
- Data field reference
- API endpoint reference
- Permission matrix
- Release notes

## Feature Groups for Documentation

### Group A: Core Navigation & Layout
- Main navigation menu
- Breadcrumb navigation
- User profile menu
- Search bar (global)
- Notifications
- Settings access

### Group B: Authentication
- Login page
- Logout confirmation
- Access denied page
- Session timeout

### Group C: Dashboard
- Metrics cards
- Charts and graphs
- Activity timeline
- Quick action buttons

### Group D: Company Management
- Search interface
- Filter panel
- Results table
- Company detail view
- Company edit form
- Contact management
- Activity logging

### Group E: List Management
- Lists overview page
- Create list modal
- List detail view
- Add companies to list
- Remove companies from list
- Edit list modal
- Delete list confirmation

### Group F: Import/Export
- Import wizard
- File upload
- Validation results
- Import progress
- Export request form
- Export queue
- Download interface

### Group G: Reports
- Report selector
- Parameter inputs
- Report generation
- Report viewer
- Export options

### Group H: Administration
- User management table
- User creation form
- Role assignment
- Policy editor
- Settings panels

### Group I: Platform Administration
- Tenant management
- Shared data upload
- System monitoring
- Audit log viewer

## Screenshot Capture Strategy

### Screenshot Types
1. **Full Page**: Complete page view for context
2. **Feature Focus**: Specific UI component or section
3. **Step-by-Step**: Sequential screenshots for workflows
4. **Error States**: Error messages and validation
5. **Success States**: Confirmation messages
6. **Modal/Dialog**: Pop-ups and overlays

### Screenshot Naming Convention
```
{role}-{feature}-{action}-{step}.png

Examples:
- platform-admin-tenant-create-01.png
- staff-import-upload-03.png
- user-search-filter-02.png
- admin-users-create-01.png
```

### Screenshot Annotations
- Red boxes for clickable elements
- Red arrows for navigation flow
- Yellow highlights for important information
- Blue callouts for explanatory notes
- Numbered steps for sequences

## Playwright Automation Strategy

### Test Structure
```typescript
// Screenshot capture for user manual
test.describe('User Manual - {Feature}', () => {
  test.beforeEach(async ({ page }) => {
    // Login as appropriate role
    // Navigate to feature
  });

  test('capture {workflow} workflow', async ({ page }) => {
    // Step 1: Capture initial state
    await page.screenshot({ 
      path: 'screenshots/{role}-{feature}-{step}.png',
      fullPage: true 
    });
    
    // Step 2: Interact and capture
    // ... repeat for each step
  });
});
```

### Coverage Tracking
Create a JSON file tracking:
```json
{
  "feature": "Company Search",
  "workflows": [
    {
      "name": "Basic Search",
      "steps": 5,
      "screenshotsCaptured": 5,
      "documented": true
    }
  ]
}
```

## Quality Standards

### Documentation Writing
- Use active voice
- Keep sentences short (under 20 words)
- Use bullet points for lists
- Include examples
- Define technical terms
- Consistent formatting

### Screenshot Quality
- Minimum resolution: 1920x1080
- Clear, readable text
- Proper color contrast
- Professional sample data
- No sensitive information

### Review Checklist
- [ ] All features covered
- [ ] All user roles documented
- [ ] Screenshots for every step
- [ ] Error scenarios included
- [ ] Success scenarios included
- [ ] Cross-references added
- [ ] Index complete
- [ ] Navigation tested
- [ ] Client-friendly language
- [ ] Professional formatting

## Audit & Coverage Validation

### Automated Coverage Audit Tool
Create a Playwright script that:
1. Crawls all pages and features
2. Compares against documentation
3. Reports missing coverage
4. Suggests areas needing documentation

### Coverage Report Format
```
Feature Coverage Report
=======================
Total Features: 85
Documented: 80
Missing: 5

Missing Coverage:
- Feature: Import Error Recovery
- Feature: Report Scheduling
- Feature: Advanced List Filters
- Feature: User Activity Timeline
- Feature: Tenant Billing Management
```

## Timeline & Milestones

### Phase 1: Structure & Setup (Complete)
- [x] Create directory structure
- [x] Define documentation plan
- [x] Design screenshot strategy

### Phase 2: Core Documentation (15-20 hours)
- [ ] Getting Started section
- [ ] Authentication flows
- [ ] Dashboard documentation
- [ ] Company search documentation

### Phase 3: Advanced Features (20-25 hours)
- [ ] List management
- [ ] Import/Export workflows
- [ ] Reports documentation
- [ ] Staff management

### Phase 4: Administration (15-20 hours)
- [ ] Customer Admin documentation
- [ ] Platform Admin documentation
- [ ] API testing documentation

### Phase 5: Polish & Review (10-15 hours)
- [ ] Troubleshooting guide
- [ ] Reference sections
- [ ] Coverage audit
- [ ] Fill gaps
- [ ] Final review

## Success Criteria

### Completeness
- ✅ Every page documented
- ✅ Every feature documented
- ✅ Every user role covered
- ✅ Every workflow explained

### Quality
- ✅ Professional screenshots
- ✅ Clear, concise writing
- ✅ Client-friendly language
- ✅ Consistent formatting

### Usability
- ✅ Easy navigation
- ✅ Quick reference available
- ✅ Searchable content
- ✅ Cross-references work

### Coverage
- ✅ Automated audit passes
- ✅ No missing features
- ✅ All edge cases covered
- ✅ Error scenarios documented
