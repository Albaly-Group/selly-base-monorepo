# Database Health Check Fix - Schema Search Path

## Problem Description

Users were experiencing a database health check failure with the following error:

```
query: SELECT 1
query: SELECT 1 FROM "users" LIMIT 1
query failed: SELECT 1 FROM "users" LIMIT 1
error: error: relation "users" does not exist
```

Even though their database schema was properly initialized with the `selly-base-optimized-schema.sql` file and contained all required tables including `users` and `organizations`.

## Root Cause

TypeORM's PostgreSQL connection does not automatically set the `search_path` to the `public` schema. Depending on the PostgreSQL database configuration and user settings, the connection might default to looking in a different schema or not finding tables in the public schema where they were created by the SQL seed file.

In PostgreSQL:
- Tables can exist in different schemas (namespaces)
- The `search_path` determines which schemas are searched when a table is referenced without a schema qualifier
- If not explicitly set, PostgreSQL uses the database user's default search_path
- This can vary based on user configuration or database setup

## Solution (Updated for Neon Compatibility)

**Previous Approach (Had Issues with Neon):**
Originally tried to set search_path as a startup parameter using `options: '-c search_path=public'` in the connection configuration, but this caused errors with serverless PostgreSQL providers like Neon that use connection pooling:
```
error: unsupported startup parameter in options: search_path
```

**Current Approach (Works with All PostgreSQL Providers):**
The search_path is now set after the connection is established using a query. This approach is compatible with both regular PostgreSQL and pooled/serverless connections like Neon.

### Changes Made

#### `apps/api/src/database/database-health.service.ts`
Added search_path configuration after connection check:
```typescript
private async checkDatabaseHealth(): Promise<void> {
  try {
    // Simple health check query
    await this.dataSource!.query('SELECT 1');

    // Set search_path to public schema to ensure tables are found
    // This approach works with both regular PostgreSQL and pooled connections (like Neon)
    try {
      await this.dataSource!.query('SET search_path TO public');
    } catch (searchPathError) {
      // Log but don't fail if search_path cannot be set
      this.logger.warn(
        '⚠️ Could not set search_path to public schema:',
        searchPathError.message,
      );
    }

    // Check if migrations have been run by checking for critical tables
    // ...
  }
}
```

## How It Works

Instead of setting the search_path as a connection startup parameter (which doesn't work with pooled connections), we execute `SET search_path TO public` as a regular SQL query after the connection is established. This approach:

1. **Works with regular PostgreSQL**: Standard PostgreSQL databases accept the SET command without issues
2. **Works with Neon and other pooled providers**: Since it's a regular query and not a startup parameter, it's compatible with connection pooling
3. **Fails gracefully**: If the SET command fails for any reason, it logs a warning but doesn't crash the application

## Expected Behavior After Fix

1. Application starts and connects to PostgreSQL (including Neon)
2. Database health check runs:
   - `SELECT 1` - Tests basic connectivity ✅
   - `SET search_path TO public` - Sets schema search path ✅
   - `SELECT 1 FROM "users" LIMIT 1` - Tests users table exists ✅
   - `SELECT 1 FROM "organizations" LIMIT 1` - Tests organizations table exists ✅
3. Health check logs success:
   ```
   [Nest] XXX  - XX/XX/XXXX, X:XX:XX XX   LOG [DatabaseHealthService] ✅ Database connection is healthy and schema is initialized
   ```

## Benefits

1. **Consistent Behavior**: Application will work regardless of the database user's default search_path configuration
2. **No Breaking Changes**: All existing functionality continues to work as expected
3. **Clear Intent**: Makes it explicit that the application expects tables in the public schema
4. **Neon Compatible**: Works with serverless PostgreSQL providers that use connection pooling
5. **Graceful Degradation**: If search_path cannot be set, logs a warning but continues to function

## Testing

To verify the fix works:

1. Ensure your database has the schema initialized:
   ```bash
   psql -U postgres -d selly_base -f selly-base-optimized-schema.sql
   ```

2. Configure your environment variables:
   ```env
   SKIP_DATABASE=false
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=selly_base
   ```
   
   **For Neon or other cloud providers:**
   ```env
   SKIP_DATABASE=false
   DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/database?sslmode=require
   ```

3. Start the API:
   ```bash
   cd apps/api
   npm run start:dev
   ```

4. Look for the success message in the logs:
   ```
   ✅ Database connection is healthy and schema is initialized
   ```

## Troubleshooting

If you still experience issues after this fix:

1. **Verify tables exist in public schema**:
   ```sql
   SELECT schemaname, tablename 
   FROM pg_tables 
   WHERE tablename IN ('users', 'organizations')
   AND schemaname = 'public';
   ```

2. **Check user has access to public schema**:
   ```sql
   SELECT * FROM public.users LIMIT 1;
   ```

3. **Verify database connection settings** in your `.env` file match your PostgreSQL configuration

4. **Re-run the SQL seed file** if tables are missing or in the wrong schema

## Related Files

- `apps/api/src/config/database.config.ts` - Main database configuration
- `apps/api/src/database/data-source.ts` - Migration data source configuration
- `apps/api/src/database/database-health.service.ts` - Health check implementation
- `selly-base-optimized-schema.sql` - SQL schema file that creates tables in public schema

## References

- PostgreSQL Documentation: [Schema Search Path](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)
- TypeORM Documentation: [Data Source Options](https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options)
