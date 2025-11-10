# Managing Company Lists

Company Lists help you organize and manage groups of companies for various purposes like prospecting campaigns, market research, or customer segmentation.

## Overview

### What are Lists?

Lists are collections of companies that you create and manage. Think of them as folders or groups for organizing companies.

**Common Use Cases:**
- Sales prospect lists
- Target account lists
- Customer segments
- Research projects
- Campaign audiences
- Partner opportunities

### List Types

**Personal Lists:**
- Created by you
- Visible only to you
- Private workspace
- No sharing restrictions

**Shared Lists:**
- Created by team members
- Visible to team (based on permissions)
- Collaborative management
- Team-wide access

## Accessing Lists

**Navigation:** Click "Lists" in the main menu

**URL:** `/lists`

**Available to:** All user roles

📸 **Screenshots:**
- `platform-admin-lists-overview-01.png`
- `customer-admin-lists-overview-01.png`
- `staff-lists-overview-01.png`
- `user-lists-overview-01.png`

## Lists Overview Page

### Interface Layout

The Lists page displays:

1. **Header with Actions**
   - "Create New List" button
   - Search lists input
   - Filter options
   - Sort dropdown

2. **Lists Grid/Table**
   - List name and description
   - Company count
   - Created by / date
   - Last modified
   - Sharing status
   - Quick actions

3. **Statistics Panel** (if available)
   - Total lists
   - Total companies across lists
   - Recent activity

### List Information Displayed

Each list shows:
- **Name:** List title
- **Description:** Brief summary
- **Count:** Number of companies
- **Owner:** Created by (username)
- **Created:** Creation date
- **Modified:** Last update date
- **Shared:** Sharing indicator
- **Status:** Active/Archived

## Creating a List

### Create New List

**Step 1: Click "Create New List"**
- Click the button in the top-right corner
- A modal dialog appears

**Step 2: Enter List Details**

✅ **List Name** (Required)
- Enter a descriptive name
- Examples: "Q4 2025 Prospects", "Enterprise Targets"
- Maximum 100 characters
- Must be unique (within your organization)

✅ **Description** (Optional)
- Provide context about the list purpose
- Maximum 500 characters
- Helps team members understand list usage

✅ **Tags** (Optional)
- Add categorization tags
- Examples: "sales", "hot-leads", "q4-campaign"
- Multiple tags supported
- Helps with list organization

✅ **Sharing Settings**
- **Private:** Only you can access
- **Team:** Visible to organization members
- **Specific Users:** Select individual users

**Step 3: Create List**
- Click "Create" button
- List is created immediately
- Redirected to empty list view

📸 **Screenshot:** Create list modal (to be captured)

### Quick Create from Search

You can create a list directly from search results:

**Method 1: From Selected Companies**
1. Search and select companies
2. Click "Add to List" dropdown
3. Select "Create New List"
4. Enter list name
5. Companies automatically added

**Method 2: Save Search as List**
1. Configure search criteria
2. Click "Save as List"
3. Enter list name
4. All results added to new list

💡 **Tip:** This is the fastest way to create targeted lists.

## Managing Lists

### Opening a List

**Click on any list** to view its contents:
- Opens list detail page
- Shows all companies in list
- Provides list management tools

### List Detail View

The list detail page includes:

#### Header Section
- List name (editable)
- Description (editable)
- Company count
- Creation/modification info
- Share button
- Export button
- Delete list button

#### Companies Table
- All companies in the list
- Same columns as search results
- Sort and filter options
- Bulk action checkboxes
- Pagination controls

#### Actions Panel
- Add more companies
- Remove companies
- Export list
- Share list
- Edit list details

## Adding Companies to Lists

### Method 1: From Search Results

**Single Company:**
1. Find company in search
2. Click "Add to List" button
3. Select destination list
4. Company is added

**Multiple Companies:**
1. Select companies using checkboxes
2. Click "Add to List" bulk action
3. Choose list
4. All selected companies added

### Method 2: From Company Profile

1. Open company detail page
2. Click "Add to List" button
3. Select or create list
4. Company is added

### Method 3: From Within List

1. Open a list
2. Click "Add Companies" button
3. Search for companies
4. Select companies to add
5. Click "Add Selected"

### Method 4: Import to List

1. Open a list
2. Click "Import Companies" button
3. Upload CSV file with company IDs or names
4. Map columns
5. Companies are imported

## Removing Companies from Lists

### Remove Single Company

**From List View:**
1. Find company in list
2. Click "Remove" icon/button
3. Confirm removal
4. Company removed from list (not deleted from database)

### Bulk Remove

1. Select multiple companies using checkboxes
2. Click "Remove Selected" button
3. Confirm bulk removal
4. Companies removed from list

💡 **Note:** Removing companies from a list does NOT delete them from the database.

## Editing List Details

### Update List Information

1. Open the list
2. Click "Edit List" or edit icon
3. Modify details:
   - Change name
   - Update description
   - Add/remove tags
   - Update sharing settings
4. Click "Save Changes"

📸 **Screenshot:** Edit list modal (to be captured)

### Rename List

**Quick Rename:**
1. Click on list name (in list view)
2. Name becomes editable
3. Enter new name
4. Press Enter or click outside to save

## Sharing Lists

### Share with Team Members

**Purpose:** Allow other users to view or edit your list

**Steps:**
1. Open list
2. Click "Share" button
3. Select users or groups
4. Set permission level:
   - **View Only:** Can see companies, cannot modify
   - **Edit:** Can add/remove companies
   - **Manage:** Full control including sharing
5. Click "Share"

**Recipients receive:**
- Email notification (if enabled)
- List appears in their Lists page
- Access based on permission level

### Unshare a List

1. Open list
2. Click "Share" button
3. Find user in shared list
4. Click "Remove" next to their name
5. User loses access immediately

### Making List Private

If a list is shared and you want to make it private:
1. Open list
2. Click "Share" button
3. Remove all shared users
4. Change setting to "Private"
5. Save changes

⚠️ **Warning:** Team members will lose access immediately.

## Deleting Lists

### Delete a List

**From Lists Overview:**
1. Find list in grid/table
2. Click delete icon (trash can)
3. Confirm deletion
4. List is deleted permanently

**From List Detail:**
1. Open the list
2. Click "Delete List" button
3. Type list name to confirm (for safety)
4. Click "Delete Permanently"
5. Redirected to Lists overview

⚠️ **Important:**
- Deletion is permanent and cannot be undone
- Companies in the list are NOT deleted (only the list itself)
- Shared users lose access immediately
- Deletion is logged in audit trail

### Archive Instead of Delete

Consider archiving instead of deleting:
1. Edit list
2. Set status to "Archived"
3. List hidden from main view
4. Can be restored later if needed

## List Analytics

### List Statistics

View statistics about your list:

**Company Metrics:**
- Total companies
- By industry breakdown
- By location distribution
- By company size
- Average lead score

**Activity Metrics:**
- Companies added (last 7/30 days)
- Companies removed
- Export count
- Last activity date

**Engagement Metrics:**
- Views by team members
- Modifications made
- Most active contributors

### Viewing Analytics

1. Open list
2. Click "Analytics" tab
3. Review metrics and charts
4. Export analytics report if needed

📸 **Screenshot:** List analytics view (to be captured)

## Exporting Lists

### Quick Export

**Direct CSV Export:**
1. Open list
2. Click "Export" button
3. Select "Quick CSV"
4. File downloads immediately

### Custom Export

**Advanced Options:**

**Step 1: Click "Export" > "Custom Export"**

**Step 2: Configure Export**
- Choose format (CSV, Excel, JSON)
- Select fields to include
- Set sort order
- Add filters (if needed)

**Step 3: Execute Export**
- Click "Create Export"
- Export processes in background
- Notification when ready
- Download from Exports page

💡 **Tip:** For large lists, use custom export to avoid timeout.

## Organizing Lists

### Using Tags

Tags help categorize and find lists quickly:

**Add Tags:**
1. Edit list
2. Add tags (e.g., "q4", "high-priority", "sales")
3. Save

**Filter by Tags:**
1. Go to Lists overview
2. Click tag filter
3. Select tags
4. View matching lists

### Search Lists

Use the search box to find lists:
- Search by name
- Search by description
- Search by tags
- Search by creator

**Example Searches:**
- "prospect" - Find all prospect lists
- "Q4 2025" - Find quarterly lists
- "Bangkok" - Find location-specific lists

### Sort Lists

Sort lists by:
- **Name:** Alphabetical (A-Z or Z-A)
- **Size:** Number of companies
- **Created:** Newest or oldest first
- **Modified:** Recently updated first
- **Owner:** Grouped by creator

## List Permissions

### What You Can Do

Based on your role:

**Platform Admin:**
- Create unlimited lists
- View all organizational lists
- Edit any list
- Delete any list
- Share with anyone

**Customer Admin:**
- Create unlimited lists
- View organization lists
- Edit shared lists (with permission)
- Delete own lists
- Share within organization

**Staff:**
- Create lists (may have limits)
- View own and shared lists
- Edit lists they created
- Delete own lists
- Share with team

**User:**
- Create personal lists (may have limits)
- View own lists only
- Edit own lists
- Delete own lists
- Limited sharing (if allowed)

### Permission Restrictions

Some organizations may restrict:
- Maximum number of lists per user
- Maximum companies per list
- Sharing capabilities
- Export from lists
- Bulk operations

💡 **Tip:** Contact your administrator if you need increased limits.

## Best Practices

### List Organization

📋 **Recommended Practices:**

1. **Descriptive Names**
   - Use clear, meaningful names
   - Include date/period if relevant
   - Add purpose or campaign name

2. **Regular Cleanup**
   - Archive old lists
   - Delete unused lists
   - Remove outdated companies

3. **Use Tags**
   - Tag by purpose (sales, marketing, research)
   - Tag by status (active, pending, completed)
   - Tag by period (Q1, Q2, 2025)

4. **Share Appropriately**
   - Only share when necessary
   - Set appropriate permissions
   - Review shared access regularly

5. **Document Purpose**
   - Add clear descriptions
   - Note list creation reason
   - Track list objectives

### List Maintenance

🔧 **Maintenance Tasks:**

**Weekly:**
- Review new companies added
- Remove duplicates
- Update company statuses

**Monthly:**
- Check list accuracy
- Update descriptions
- Archive completed lists

**Quarterly:**
- Review all lists
- Delete obsolete lists
- Reorganize and consolidate

## Troubleshooting

### Cannot Create List

**Possible causes:**
- Reached list limit for your account
- Duplicate list name
- Insufficient permissions

**Solutions:**
- Delete unused lists
- Choose unique name
- Contact administrator for limit increase

### Companies Not Adding to List

**Check:**
- You have edit permission on list
- Company not already in list
- List not at maximum capacity
- Proper permissions for bulk operations

### List Not Showing

**Verify:**
- List not archived
- Filter settings not hiding list
- You have access permission
- List belongs to your organization

---

**Previous:** [Company Search & Lookup ←](07-company-search.md)  
**Next:** [Data Import →](09-data-import.md)
