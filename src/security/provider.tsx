import { useMemo } from 'react';
import type { AccessProvider } from '../access';
import { useNavigate } from '../bridge';
import { AccessGuarderBuilder } from '../builder';
import { SecurityContext } from './context';
import { SecurityBlocker } from './blocker';

/**
 * 安全打包器
 */
export type SecurityBundler = (builder: AccessGuarderBuilder) => AccessProvider;

/**
 * 安全提供者组件属性
 */
export interface SecurityProviderProps extends React.PropsWithChildren {
  /**
   * 打包器
   */
  readonly bundler: SecurityBundler;
}

/**
 * 安全提供者组件
 */
export function SecurityProvider({ children, bundler }: SecurityProviderProps) {
  const navigate = useNavigate();

  const provide = useMemo(() => {
    return bundler(new AccessGuarderBuilder().navigate(navigate));
  }, [bundler, navigate]);

  return (
    <SecurityContext value={provide}>
      <SecurityBlocker>{children}</SecurityBlocker>
    </SecurityContext>
  );
}

/**
 * 安全阻断器包装
 * @param Component 组件
 * @param bundler 打包器
 */
export const withSecurityBlocker = (Component: React.ComponentType, bundler: SecurityBundler) => {
  return () => (
    <SecurityProvider bundler={bundler}>
      <Component />
    </SecurityProvider>
  );
};
