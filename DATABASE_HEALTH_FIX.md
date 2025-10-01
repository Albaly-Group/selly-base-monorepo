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

## Solution

Added explicit PostgreSQL search_path configuration to ensure TypeORM always looks in the `public` schema where the application tables are created.

### Changes Made

#### 1. `apps/api/src/config/database.config.ts`
Added to the `extra` configuration object:
```typescript
extra: {
  connectionLimit: parseInt(
    process.env.DATABASE_CONNECTION_LIMIT || '10',
    10,
  ),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Set search_path to ensure queries look in the public schema
  options: '-c search_path=public',
},
```

#### 2. `apps/api/src/database/data-source.ts`
Added the same configuration for consistency with migrations:
```typescript
// Set search_path to ensure queries look in the public schema
extra: {
  options: '-c search_path=public',
},
```

## How It Works

The `options: '-c search_path=public'` configuration passes the PostgreSQL connection option that sets the search_path when the connection is established. This is equivalent to running:

```sql
SET search_path TO public;
```

After every database connection, but it's handled automatically by the connection string.

## Expected Behavior After Fix

1. Application starts and connects to PostgreSQL
2. Database health check runs:
   - `SELECT 1` - Tests basic connectivity ✅
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
4. **Migration Safety**: Ensures migrations also use the correct schema

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
