export type AdminRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

export type Permission = 
  | 'users:read' | 'users:write' | 'users:delete' | 'users:suspend'
  | 'subscriptions:read' | 'subscriptions:write'
  | 'partners:read' | 'partners:write' | 'partners:approve'
  | 'analytics:read'
  | 'reports:read' | 'reports:export'
  | 'logs:read'
  | 'system:read' | 'system:write' | 'system:backup'
  | 'settings:read' | 'settings:write'
  | 'admins:manage';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  VIEWER: [
    'users:read',
    'subscriptions:read',
    'partners:read',
    'analytics:read',
    'reports:read',
    'reports:export',
    'logs:read',
    'system:read',
    'settings:read',
  ],
  EDITOR: [
    'users:read', 'users:write', 'users:suspend',
    'subscriptions:read', 'subscriptions:write',
    'partners:read', 'partners:write',
    'analytics:read',
    'reports:read', 'reports:export',
    'logs:read',
    'system:read',
    'settings:read',
  ],
  ADMIN: [
    'users:read', 'users:write', 'users:delete', 'users:suspend',
    'subscriptions:read', 'subscriptions:write',
    'partners:read', 'partners:write', 'partners:approve',
    'analytics:read',
    'reports:read', 'reports:export',
    'logs:read',
    'system:read', 'system:write', 'system:backup',
    'settings:read', 'settings:write',
    'admins:manage',
  ],
};

export function hasPermission(role: AdminRole | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as AdminRole] || [];
  return perms.includes(permission);
}

export function requirePermission(role: AdminRole | string, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function getPermissionsForRole(role: AdminRole | string): Permission[] {
  return ROLE_PERMISSIONS[role as AdminRole] || [];
}
