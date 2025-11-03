# Introduction to Selly Base

## Overview

Selly Base is a modern B2B prospecting platform that empowers businesses to discover, research, and manage company data efficiently. Built on enterprise-grade technology, it provides tools for lead generation, data management, and business intelligence.

## What is Selly Base?

Selly Base combines a comprehensive company database with powerful search, filtering, and management tools to streamline your prospecting workflow. Whether you're a sales professional looking for leads, a researcher gathering market intelligence, or an administrator managing your team's data access, Selly Base provides the tools you need.

## Key Capabilities

### 🗄️ Comprehensive Database
- Access to 45,000+ companies from verified sources
- Detailed company profiles including industry, size, location
- Contact information and decision-maker data
- Regular data updates and quality maintenance

### 🔍 Intelligent Search
- Full-text search across all company fields
- Advanced filtering by industry, location, company size
- Custom search criteria and saved searches
- Lead scoring to prioritize prospects

### 📊 Analytics & Insights
- Real-time dashboard metrics
- Custom report generation
- Activity tracking and audit trails
- Performance indicators

### 🏢 Multi-Tenant Architecture
- Organization-level data isolation
- Shared company database across tenants
- Tenant-specific configuration options
- Platform-wide administration capabilities

### 👥 Role-Based Access
- Granular permission control
- Four user role types (Platform Admin, Customer Admin, Staff, User)
- Organization-scoped access for admins
- Platform-wide access for super admins

## Who Uses Selly Base?

### Sales Teams
- Identify and research prospects
- Build targeted lead lists
- Track engagement with companies
- Export data for CRM integration

### Marketing Professionals
- Research market segments
- Build targeted campaign lists
- Analyze industry trends
- Generate marketing intelligence

### Business Development
- Identify partnership opportunities
- Research competitive landscape
- Build strategic target lists
- Monitor market changes

### Researchers & Analysts
- Gather market intelligence
- Conduct industry analysis
- Generate business reports
- Track company information

## Platform Benefits

### For Organizations
- **Efficiency:** Streamline prospecting and research workflows
- **Quality:** Access verified, up-to-date company information
- **Control:** Manage team access and data usage policies
- **Insights:** Track team activity and generate analytics
- **Integration:** Export data for use with other tools

### For Users
- **Easy to Use:** Intuitive interface with minimal learning curve
- **Powerful Search:** Find exactly what you need quickly
- **Organized:** Create and manage company lists
- **Flexible:** Export data in multiple formats
- **Mobile-Friendly:** Access from any device

### For Administrators
- **Complete Control:** Manage users, roles, and permissions
- **Visibility:** Track all user activities
- **Flexible Policies:** Configure data access rules
- **Scalable:** Add users and adjust settings as needed
- **Secure:** Enterprise-grade security and audit trails

## Platform Architecture

### Frontend Application
- **Technology:** Next.js 15 with React 18
- **Design:** Modern, responsive user interface
- **Performance:** Fast page loads and smooth interactions
- **Accessibility:** WCAG 2.1 compliant design

### Backend API
- **Technology:** NestJS with Node.js
- **Database:** PostgreSQL 16 with pgvector
- **Security:** JWT-based authentication with refresh tokens
- **Performance:** Optimized queries and caching

### Infrastructure
- **Deployment:** Cloud-hosted with high availability
- **Scalability:** Auto-scaling based on demand
- **Security:** End-to-end encryption
- **Monitoring:** 24/7 system health monitoring

## Core Concepts

### Organizations (Tenants)
Organizations are the top-level entity in Selly Base. Each organization has:
- Its own users and roles
- Data access policies
- Usage quotas and limits
- Custom configuration options

### Users and Roles
Every user belongs to an organization and has one or more roles that determine their permissions:
- **Platform Admin:** Full platform access
- **Customer Admin:** Organization administration
- **Staff:** Data management capabilities
- **User:** Basic search and export

### Company Data
The platform maintains two types of company data:
- **Shared Companies:** 45,000+ companies available to all organizations
- **Organization Companies:** Private company data uploaded by organizations

### Lists
Lists are collections of companies that users create for organizing prospects:
- Personal lists (private to user)
- Shared lists (visible to team)
- Dynamic filtering
- Export capabilities

### Permissions
Granular permissions control who can:
- View company data
- Create and edit lists
- Import/export data
- Manage users
- Configure settings

## Getting Started

Ready to begin? Your next steps are:

1. **Review System Requirements:** [System Requirements](02-system-requirements.md)
2. **Complete First Login:** [First-Time Login Guide](03-first-login.md)
3. **Understand Your Role:** [Understanding Your Role](04-user-roles.md)
4. **Explore the Dashboard:** [Dashboard Overview](06-dashboard.md)

## Need Help?

If you need assistance:
- Check the [FAQ](23-faq.md)
- Review [Troubleshooting](22-troubleshooting.md) 
- Contact support@selly.com
- Ask your organization administrator

---

**Next:** [System Requirements →](02-system-requirements.md)
