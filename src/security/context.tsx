import { createContext, use } from 'react';
import type { AccessProvider } from '../access';

/**
 * 安全上下文
 */
export const SecurityContext = createContext<AccessProvider | null>(null);

/**
 * 安全上下文钩子
 */
export const useSecurityContext = () => {
  const sc = use(SecurityContext);

  if (!sc) {
    throw new Error('安全上下文为空，必须使用安全提供者包裹组件来设置安全上下文');
  }

  return sc;
};
