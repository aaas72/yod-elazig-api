import { Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '../constants/permissions';
import { ROLES } from '../constants/roles';

// authorizePermission('users', 'delete')
type PermissionResource = keyof typeof PERMISSIONS;
type PermissionAction<R extends PermissionResource> = keyof typeof PERMISSIONS[R];

export default function authorizePermission<
  R extends PermissionResource,
  A extends PermissionAction<R>
>(resource: R, action: A) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    console.log('[authorizePermission] user:', user, 'resource:', resource, 'action:', action);
    if (!user) return res.status(401).json({ message: 'غير مصرح. يجب تسجيل الدخول.' });
    const allowed = PERMISSIONS[resource]?.[action] as string[] | undefined;
    if (!allowed) {
      console.log('[authorizePermission] Permission config error for resource:', resource, 'action:', action);
      return res.status(403).json({ message: 'خطأ في إعدادات الصلاحيات. يرجى مراجعة الإدارة.' });
    }
    if (!allowed.includes(user.role)) {
      let msg = 'ليس لديك صلاحية لهذا الإجراء.';
      if (resource === 'users' && action === 'delete') {
        msg = 'فقط السوبر أدمن يمكنه حذف المستخدمين.';
      } else if (resource === 'users') {
        msg = 'هذه العملية متاحة فقط للسوبر أدمن أو الأدمن.';
      } else if (resource === 'news' || resource === 'events') {
        msg = 'هذه العملية متاحة فقط للمحررين أو الإدارة.';
      }
      console.log('[authorizePermission] Forbidden for role:', user.role, 'allowed:', allowed);
      return res.status(403).json({ message: msg });
    }
    console.log('[authorizePermission] Access granted for user:', user._id, 'role:', user.role);
    return next();
  };
}
