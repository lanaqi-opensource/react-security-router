import type { AccessPermission, AccessPermissions } from '../access';
import { useHavePermission } from '../support';

/**
 * 拥有权限组件属性
 */
export interface HavePermissionProps extends React.PropsWithChildren {
  /**
   * 条件
   */
  readonly term: AccessPermission | AccessPermissions;
}

/**
 * 拥有权限组件
 */
export function HavePermission({ children, term }: HavePermissionProps) {
  const havePermission = useHavePermission();
  const have = havePermission(term);
  if (!have) {
    return null;
  } else {
    return children;
  }
}

/**
 * 拥有权限包装
 * @param Component 组件
 * @param term 条件
 */
export const withHavePermission = (Component: React.ComponentType, term: AccessPermission | AccessPermissions) => {
  return () => (
    <HavePermission term={term}>
      <Component />
    </HavePermission>
  );
};
