import type { ComponentType, PropsWithChildren } from 'react';
import type { AccessPermission, AccessPermissions } from '../access';
import { useHavePermission } from '../support';

/**
 * 权限条件
 */
export type PermissionTerm = PropsWithChildren<{
  /**
   * 条件
   */
  readonly term: AccessPermission | AccessPermissions;
}>;

/**
 * 拥有权限组件
 * @param children 子组件
 * @param term 条件
 * @constructor
 */
export function HavePermission({ children, term }: PermissionTerm) {
  const havePermission = useHavePermission();
  const have = havePermission(term);
  if (!have) {
    return <></>;
  } else {
    return <>{children}</>;
  }
}

/**
 * 拥有权限包装
 * @param Component 组件
 * @param term 条件
 */
export const withHavePermission = (Component: ComponentType, term: AccessPermission | AccessPermissions) => {
  return () => (
    <HavePermission term={term}>
      <Component />
    </HavePermission>
  );
};
