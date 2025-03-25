import type { AccessAuthentication, AccessAuthorization, AccessDatasheet, AuthenticationDatasheet, AuthorizationDatasheet } from '../access';
import { useSecurityContext } from '../security';

/**
 * 取得认证钩子
 */
export const useObtainAuthentication = (): (() => AccessAuthentication | undefined) => {
  const { context } = useSecurityContext();
  const storer = context.getStorer();
  const recorder = context.getRecorder();
  return (): AccessAuthentication | undefined => {
    let authentication = recorder.getAccessAuthentication();
    if (!authentication) {
      authentication = storer.loadAuthentication(recorder);
      if (authentication) {
        recorder.setAccessAuthentication(authentication);
      }
    }
    return authentication;
  };
};

/**
 * 取得授权钩子
 */
export const useObtainAuthorization = (): (() => AccessAuthorization | undefined) => {
  const obtainAuthentication = useObtainAuthentication();
  const { context } = useSecurityContext();
  const storer = context.getStorer();
  const recorder = context.getRecorder();
  return (): AccessAuthorization | undefined => {
    let authorization = recorder.getAccessAuthorization();
    if (!authorization) {
      const authentication = obtainAuthentication();
      authorization = storer.loadAuthorization(recorder, authentication);
      if (authorization) {
        recorder.setAccessAuthorization(authorization);
      }
    }
    return authorization;
  };
};

/**
 * 删除认证钩子
 */
export const useDeleteAuthentication = (): (() => void) => {
  const { context } = useSecurityContext();
  const storer = context.getStorer();
  const recorder = context.getRecorder();
  return () => {
    storer.deleteAuthentication(recorder);
    storer.deleteAuthorization(recorder);
    recorder.clearAccessAuthentication();
    recorder.clearAccessAuthorization();
    const parent = context.getParent();
    if (parent) {
      const p_recorder = parent.getRecorder();
      const p_storer = parent.getStorer();
      p_storer.deleteAuthentication(p_recorder);
      p_storer.deleteAuthorization(p_recorder);
      p_recorder.clearAccessAuthentication();
      p_recorder.clearAccessAuthorization();
    }
  };
};

/**
 * 删除授权钩子
 */
export const useDeleteAuthorization = (): (() => void) => {
  const { context } = useSecurityContext();
  const storer = context.getStorer();
  const recorder = context.getRecorder();
  return () => {
    storer.deleteAuthorization(recorder);
    recorder.clearAccessAuthorization();
    const parent = context.getParent();
    if (parent) {
      const p_recorder = parent.getRecorder();
      const p_storer = parent.getStorer();
      p_storer.deleteAuthorization(p_recorder);
      p_recorder.clearAccessAuthorization();
    }
  };
};

/**
 * 保存认证钩子
 * @param navigate 是否导航
 * @param redirect 重定向路径（如果不存在原始路径时使用）
 */
export const useSaveAuthentication = <Datasheet>(
  navigate = false,
  redirect = '/',
): ((datasheet: AccessDatasheet<AuthenticationDatasheet<Datasheet>>) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  return (datasheet: AccessDatasheet<AuthenticationDatasheet<Datasheet>>) => {
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

/**
 * 保存授权钩子
 * @param navigate 是否导航
 * @param redirect 重定向路径（如果不存在原始路径时使用）
 */
export const useSaveAuthorization = <Datasheet>(
  navigate = false,
  redirect = '/',
): ((datasheet: AccessDatasheet<AuthorizationDatasheet<Datasheet>>) => void) => {
  const { context } = useSecurityContext();
  const recorder = context.getRecorder();
  const storer = context.getStorer();
  const navigator = context.getNavigator();
  return (datasheet: AccessDatasheet<AuthorizationDatasheet<Datasheet>>) => {
    storer.saveAuthorization(recorder, datasheet);
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
