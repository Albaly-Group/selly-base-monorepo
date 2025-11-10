# Data Import

The Data Import feature allows authorized users to upload company data in bulk, making it easy to populate your database from external sources.

## Overview

### What is Data Import?

Data Import enables you to:
- Upload company data from CSV, Excel, or other formats
- Validate data before importing
- Map imported columns to database fields
- Monitor import progress
- Review import history

### Who Can Import?

**Available to:**
- Staff
- Customer Admin
- Platform Admin

**Required Permission:** `imports:create`

## Accessing Imports

**Navigation:** Click "Imports" in the main menu

**URL:** `/imports`

📸 **Screenshots:**
- `platform-admin-imports-main-view-01.png`
- `staff-imports-main-view-01.png`

## Imports Page Overview

The Imports page displays:

1. **Upload Section**
   - File upload area
   - Format requirements
   - Sample template download

2. **Active Imports**
   - Currently processing imports
   - Progress indicators
   - Cancel option

3. **Import History**
   - Past imports
   - Success/failure status
   - Download logs

## Preparing Import Files

### Supported File Formats

- **CSV:** Comma-separated values (recommended)
- **Excel:** .xlsx or .xls files
- **TSV:** Tab-separated values
- **JSON:** For advanced users

### File Requirements

**File Size Limits:**
- Maximum 50 MB per file
- Maximum 100,000 rows per import
- Contact admin for larger imports

**Format Requirements:**
- UTF-8 encoding (for CSV/TSV)
- Header row required
- No empty rows
- Clean data (no formatting in Excel)

### Required Fields

At minimum, your import file must include:

✅ **Company Name** (Required)
- Official business name
- Must be unique or system will check for duplicates

✅ **Industry** (Recommended)
- Industry category
- Must match platform industry list

✅ **Location** (Recommended)
- At least country
- Province/city for better data quality

### Optional Fields

Additional fields you can import:
- Tax ID / Registration Number
- Phone number
- Email address
- Website URL
- Address details
- Number of employees
- Annual revenue
- Founded date
- Tags
- Custom fields

### Download Template

**To get a properly formatted template:**

1. Click "Download Template" button
2. Choose format (CSV or Excel)
3. Template downloads with headers
4. Fill in your data
5. Upload completed file

💡 **Tip:** Always use the template to ensure correct format.

## Uploading Import Files

### Upload Process

**Step 1: Select File**
1. Click "Upload Import File" or drag file to upload area
2. Browse and select your file
3. File begins uploading immediately

**Step 2: File Validation**
- System validates file format
- Checks file size
- Verifies structure
- Displays any errors

**Step 3: Preview Data**
- See first 10 rows of data
- Review column headers
- Check for obvious issues
- Proceed or cancel

📸 **Screenshot:** Upload interface (to be captured)

### Upload Status Indicators

During upload:
- **Progress Bar:** Shows upload percentage
- **File Info:** Name, size, row count
- **Validation Status:** Pass/fail indicators
- **Next Steps:** Available actions

## Mapping Import Columns

### Column Mapping Interface

After upload, you need to map your file columns to database fields:

**Mapping Process:**

**Step 1: Automatic Mapping**
- System attempts automatic mapping based on column names
- Common fields mapped automatically
- Review suggested mappings

**Step 2: Manual Mapping**
For unmapped columns:
1. Select source column (from your file)
2. Choose destination field (database field)
3. Set mapping for each column
4. Mark optional columns as "Skip"

**Step 3: Review Mappings**
- View complete mapping table
- Source → Destination
- Data type compatibility
- Sample values shown

📸 **Screenshot:** Column mapping interface (to be captured)

### Mapping Options

**For each column:**
- **Required:** Must map for import to proceed
- **Optional:** Can skip if not needed
- **Transform:** Apply data transformation
- **Default Value:** Set default if empty
- **Validation:** Set validation rules

### Data Transformations

Available transformations:
- **Trim:** Remove extra spaces
- **Uppercase/Lowercase:** Convert case
- **Date Format:** Convert date formats
- **Number Format:** Parse numbers
- **Split:** Split combined fields
- **Concatenate:** Combine fields

💡 **Tip:** Use transformations to clean data during import.

## Validating Import Data

### Data Validation

Before importing, system validates:

**Structure Validation:**
- ✅ Required fields present
- ✅ Data types correct
- ✅ Format valid
- ✅ Character encoding proper

**Business Rules Validation:**
- ✅ Unique constraints
- ✅ Foreign key references
- ✅ Value ranges
- ✅ Pattern matching

**Data Quality Checks:**
- ⚠️ Missing optional fields
- ⚠️ Suspicious values
- ⚠️ Potential duplicates
- ⚠️ Format inconsistencies

### Validation Results

**Validation Report Shows:**
- **Pass Count:** Valid rows
- **Error Count:** Invalid rows (will not import)
- **Warning Count:** Questionable rows (will import with warnings)
- **Total Rows:** Overall count

📸 **Screenshot:** Validation results (to be captured)

### Handling Validation Errors

**Error Types:**

**Critical Errors (Prevent Import):**
- Missing required fields
- Invalid data types
- Duplicate unique values
- Reference errors

**Warnings (Allow Import):**
- Missing optional fields
- Format inconsistencies
- Unusual values
- Potential duplicates

**Resolving Errors:**

**Option 1: Fix and Re-upload**
1. Download error report
2. Fix issues in source file
3. Upload corrected file
4. Validate again

**Option 2: Import Valid Rows**
1. Review errors
2. Choose "Import Valid Rows Only"
3. Invalid rows skipped
4. Can fix and import later

**Option 3: Cancel and Start Over**
1. Click "Cancel Import"
2. Fix all issues
3. Start fresh import

💡 **Tip:** For large imports, fix and re-import errors separately.

## Executing the Import

### Starting Import

**When validation passes:**

1. Review final summary:
   - Total rows to import
   - Estimated time
   - Duplicate handling strategy
   - Error handling approach

2. Choose import options:
   - **Duplicate Strategy:**
     - Skip duplicates
     - Update existing
     - Create new with suffix
   - **Error Handling:**
     - Stop on first error
     - Skip errors and continue
     - Log errors only

3. Click "Execute Import"

### Import Progress

**Monitoring Progress:**
- **Progress Bar:** Percentage complete
- **Status Messages:** Current activity
- **Rows Processed:** Count
- **Estimated Time:** Time remaining
- **Cancel Option:** Stop import if needed

📸 **Screenshot:** Import in progress (to be captured)

**Progress Stages:**
1. **Preparing:** Setting up import
2. **Processing:** Importing rows
3. **Validating:** Final validation
4. **Completing:** Finishing up
5. **Done:** Import complete

### Import Results

**Success Screen Shows:**
- **Total Imported:** Successfully added rows
- **Skipped:** Duplicates or errors
- **Updated:** Modified existing records
- **Errors:** Failed rows
- **Duration:** Total time taken

**Actions Available:**
- View imported companies
- Download import log
- Start another import
- Return to imports page

## Viewing Import History

### Import History Table

**Displays:**
- **Import ID:** Unique identifier
- **Filename:** Original file name
- **Date/Time:** When import started
- **Status:** Success, Failed, Partial
- **Rows:** Processed/Total
- **Duration:** Time taken
- **User:** Who initiated
- **Actions:** View details, download log

### Import Details

Click any import to see full details:

**Import Summary:**
- Complete statistics
- Success/failure breakdown
- Validation results
- Processing log

**Imported Data:**
- List of added companies
- Updated companies
- Skipped rows
- Error details

**Import Log:**
- Detailed activity log
- Error messages
- Warnings
- System messages

📸 **Screenshot:** Import history (to be captured)

### Downloading Import Logs

**Log Contents:**
- Row-by-row processing results
- Error details with reasons
- Warnings and notes
- Timestamp for each action
- System diagnostics

**Download Options:**
- **CSV:** For analysis in Excel
- **JSON:** For programmatic processing
- **PDF:** For reports/records
- **TXT:** Plain text log

## Canceling Imports

### Cancel Active Import

**During import:**
1. Locate import in "Active Imports" section
2. Click "Cancel" button
3. Confirm cancellation
4. Import stops immediately

**What Happens:**
- Processing stops
- Already imported rows remain
- Partial import marked in history
- Can resume or start over

⚠️ **Warning:** Cancellation cannot be undone. Already imported data remains.

## Import Best Practices

### Data Preparation

📋 **Before Importing:**

1. **Clean Your Data**
   - Remove duplicates
   - Fix formatting issues
   - Validate all values
   - Check required fields

2. **Use Templates**
   - Download platform template
   - Match column names exactly
   - Follow data format guidelines
   - Include all required fields

3. **Test with Small Sample**
   - Import 10-20 rows first
   - Verify mappings correct
   - Check results
   - Then import full dataset

4. **Backup Important Data**
   - Export existing data before large imports
   - Keep original import files
   - Document import parameters

### Performance Tips

⚡ **Faster Imports:**
- Break large files into smaller chunks (10,000 rows)
- Remove unnecessary columns
- Use CSV instead of Excel when possible
- Import during off-peak hours
- Disable validation for trusted data (admin only)

### Data Quality

🎯 **Maintain Quality:**
- Standardize formats (phone numbers, addresses)
- Use consistent industry names
- Verify location data
- Include all available fields
- Add tags for categorization

## Troubleshooting

### Import Fails to Upload

**Possible Causes:**
- File too large (>50 MB)
- Invalid file format
- Network interruption
- Browser issues

**Solutions:**
- Split file into smaller parts
- Convert to CSV format
- Check internet connection
- Try different browser
- Clear browser cache

### Validation Errors

**Common Issues:**

**"Required field missing"**
- Add required columns
- Map fields correctly
- Check column names

**"Invalid data type"**
- Check date formats
- Verify number formats
- Remove special characters

**"Duplicate values"**
- Choose duplicate strategy
- Update existing records
- Skip duplicates

### Import Stuck/Slow

**If import is slow:**
- Check server status
- Reduce file size
- Simplify transformations
- Contact administrator
- Try during off-peak hours

### Data Not Appearing

**After successful import:**
- Refresh company list
- Check filters
- Verify organization scope
- Review import log
- Search for specific companies

## Getting Help

**Resources:**
- Review import logs for errors
- Check FAQ for common issues
- Contact support with import ID
- Ask administrator for assistance

---

**Previous:** [Managing Company Lists ←](08-company-lists.md)  
**Next:** [Data Export →](10-data-export.md)
