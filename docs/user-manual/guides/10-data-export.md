# Data Export

Export company data for use in other applications, reporting, or backup purposes.

## Overview

Data Export allows you to:
- Export company lists
- Export search results
- Choose specific fields
- Select multiple formats
- Download exported files

**Available to:** All user roles (with varying limits)

**URL:** `/exports`

📸 **Screenshots:**
- `platform-admin-exports-main-view-01.png`
- `staff-exports-main-view-01.png`

## Export Page Overview

1. **Create Export Section:** Start new export
2. **Export Queue:** Pending exports
3. **Completed Exports:** Ready to download
4. **Export History:** Past exports

## Creating an Export Request

### Quick Export

**From Search Results:**
1. Search for companies
2. Select companies (or all)
3. Click "Export" button
4. Choose "Quick CSV Export"
5. File downloads immediately

**From List:**
1. Open a company list
2. Click "Export List"
3. Select format
4. Download begins

### Custom Export

**Advanced Export Configuration:**

**Step 1: Select Data Source**
- Current search results
- Specific company list
- Selected companies
- All accessible companies

**Step 2: Choose Export Format**
- **CSV:** Most compatible, works with Excel
- **Excel (.xlsx):** Formatted spreadsheet
- **JSON:** For developers/APIs
- **PDF:** Formatted report

**Step 3: Select Fields**

**Required Fields** (always included):
- Company Name
- Company ID
- Basic info

**Optional Fields** (choose):
- Contact Information
- Financial Data
- Location Details
- Industry Classification
- Tags and Categories
- Custom Fields
- Activity History

💡 **Tip:** Only select fields you need to reduce file size.

**Step 4: Configure Options**

**CSV Options:**
- Delimiter: Comma, semicolon, tab
- Quote character
- Header row (yes/no)
- Date format
- Number format

**Excel Options:**
- Sheet name
- Auto-fit columns
- Freeze header row
- Apply formatting

**JSON Options:**
- Pretty print
- Include metadata
- Nest related objects

**Step 5: Submit Export Request**
- Review configuration
- Click "Create Export"
- Export added to queue

📸 **Screenshot:** Export configuration (to be captured)

## Managing Export Queue

### Pending Exports

**Export Status:**
- **Queued:** Waiting to process
- **Processing:** Currently exporting
- **Completed:** Ready to download
- **Failed:** Error occurred

**Queue Information:**
- Position in queue
- Estimated time
- File size estimate
- Expiration date

### Monitoring Progress

**Progress Indicators:**
- Progress bar (percentage)
- Rows processed
- Estimated time remaining
- Current activity

### Priority Queue

Some roles can prioritize exports:
- Platform Admin: Highest priority
- Customer Admin: High priority
- Staff: Normal priority
- User: Standard priority

## Downloading Exports

### Download Completed Export

**When export completes:**
1. Notification appears
2. Export moves to "Completed" section
3. Download button enabled
4. Click "Download" to get file

**Download Options:**
- Direct download to browser
- Copy download link
- Email download link (if configured)

**File Naming:**
- Format: `export-{date}-{id}.{ext}`
- Example: `export-2025-11-03-12345.csv`

### Download Expiration

**Important:**
- Exports expire after 7 days
- Download before expiration
- Receive reminder 24 hours before
- Re-run export if expired

📸 **Screenshot:** Export download interface (to be captured)

## Export History

### Viewing Past Exports

**History Table Shows:**
- Export name/description
- Creation date/time
- File format
- Row count
- File size
- Status
- Expiration date

**Sorting Options:**
- By date (newest/oldest)
- By size
- By status
- By format

**Filtering:**
- Date range
- Format type
- Status (completed/failed/expired)
- Created by (admins only)

### Re-downloading Exports

If export not expired:
1. Find in history
2. Click "Download" button
3. File downloads again

### Re-running Exports

To create identical export:
1. Find in history
2. Click "Run Again"
3. Export created with same settings
4. New file generated

## Canceling Exports

### Cancel Pending Export

**Before processing completes:**
1. Find export in queue
2. Click "Cancel" button
3. Confirm cancellation
4. Export removed from queue

**After cancellation:**
- Export marked as cancelled
- No file generated
- Appears in history
- Can create new export

⚠️ **Note:** Cannot cancel after processing completes.

## Export Limits and Permissions

### By Role

**User:**
- Max 10 exports per day
- Max 1,000 rows per export
- CSV and Excel only
- 7-day retention

**Staff:**
- Max 50 exports per day
- Max 10,000 rows per export
- All formats
- 14-day retention

**Customer Admin:**
- Max 100 exports per day
- Max 50,000 rows per export
- All formats
- 30-day retention

**Platform Admin:**
- Unlimited exports
- Unlimited rows
- All formats
- 90-day retention

### Organization Policies

Administrators can set:
- Daily export limits
- Row limits per export
- Allowed formats
- Retention periods
- Required approvals

## Export Best Practices

### Efficient Exports

📋 **Recommendations:**

1. **Filter Before Export**
   - Narrow results first
   - Only export what you need
   - Reduces file size and processing time

2. **Select Necessary Fields**
   - Don't export all fields
   - Choose relevant columns only
   - Faster processing

3. **Use Appropriate Format**
   - CSV for data analysis
   - Excel for formatted viewing
   - JSON for integrations

4. **Schedule Large Exports**
   - Export during off-peak hours
   - Break into smaller exports
   - Monitor queue status

### Data Security

🔒 **Protect Exported Data:**

1. **Download Promptly**
   - Download within 24 hours
   - Delete after use
   - Don't share download links

2. **Secure Storage**
   - Store in secure location
   - Encrypt sensitive data
   - Follow data policies

3. **Proper Disposal**
   - Delete when no longer needed
   - Securely wipe files
   - Empty recycle bin

## Troubleshooting

### Export Failed

**Common Reasons:**
- Too many rows selected
- Server timeout
- Invalid field selection
- Permission issues

**Solutions:**
- Reduce row count
- Select fewer fields
- Try different format
- Check permissions
- Contact administrator

### Download Issues

**Cannot download:**
- Check internet connection
- Try different browser
- Clear browser cache
- Check popup blockers
- Use download link option

### Empty or Incorrect Data

**Possible causes:**
- Wrong field selection
- Incorrect filters
- Data not available
- Permission restrictions

**Solutions:**
- Review field mappings
- Check filter settings
- Verify data access
- Contact support

---

**Previous:** [Data Import ←](09-data-import.md)  
**Next:** [Reports & Analytics →](11-reports.md)
