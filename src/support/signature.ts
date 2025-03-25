import { useEffect } from 'react';
import type { AccessPath } from '../access';
import { useSecurityContext } from '../security';

/**
 * 保存签名钩子
 * @param navigate 是否导航（默认：true）
 * @param redirect 重定向路径（如果不存在原始路径时使用）
 */
export const useSaveSignature = (navigate = true, redirect = '/'): ((path?: AccessPath) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  return (path?: AccessPath) => {
    let target: AccessPath | undefined;
    if (path) {
      target = path;
    } else {
      target = recorder.getOriginPath();
    }
    if (target) {
      storer.saveSignature(recorder, target);
    }
    if (navigate) {
      if (target) {
        navigator.navigate(target);
      } else {
        navigator.navigate(redirect);
      }
    }
  };
};

/**
 * 删除签名钩子
 */
export const useDeleteSignature = (): (() => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  return () => {
    storer.deleteSignature(recorder);
  };
};

/**
 * 移除签名钩子
 */
export const useRemoveSignature = (): ((path: string | AccessPath) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  return (path: string | AccessPath) => {
    if (typeof path === 'string') {
      storer.removeSignature(recorder, {
        pathname: path,
        search: '',
        hash: '',
      });
    } else {
      storer.removeSignature(recorder, path);
    }
  };
};

/**
 * 清除签名（当前路径）钩子
 *
 * 当触发销毁时执行清除
 */
export const usePurgeSignature = (): void => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const path = recorder.getCurrentPath();
  useEffect(() => {
    return () => {
      if (path) {
        storer.removeSignature(recorder, path);
      }
    };
  }, [recorder, storer, path]);
};
