import { useEffect } from 'react';
import type { AccessDatasheet, UserDatasheet } from '../access';
import { useSecurityContext } from '../security';

/**
 * 登出钩子
 * @param cRedirect 当前重定向路径，当为空字符串时不进行重定向，默认：'/'
 * @param pRedirect 父级重定向路径，当为空字符串时不进行重定向，默认：'/'（如果存在父级时才会生效）
 */
export const useLogout = (cRedirect = '/', pRedirect = '/'): (() => void) => {
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
    if (cRedirect !== '') {
      navigator.navigate(cRedirect);
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
      if (pRedirect !== '') {
        p_navigator.navigate(pRedirect);
      }
    }
  };
};

/**
 * 登入钩子
 * @param cRedirect 当前重定向路径，当为空字符串时不进行重定向，默认：'/'（如果不存在原始路径时使用）
 * @param pRedirect 父级重定向路径，当为空字符串时不进行重定向，默认：'/'（如果存在父级时才会生效）
 */
export const useLogin = <Datasheet>(
  cRedirect = '/',
  pRedirect = '/',
): ((datasheet: AccessDatasheet<UserDatasheet<Datasheet>>) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  useEffect(() => {
    const isAuthentication = recorder.existAccessAuthentication() || !!storer.loadAuthentication(recorder);
    if (isAuthentication) {
      const e_parent = context.getParent();
      if (e_parent && pRedirect !== '') {
        const p_navigator = e_parent.getNavigator();
        p_navigator.navigate(pRedirect);
      } else if (cRedirect !== '') {
        const path = recorder.getOriginPath();
        if (path) {
          navigator.navigate(path);
        } else {
          navigator.navigate(cRedirect);
        }
      }
    }
  }, [cRedirect, recorder, storer, navigator, context, pRedirect]);
  return (datasheet: AccessDatasheet<UserDatasheet<Datasheet>>) => {
    storer.saveAuthentication(recorder, datasheet);
    recorder.clearAccessAuthentication();
    recorder.clearAccessAuthorization();
    const r_parent = context.getParent();
    if (r_parent && pRedirect !== '') {
      const p_navigator = r_parent.getNavigator();
      p_navigator.navigate(pRedirect);
    } else if (cRedirect !== '') {
      const path = recorder.getOriginPath();
      if (path) {
        navigator.navigate(path);
      } else {
        navigator.navigate(cRedirect);
      }
    }
  };
};
