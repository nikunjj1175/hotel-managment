import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../store';
import { getPortalPath, Role } from '../utils/roles';

export function RequireRole({ children, allow }: PropsWithChildren<{ allow: Role[] }>) {
  const router = useRouter();
  const { user, hydrated } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allow.includes(user.role as Role)) {
      router.replace(getPortalPath(user.role as Role));
    }
  }, [user, router, allow, hydrated]);

  if (!hydrated) return null;
  if (!user || !allow.includes(user.role as Role)) return null;
  return children as any;
}


