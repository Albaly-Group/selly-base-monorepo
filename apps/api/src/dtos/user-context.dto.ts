/**
 * User Context DTO
 * 
 * Represents authenticated user information extracted from JWT token.
 * Used instead of full Users entity to avoid type casting issues with partial objects.
 */
export interface UserContext {
  id: string;
  email: string;
  name: string;
  organizationId: string;
}
