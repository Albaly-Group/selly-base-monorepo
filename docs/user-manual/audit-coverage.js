"use strict";
/**
 * Documentation Coverage Audit Tool
 *
 * This script audits the user manual documentation coverage by:
 * 1. Scanning all features in the application
 * 2. Checking which features are documented
 * 3. Identifying missing documentation
 * 4. Generating a coverage report
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = void 0;
exports.auditCoverage = auditCoverage;
exports.generateMarkdownReport = generateMarkdownReport;
var fs = require("fs");
var path = require("path");
// Define all features that should be documented
var FEATURES = [
    // Authentication Features
    {
        name: 'User Login',
        category: 'Authentication',
        pages: ['/login'],
        roles: ['all'],
        workflows: ['Login with email/password', 'Remember me', 'Session management'],
        documented: true,
        guideFile: '05-authentication.md',
    },
    {
        name: 'User Logout',
        category: 'Authentication',
        pages: ['/logout'],
        roles: ['all'],
        workflows: ['Logout', 'Session termination', 'Clear local storage'],
        documented: true,
        guideFile: '05-authentication.md',
    },
    {
        name: 'Password Reset',
        category: 'Authentication',
        pages: ['/login'],
        roles: ['all'],
        workflows: ['Request reset link', 'Reset password', 'Email verification'],
        documented: true,
        guideFile: '05-authentication.md',
    },
    {
        name: 'Access Denied Handling',
        category: 'Authentication',
        pages: ['/access-denied'],
        roles: ['all'],
        workflows: ['View access denied page', 'Understand restrictions', 'Request access'],
        documented: true,
        guideFile: '05-authentication.md',
    },
    // Dashboard Features
    {
        name: 'Dashboard Overview',
        category: 'Dashboard',
        pages: ['/dashboard'],
        roles: ['all'],
        workflows: ['View metrics', 'Check activity', 'Quick actions'],
        documented: true,
        guideFile: '06-dashboard.md',
    },
    {
        name: 'Dashboard Metrics',
        category: 'Dashboard',
        pages: ['/dashboard'],
        roles: ['all'],
        workflows: ['View KPIs', 'Compare trends', 'Drill down'],
        documented: true,
        guideFile: '06-dashboard.md',
    },
    {
        name: 'Activity Feed',
        category: 'Dashboard',
        pages: ['/dashboard'],
        roles: ['all'],
        workflows: ['View recent activity', 'Filter activity', 'Search activity'],
        documented: true,
        guideFile: '06-dashboard.md',
    },
    {
        name: 'Dashboard Customization',
        category: 'Dashboard',
        pages: ['/dashboard'],
        roles: ['all'],
        workflows: ['Rearrange widgets', 'Show/hide widgets', 'Save preferences'],
        documented: true,
        guideFile: '06-dashboard.md',
    },
    // Company Search Features
    {
        name: 'Basic Company Search',
        category: 'Company Management',
        pages: ['/lookup'],
        roles: ['all'],
        workflows: ['Text search', 'View results', 'Sort results'],
        documented: true,
        guideFile: '07-company-search.md',
    },
    {
        name: 'Advanced Filtering',
        category: 'Company Management',
        pages: ['/lookup'],
        roles: ['all'],
        workflows: ['Apply filters', 'Combine filters', 'Save filter sets'],
        documented: true,
        guideFile: '07-company-search.md',
    },
    {
        name: 'Company Detail View',
        category: 'Company Management',
        pages: ['/lookup/:id'],
        roles: ['all'],
        workflows: ['View company profile', 'See contacts', 'Check activities'],
        documented: true,
        guideFile: '07-company-search.md',
    },
    {
        name: 'Saved Searches',
        category: 'Company Management',
        pages: ['/lookup'],
        roles: ['all'],
        workflows: ['Save search criteria', 'Load saved search', 'Manage searches'],
        documented: true,
        guideFile: '07-company-search.md',
    },
    {
        name: 'Lead Scoring',
        category: 'Company Management',
        pages: ['/lookup'],
        roles: ['all'],
        workflows: ['View lead scores', 'Sort by score', 'Understand scoring'],
        documented: true,
        guideFile: '07-company-search.md',
    },
    // List Management Features
    {
        name: 'View Company Lists',
        category: 'List Management',
        pages: ['/lists'],
        roles: ['all'],
        workflows: ['Browse lists', 'Search lists', 'Sort lists'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Create Company List',
        category: 'List Management',
        pages: ['/lists'],
        roles: ['all'],
        workflows: ['Create new list', 'Add description', 'Set sharing'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Add Companies to List',
        category: 'List Management',
        pages: ['/lists/:id'],
        roles: ['all'],
        workflows: ['Search companies', 'Select companies', 'Add to list'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Remove Companies from List',
        category: 'List Management',
        pages: ['/lists/:id'],
        roles: ['all'],
        workflows: ['Select companies', 'Remove from list', 'Confirm removal'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Share Lists',
        category: 'List Management',
        pages: ['/lists/:id'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Select users', 'Set permissions', 'Send invites'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Edit List Details',
        category: 'List Management',
        pages: ['/lists/:id'],
        roles: ['all'],
        workflows: ['Update name', 'Change description', 'Modify tags'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Delete Lists',
        category: 'List Management',
        pages: ['/lists'],
        roles: ['all'],
        workflows: ['Select list', 'Confirm deletion', 'Remove permanently'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    {
        name: 'Export List',
        category: 'List Management',
        pages: ['/lists/:id'],
        roles: ['all'],
        workflows: ['Select format', 'Choose fields', 'Download export'],
        documented: true,
        guideFile: '08-company-lists.md',
    },
    // Import Features
    {
        name: 'Upload Import File',
        category: 'Data Import',
        pages: ['/imports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Select file', 'Upload', 'Verify format'],
        documented: false,
    },
    {
        name: 'Map Import Columns',
        category: 'Data Import',
        pages: ['/imports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Match columns', 'Preview mapping', 'Validate data'],
        documented: false,
    },
    {
        name: 'Validate Import Data',
        category: 'Data Import',
        pages: ['/imports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Check errors', 'Review warnings', 'Fix issues'],
        documented: false,
    },
    {
        name: 'Execute Import',
        category: 'Data Import',
        pages: ['/imports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Confirm import', 'Monitor progress', 'View results'],
        documented: false,
    },
    {
        name: 'View Import History',
        category: 'Data Import',
        pages: ['/imports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Browse history', 'View details', 'Download logs'],
        documented: false,
    },
    // Export Features
    {
        name: 'Create Export Request',
        category: 'Data Export',
        pages: ['/exports'],
        roles: ['all'],
        workflows: ['Select data', 'Choose format', 'Submit request'],
        documented: false,
    },
    {
        name: 'Configure Export Fields',
        category: 'Data Export',
        pages: ['/exports'],
        roles: ['all'],
        workflows: ['Select fields', 'Order columns', 'Set options'],
        documented: false,
    },
    {
        name: 'Download Export',
        category: 'Data Export',
        pages: ['/exports'],
        roles: ['all'],
        workflows: ['Wait for completion', 'Download file', 'Verify data'],
        documented: false,
    },
    {
        name: 'View Export History',
        category: 'Data Export',
        pages: ['/exports'],
        roles: ['all'],
        workflows: ['Browse exports', 'Redownload', 'Delete exports'],
        documented: false,
    },
    {
        name: 'Cancel Export',
        category: 'Data Export',
        pages: ['/exports'],
        roles: ['all'],
        workflows: ['Find pending export', 'Cancel request', 'Confirm cancellation'],
        documented: false,
    },
    // Reports Features
    {
        name: 'View Reports',
        category: 'Reports & Analytics',
        pages: ['/reports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Browse reports', 'Select report', 'View data'],
        documented: false,
    },
    {
        name: 'Generate Custom Report',
        category: 'Reports & Analytics',
        pages: ['/reports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Configure parameters', 'Generate report', 'View results'],
        documented: false,
    },
    {
        name: 'Export Report Data',
        category: 'Reports & Analytics',
        pages: ['/reports'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Select format', 'Export report', 'Download file'],
        documented: false,
    },
    {
        name: 'Schedule Reports',
        category: 'Reports & Analytics',
        pages: ['/reports'],
        roles: ['customer_admin', 'platform_admin'],
        workflows: ['Set schedule', 'Configure recipients', 'Activate schedule'],
        documented: false,
    },
    // Staff Management Features
    {
        name: 'View Staff Members',
        category: 'Staff Management',
        pages: ['/staff'],
        roles: ['staff', 'customer_admin', 'platform_admin'],
        workflows: ['Browse staff', 'Search staff', 'View details'],
        documented: false,
    },
    {
        name: 'Add Staff Member',
        category: 'Staff Management',
        pages: ['/staff'],
        roles: ['customer_admin', 'platform_admin'],
        workflows: ['Enter details', 'Assign role', 'Send invitation'],
        documented: false,
    },
    {
        name: 'Edit Staff Details',
        category: 'Staff Management',
        pages: ['/staff/:id'],
        roles: ['customer_admin', 'platform_admin'],
        workflows: ['Update information', 'Change role', 'Save changes'],
        documented: false,
    },
    {
        name: 'Remove Staff Member',
        category: 'Staff Management',
        pages: ['/staff'],
        roles: ['customer_admin', 'platform_admin'],
        workflows: ['Select staff', 'Confirm removal', 'Revoke access'],
        documented: false,
    },
    // Customer Admin Features
    {
        name: 'Manage Organization Users',
        category: 'Organization Admin',
        pages: ['/admin'],
        roles: ['customer_admin'],
        workflows: ['View users', 'Add users', 'Edit users', 'Deactivate users'],
        documented: false,
    },
    {
        name: 'Configure Data Policies',
        category: 'Organization Admin',
        pages: ['/admin'],
        roles: ['customer_admin'],
        workflows: ['Set access rules', 'Configure exports', 'Set limits'],
        documented: false,
    },
    {
        name: 'Manage User Roles',
        category: 'Organization Admin',
        pages: ['/admin'],
        roles: ['customer_admin'],
        workflows: ['Assign roles', 'Create custom roles', 'Set permissions'],
        documented: false,
    },
    {
        name: 'Organization Settings',
        category: 'Organization Admin',
        pages: ['/admin'],
        roles: ['customer_admin'],
        workflows: ['Update settings', 'Configure integrations', 'Set preferences'],
        documented: false,
    },
    // Platform Admin Features
    {
        name: 'Manage Tenants',
        category: 'Platform Administration',
        pages: ['/platform-admin'],
        roles: ['platform_admin'],
        workflows: ['Create tenant', 'Edit tenant', 'Manage subscriptions'],
        documented: false,
    },
    {
        name: 'Upload Shared Companies',
        category: 'Platform Administration',
        pages: ['/platform-admin'],
        roles: ['platform_admin'],
        workflows: ['Upload file', 'Validate data', 'Publish to tenants'],
        documented: false,
    },
    {
        name: 'Cross-Tenant User Management',
        category: 'Platform Administration',
        pages: ['/platform-admin'],
        roles: ['platform_admin'],
        workflows: ['View all users', 'Manage access', 'Reset passwords'],
        documented: false,
    },
    {
        name: 'Platform Analytics',
        category: 'Platform Administration',
        pages: ['/platform-admin'],
        roles: ['platform_admin'],
        workflows: ['View metrics', 'Generate reports', 'Monitor health'],
        documented: false,
    },
    {
        name: 'Audit Logs',
        category: 'Platform Administration',
        pages: ['/platform-admin'],
        roles: ['platform_admin'],
        workflows: ['View logs', 'Filter events', 'Export logs'],
        documented: false,
    },
    // API Testing
    {
        name: 'API Test Interface',
        category: 'Developer Tools',
        pages: ['/api-test'],
        roles: ['platform_admin', 'customer_admin'],
        workflows: ['Test endpoints', 'View responses', 'Debug issues'],
        documented: false,
    },
];
exports.FEATURES = FEATURES;
function auditCoverage() {
    var guideDir = path.join(__dirname, 'guides');
    var documentedFeatures = FEATURES.filter(function (f) { return f.documented; });
    var missingFeatures = FEATURES.filter(function (f) { return !f.documented; });
    var missingByCategory = {};
    missingFeatures.forEach(function (feature) {
        if (!missingByCategory[feature.category]) {
            missingByCategory[feature.category] = [];
        }
        missingByCategory[feature.category].push(feature.name);
    });
    var coveragePercentage = (documentedFeatures.length / FEATURES.length) * 100;
    var recommendations = [];
    // Generate recommendations
    if (coveragePercentage < 50) {
        recommendations.push('CRITICAL: Less than 50% documentation coverage. Prioritize core features.');
    }
    else if (coveragePercentage < 75) {
        recommendations.push('WARNING: Documentation coverage below 75%. Focus on missing features.');
    }
    else if (coveragePercentage < 90) {
        recommendations.push('GOOD: Documentation coverage above 75%. Complete remaining features.');
    }
    else {
        recommendations.push('EXCELLENT: High documentation coverage. Focus on quality and screenshots.');
    }
    // Category-specific recommendations
    Object.entries(missingByCategory).forEach(function (_a) {
        var category = _a[0], features = _a[1];
        if (features.length > 0) {
            recommendations.push("".concat(category, ": ").concat(features.length, " features need documentation"));
        }
    });
    var report = {
        timestamp: new Date().toISOString(),
        totalFeatures: FEATURES.length,
        documentedFeatures: documentedFeatures.length,
        missingFeatures: missingFeatures.length,
        coveragePercentage: Math.round(coveragePercentage * 100) / 100,
        features: FEATURES,
        missingByCategory: missingByCategory,
        recommendations: recommendations,
    };
    return report;
}
function generateMarkdownReport(report) {
    var markdown = "# User Manual Coverage Report\n\n";
    markdown += "**Generated:** ".concat(report.timestamp, "\n\n");
    markdown += "## Summary\n\n";
    markdown += "- **Total Features:** ".concat(report.totalFeatures, "\n");
    markdown += "- **Documented:** ".concat(report.documentedFeatures, " (").concat(report.coveragePercentage, "%)\n");
    markdown += "- **Missing:** ".concat(report.missingFeatures, "\n\n");
    markdown += "## Coverage by Category\n\n";
    markdown += "| Category | Total | Documented | Missing | Coverage |\n";
    markdown += "|----------|-------|------------|---------|----------|\n";
    var categories = Array.from(new Set(FEATURES.map(function (f) { return f.category; })));
    categories.forEach(function (category) {
        var categoryFeatures = FEATURES.filter(function (f) { return f.category === category; });
        var documented = categoryFeatures.filter(function (f) { return f.documented; }).length;
        var coverage = Math.round((documented / categoryFeatures.length) * 100);
        var missing = categoryFeatures.length - documented;
        markdown += "| ".concat(category, " | ").concat(categoryFeatures.length, " | ").concat(documented, " | ").concat(missing, " | ").concat(coverage, "% |\n");
    });
    markdown += "\n## Missing Features\n\n";
    Object.entries(report.missingByCategory).forEach(function (_a) {
        var category = _a[0], features = _a[1];
        markdown += "### ".concat(category, "\n\n");
        features.forEach(function (feature) {
            markdown += "- [ ] ".concat(feature, "\n");
        });
        markdown += "\n";
    });
    markdown += "## Recommendations\n\n";
    report.recommendations.forEach(function (rec) {
        markdown += "- ".concat(rec, "\n");
    });
    return markdown;
}
// Run audit if executed directly
if (require.main === module) {
    var report = auditCoverage();
    var markdown = generateMarkdownReport(report);
    // Save JSON report
    var jsonPath = path.join(__dirname, 'coverage-audit.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log("\u2705 JSON report saved: ".concat(jsonPath));
    // Save Markdown report
    var mdPath = path.join(__dirname, 'COVERAGE_AUDIT.md');
    fs.writeFileSync(mdPath, markdown);
    console.log("\u2705 Markdown report saved: ".concat(mdPath));
    // Console output
    console.log("\n\uD83D\uDCCA Coverage Report");
    console.log("==================");
    console.log("Total Features: ".concat(report.totalFeatures));
    console.log("Documented: ".concat(report.documentedFeatures, " (").concat(report.coveragePercentage, "%)"));
    console.log("Missing: ".concat(report.missingFeatures));
    console.log("\nSee ".concat(mdPath, " for full report"));
}
