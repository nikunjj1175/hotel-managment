export type Role = 'SUPER_ADMIN' | 'CAFE_ADMIN' | 'KITCHEN' | 'WAITER' | 'MANAGER' | 'CUSTOMER';

export const ROLES: Record<Role, { label: string; description: string; permissions: string[] }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Company Owner - Full system access',
    permissions: [
      'manage_cafes',
      'manage_subscriptions',
      'view_analytics',
      'manage_system_settings',
      'view_reports',
      'manage_users'
    ]
  },
  CAFE_ADMIN: {
    label: 'Cafe Admin',
    description: 'Cafe Owner/Manager - Full cafe access',
    permissions: [
      'manage_cafe_profile',
      'manage_menu',
      'manage_tables',
      'manage_orders',
      'manage_staff',
      'view_cafe_analytics',
      'manage_payments'
    ]
  },
  KITCHEN: {
    label: 'Kitchen Staff',
    description: 'Kitchen personnel - Order management',
    permissions: [
      'view_orders',
      'update_order_status',
      'manage_cooking_queue',
      'view_menu'
    ]
  },
  WAITER: {
    label: 'Waiter',
    description: 'Service staff - Customer interaction',
    permissions: [
      'view_orders',
      'update_order_status',
      'manage_cash_payments',
      'view_tables',
      'serve_orders'
    ]
  },
  MANAGER: {
    label: 'Manager',
    description: 'Cafe supervisor - Staff oversight',
    permissions: [
      'view_orders',
      'manage_staff',
      'assign_orders',
      'view_analytics',
      'manage_cafe_operations'
    ]
  },
  CUSTOMER: {
    label: 'Customer',
    description: 'End user - Order placement',
    permissions: [
      'view_menu',
      'place_orders',
      'track_orders',
      'make_payments',
      'view_order_history'
    ]
  }
};

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'CAFE_ADMIN', 'KITCHEN', 'WAITER', 'MANAGER', 'CUSTOMER'],
  CAFE_ADMIN: ['CAFE_ADMIN', 'KITCHEN', 'WAITER', 'MANAGER', 'CUSTOMER'],
  KITCHEN: ['KITCHEN'],
  WAITER: ['WAITER'],
  MANAGER: ['MANAGER', 'KITCHEN', 'WAITER'],
  CUSTOMER: ['CUSTOMER']
};

export function hasPermission(userRole: Role, requiredPermission: string): boolean {
  const userPermissions = ROLES[userRole]?.permissions || [];
  return userPermissions.includes(requiredPermission);
}

export function canManageRole(userRole: Role, targetRole: Role): boolean {
  const manageableRoles = ROLE_HIERARCHY[userRole] || [];
  return manageableRoles.includes(targetRole);
}

export function getRoleLabel(role: Role): string {
  return ROLES[role]?.label || role;
}

export function getRoleDescription(role: Role): string {
  return ROLES[role]?.description || '';
}

export function getRolePermissions(role: Role): string[] {
  return ROLES[role]?.permissions || [];
}

export function isAdminRole(role: Role): boolean {
  return ['SUPER_ADMIN', 'CAFE_ADMIN'].includes(role);
}

export function isStaffRole(role: Role): boolean {
  return ['KITCHEN', 'WAITER', 'MANAGER'].includes(role);
}

export function isCustomerRole(role: Role): boolean {
  return role === 'CUSTOMER';
}

export function getPortalPath(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'CAFE_ADMIN':
      return '/cafe-admin';
    case 'KITCHEN':
      return '/kitchen';
    case 'WAITER':
      return '/waiter';
    case 'MANAGER':
      return '/manager';
    case 'CUSTOMER':
      return '/customer';
    default:
      return '/login';
  }
}


