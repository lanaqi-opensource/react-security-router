import { useCallback, useEffect, useState } from 'react';
import type { AccessContext, AccessPath, AccessResource, BlockHandler } from '../access';
import { useSecurityContext } from '../security';

/**
 * 自定义阻断器钩子
 * @param handler 处理器
 */
export const useCustomBlocker = (handler: BlockHandler): void => {
  const { manager } = useSecurityContext();
  const blocker = manager.getBlocker();
  useEffect(() => {
    blocker.register(handler);
    return () => {
      blocker.unregister(handler);
    };
  }, [blocker, handler]);
};

/**
 * 安全阻断器钩子
 * @param recover 是否恢复 blocked = false
 */
export const useSecurityBlocker = (
  recover = true,
): {
  /**
   * 是否已阻断
   */
  blocked: boolean;
  /**
   * 处理阻断（即继续访问）
   */
  proceed: () => void;
  /**
   * 重置阻断（即不再访问）
   */
  reset: () => void;
  /**
   * 阻断路径
   */
  path: AccessPath | undefined;
} => {
  const { context, manager } = useSecurityContext();
  const blocker = manager.getBlocker();
  const [path, setPath] = useState<AccessPath | undefined>();
  const [jump, setJump] = useState<boolean>(false);
  const [blocked, setBlocked] = useState<boolean>(false);
  const proceed = useCallback(() => {
    if (path) {
      setJump(true);
      if (recover) {
        setPath(undefined);
        setBlocked(false);
      }
      context.getNavigator().navigate(path);
    }
  }, [context, path, recover]);
  const reset = useCallback(() => {
    setPath(undefined);
    setJump(false);
    setBlocked(false);
  }, []);
  const handler = useCallback<BlockHandler>(
    (context: AccessContext, currentPath: AccessPath, currentResource: AccessResource | null) => {
      setJump(false);
      if (jump) {
        return false;
      } else {
        setPath(currentPath);
        setBlocked(true);
        return true;
      }
    },
    [jump],
  );
  useEffect(() => {
    blocker.register(handler);
    return () => {
      blocker.unregister(handler);
    };
  }, [blocker, handler]);
  return { blocked, proceed, reset, path };
};
