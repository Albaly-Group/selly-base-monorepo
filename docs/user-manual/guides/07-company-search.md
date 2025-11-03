# Company Search & Lookup

The Company Search feature is the core of Selly Base, allowing you to discover and research companies in the database.

## Accessing Company Search

**Navigation:** Click "Lookup" or "Search" in the main menu

**URL:** `/lookup`

**Available to:** All user roles

📸 **Screenshots:**
- `platform-admin-lookup-initial-view-01.png`
- `customer-admin-lookup-initial-view-01.png`
- `staff-lookup-initial-view-01.png`
- `user-lookup-initial-view-01.png`

## Search Interface Overview

The search interface includes:

1. **Search Bar:** Main text input for company search
2. **Filter Panel:** Advanced filtering options (left side)
3. **Results Table:** Company listing with details
4. **Pagination Controls:** Navigate through results
5. **Action Buttons:** Add to list, export, view details

## Basic Search

### Simple Text Search

**Step 1: Enter Search Term**
- Click in the search bar
- Type company name, keyword, or industry
- Press Enter or click Search button

**Examples:**
- Company name: `"Microsoft"`
- Industry keyword: `"Technology"`
- Location: `"Bangkok"`
- Combination: `"Software company Bangkok"`

📸 **Screenshot:** `staff-lookup-search-results-02.png`

**Step 2: Review Results**
- Results appear in the table below
- Default sort: Relevance (best matches first)
- Shows 20 results per page

### Search Tips

💡 **Best Practices:**
- Use specific keywords for better results
- Try variations of company names
- Include industry terms
- Add location for local search

⚠️ **Search Limitations:**
- Minimum 2 characters required
- Special characters may be ignored
- Case-insensitive search

## Advanced Filtering

### Filter Panel

Located on the left side of the search interface, the filter panel provides detailed search criteria.

#### Industry Filter

**Purpose:** Filter companies by industry sector

**How to use:**
1. Expand "Industry" section
2. Browse industry categories
3. Check boxes for industries to include
4. Multiple selections allowed
5. Click "Apply Filters"

**Industry Categories:**
- Technology & Software
- Manufacturing
- Retail & E-commerce
- Financial Services
- Healthcare
- Real Estate
- Transportation & Logistics
- Professional Services
- And more...

#### Location Filter

**Purpose:** Filter companies by geographic location

**Options:**
- **Country:** Select one or more countries
- **Province/State:** Filter by province (e.g., Bangkok, Chiang Mai)
- **City:** Specific city selection
- **Region:** Geographic regions

**How to use:**
1. Expand "Location" section
2. Select Country (e.g., Thailand)
3. Optionally select Province
4. Optionally select City
5. Click "Apply Filters"

#### Company Size Filter

**Purpose:** Filter by number of employees

**Size Ranges:**
- **Micro:** 1-10 employees
- **Small:** 11-50 employees
- **Medium:** 51-200 employees
- **Large:** 201-1,000 employees
- **Enterprise:** 1,000+ employees

**How to use:**
1. Expand "Company Size" section
2. Select one or more size ranges
3. Use slider for custom range (if available)
4. Click "Apply Filters"

#### Revenue Filter

**Purpose:** Filter by annual revenue

**Options:**
- Revenue ranges (e.g., $1M-$10M, $10M-$50M)
- Custom range slider
- Currency selection

#### Founded Date Filter

**Purpose:** Filter by company founding year

**Options:**
- Year range slider
- Specific date ranges
- Founded after/before specific year

#### Tags Filter

**Purpose:** Filter by custom tags or categories

**Examples:**
- Lead quality: Hot, Warm, Cold
- Status: Active, Prospect, Customer
- Custom organizational tags

### Combining Filters

You can combine multiple filters for precise results:

**Example 1: Tech Startups in Bangkok**
- Industry: Technology & Software
- Location: Bangkok
- Founded: After 2018
- Size: 11-50 employees

**Example 2: Large Manufacturing Companies**
- Industry: Manufacturing
- Size: Enterprise (1,000+)
- Revenue: $50M+

💡 **Tip:** Start broad and narrow down using filters for best results.

## Search Results

### Results Table Columns

The results table displays:

1. **Company Name:** Official business name
2. **Industry:** Primary industry classification
3. **Location:** City, Province, Country
4. **Size:** Number of employees
5. **Revenue:** Annual revenue (if available)
6. **Founded:** Year established
7. **Lead Score:** Automatically calculated score (0-100)
8. **Actions:** Quick action buttons

### Sort Options

Click column headers to sort results:

- **Name:** Alphabetical order (A-Z or Z-A)
- **Industry:** Group by industry
- **Location:** Geographic order
- **Size:** By employee count
- **Revenue:** By annual revenue
- **Lead Score:** By score (highest first)
- **Founded:** By year (newest/oldest first)

### Lead Scoring

Each company has an automatically calculated lead score (0-100) based on:

- **Data completeness:** More complete profiles score higher
- **Recent activity:** Recently updated companies
- **Industry relevance:** Match to your organization's focus
- **Company characteristics:** Size, revenue, growth indicators

**Score Ranges:**
- **80-100:** Hot lead (high priority)
- **60-79:** Warm lead (good potential)
- **40-59:** Qualified lead (requires nurturing)
- **20-39:** Cold lead (low priority)
- **0-19:** Unqualified (may not be suitable)

## Viewing Company Details

### Opening Company Profile

**Method 1: Click Company Name**
- Click the company name in results table
- Opens detailed company profile page

**Method 2: View Details Button**
- Click "View Details" action button
- Opens in same tab or new tab (based on settings)

### Company Profile Page

The detailed company profile includes:

#### Basic Information
- Legal business name
- Trading name (if different)
- Registration number
- Tax ID
- Status (Active/Inactive)

#### Contact Information
- Business address
- Phone number(s)
- Email address(es)
- Website URL
- Social media links

#### Business Details
- Industry classification
- Primary business activities
- Products/services offered
- Target markets
- Number of locations

#### Financial Information
- Annual revenue
- Revenue trend
- Funding history
- Investment rounds
- Financial status

#### Company Metrics
- Number of employees
- Employee growth trend
- Year founded
- Years in business
- Market position

#### Contacts
- Key decision makers
- Department contacts
- Job titles
- Contact details
- Recent activities

#### Activity History
- Recent interactions
- Notes and comments
- Status changes
- List memberships
- Export history

📸 **Screenshot:** Company detail view (to be captured)

### Quick Actions from Results

Without opening the full profile, you can:

#### Add to List
1. Click "Add to List" button
2. Select existing list or create new
3. Confirm addition
4. Company is added to list

#### Export
1. Select company checkbox
2. Click "Export Selected" button
3. Choose export format
4. Download file

#### Add Note
1. Click "Add Note" icon
2. Enter note text
3. Save note
4. Note appears in activity history

#### Update Status
1. Click status dropdown
2. Select new status
3. Status is updated immediately

## Bulk Actions

### Selecting Multiple Companies

**Select All on Page:**
- Check the header checkbox
- All companies on current page selected

**Select Specific Companies:**
- Check individual company checkboxes
- Selected count shown in footer

**Select Across Pages:**
- Select companies on multiple pages
- Selection persists when changing pages
- Clear all selections with "Clear" button

### Bulk Operations

With companies selected, you can:

#### Add to List (Bulk)
1. Click "Add to List" button
2. Choose destination list
3. All selected companies added
4. Confirmation message displayed

#### Export Selected
1. Click "Export" button
2. Choose format (CSV, Excel, JSON)
3. Select fields to export
4. Download file with selected companies

#### Bulk Tag
1. Click "Add Tags" button
2. Select or create tags
3. Tags applied to all selected
4. Confirmation displayed

#### Bulk Status Update
1. Click "Update Status" button
2. Choose new status
3. Status updated for all selected
4. Activity log updated

## Saved Searches

### Creating a Saved Search

**Purpose:** Reuse complex search criteria

**Steps:**
1. Configure your search and filters
2. Click "Save Search" button
3. Enter search name
4. Optionally add description
5. Click "Save"

**Example Names:**
- "Tech Startups Bangkok"
- "Enterprise Manufacturing"
- "High-value Prospects"

### Using Saved Searches

**Access:** Click "Saved Searches" dropdown

**Features:**
- Quick load of saved criteria
- One-click execution
- Edit saved searches
- Delete unused searches
- Share with team (if permitted)

### Managing Saved Searches

**Edit:**
1. Load saved search
2. Modify criteria
3. Click "Update Search"
4. Confirm update

**Delete:**
1. Find search in list
2. Click delete icon
3. Confirm deletion

**Share:**
1. Select search
2. Click "Share" button
3. Choose team members
4. Set permissions (view/edit)
5. Send invitation

## Export from Search

### Quick Export

**Direct CSV Export:**
1. Select companies (or search results)
2. Click "Export" button
3. Choose "Quick CSV Export"
4. File downloads immediately

**Format:** Standard CSV with all fields

### Custom Export

**Advanced Export Options:**

**Step 1: Select Export Type**
- CSV (Comma-separated)
- Excel (XLSX)
- JSON (For developers)
- PDF (Formatted report)

**Step 2: Choose Fields**
- Select which fields to include
- Reorder fields
- Add custom fields
- Preview export layout

**Step 3: Configure Options**
- Header row (yes/no)
- Date format
- Number format
- Text encoding
- Delimiter (for CSV)

**Step 4: Execute Export**
- Click "Create Export"
- Export job created
- Notification when ready
- Download from exports page

📸 **Screenshot:** Export configuration (to be captured)

## Search Best Practices

### Effective Searching

💡 **Tips for Better Results:**

1. **Start Broad:** Begin with general terms, then filter
2. **Use Filters:** Combine search text with filters
3. **Check Spelling:** Verify company name spelling
4. **Try Variations:** Try different keyword combinations
5. **Save Searches:** Save frequent searches for quick access
6. **Review Filters:** Clear filters if results seem limited
7. **Sort Results:** Sort by relevance or lead score first

### Performance Tips

⚡ **Faster Searches:**
- Limit results per page (20-50)
- Use specific filters to reduce result set
- Save searches instead of re-entering criteria
- Clear browser cache if search seems slow

### Search Limitations

⚠️ **Be Aware:**
- Maximum 10,000 results per search
- Very broad searches may be truncated
- Some filters require specific permissions
- Certain fields may not be searchable

## Troubleshooting

### No Results Found

**Possible causes:**
- Search term too specific
- Filters too restrictive
- Company not in database
- Spelling error

**Solutions:**
- Try broader search terms
- Remove some filters
- Check spelling
- Try alternative company names

### Slow Search Results

**If search is slow:**
- Reduce number of filters
- Lower results per page
- Check internet connection
- Clear browser cache
- Try during off-peak hours

### Missing Companies

**If expected companies don't appear:**
- Verify company is in database
- Check filter settings
- Try different search terms
- Contact administrator to add company

---

**Previous:** [Dashboard Overview ←](06-dashboard.md)  
**Next:** [Managing Company Lists →](08-company-lists.md)
