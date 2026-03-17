/**
 * Application roles – ordered by privilege level (highest → lowest).
 * Used for RBAC throughout the application.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  STUDENT: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Array of all valid role values */
export const ROLE_VALUES: Role[] = Object.values(ROLES);

/** Roles that carry administrative privileges */
export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

/** Roles allowed to manage content (news, events, etc.) */
export const CONTENT_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR];
