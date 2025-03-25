import { useEffect } from 'react';
import type { AccessDatasheet, UserDatasheet } from '../access';
import { useSecurityContext } from '../security';

/**
 * 登出钩子
 * @param navigate 是否导航（默认：true）
 * @param redirect 重定向路径（如果不存在原始路径时使用）
 */
export const useLogout = (navigate = true, redirect = '/'): (() => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  return () => {
    storer.deleteAuthentication(recorder);
    storer.deleteAuthorization(recorder);
    storer.deleteSignature(recorder);
    recorder.clearAccessAuthentication();
    recorder.clearAccessAuthorization();
    if (navigate) {
      navigator.navigate(redirect);
    }
    const parent = context.getParent();
    if (parent) {
      const p_recorder = parent.getRecorder();
      const p_storer = parent.getStorer();
      const p_navigator = parent.getNavigator();
      p_storer.deleteAuthentication(p_recorder);
      p_storer.deleteAuthorization(p_recorder);
      p_storer.deleteSignature(p_recorder);
      p_recorder.clearAccessAuthentication();
      p_recorder.clearAccessAuthorization();
      if (navigate) {
        p_navigator.navigate(redirect);
      }
    }
  };
};

/**
 * 登入钩子
 * @param logined 已登录跳转
 * @param navigate 是否导航（默认：true）
 * @param redirect 重定向路径（如果不存在原始路径时使用）
 */
export const useLogin = <Datasheet>(logined = false, navigate = true, redirect = '/'): ((datasheet: AccessDatasheet<UserDatasheet<Datasheet>>) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  useEffect(() => {
    const isAuthentication = recorder.existAccessAuthentication() || !!storer.loadAuthentication(recorder);
    if (logined && isAuthentication) {
      navigator.navigate(redirect);
    }
  }, [logined, redirect, recorder, storer, navigator]);
  return (datasheet: AccessDatasheet<UserDatasheet<Datasheet>>) => {
    storer.saveAuthentication(recorder, datasheet);
    recorder.clearAccessAuthentication();
    recorder.clearAccessAuthorization();
    if (navigate) {
      const path = recorder.getOriginPath();
      if (path) {
        navigator.navigate(path);
      } else {
        navigator.navigate(redirect);
      }
    }
  };
};
