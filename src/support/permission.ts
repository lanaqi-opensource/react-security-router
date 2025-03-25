import type { AccessPermission, AccessPermissions } from '../access';
import { useSecurityContext } from '../security';
import { useObtainAuthorization } from './aaa';

/**
 * 拥有权限钩子
 */
export const useHavePermission = (): ((term: AccessPermission | AccessPermissions) => boolean) => {
  const obtainAuthorization = useObtainAuthorization();
  const { context } = useSecurityContext();
  const voter = context.getVoter();
  return (term: AccessPermission | AccessPermissions) => {
    let have = false;
    const authorization = obtainAuthorization();
    if (authorization) {
      let permissions: AccessPermissions;
      if (!Array.isArray(term)) {
        permissions = [term];
      } else {
        permissions = term;
      }
      have = voter.vote(new Set<AccessPermission>(permissions), authorization.getPermissions());
    }
    return have;
  };
};
