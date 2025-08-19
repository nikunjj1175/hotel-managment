export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

export function getPortalPath(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/super-admin';
    case 'ADMIN': return '/admin';
    case 'KITCHEN': return '/kitchen';
    case 'DELIVERY': return '/delivery';
    default: return '/';
  }
}


