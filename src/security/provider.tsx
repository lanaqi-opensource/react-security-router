import { type PropsWithChildren, createContext, useContext, useMemo } from 'react';
import type { AccessProvider } from '../access';
import { useNavigate } from '../bridge';
import { AccessGuarderBuilder } from '../builder';

/**
 * 安全打包器
 */
export type SecurityBundler = (builder: AccessGuarderBuilder) => AccessProvider;

/**
 * 安全安装器
 */
export type SecurityInstaller = PropsWithChildren<{
  /**
   * 打包器
   */
  readonly bundler: SecurityBundler;
}>;

/**
 * 安全上下文
 */
export const SecurityContext = createContext<AccessProvider | null>(null);

/**
 * 安全上下文钩子
 */
export const useSecurityContext = () => {
  const sc = useContext(SecurityContext);
  if (!sc) {
    throw new Error('安全上下文为空，必须使用安全提供者包裹组件来设置安全上下文');
  }
  return sc;
};

/**
 * 安全提供者组件
 * @param children 子组件
 * @param bundler 打包器
 * @constructor
 */
export function SecurityProvider({ children, bundler }: SecurityInstaller) {
  const navigate = useNavigate();
  const provide = useMemo(() => {
    return bundler(new AccessGuarderBuilder().navigate(navigate));
  }, [bundler, navigate]);
  return <SecurityContext.Provider value={provide}>{children}</SecurityContext.Provider>;
}
