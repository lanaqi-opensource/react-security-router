import type { Path } from '../bridge';

/**
 * 访问路径
 */
export type AccessPath = Path;

/**
 * 访问权限
 */
export type AccessPermission = string;

/**
 * 访问权限集合
 */
export type AccessPermissions = AccessPermission[];

/**
 * 访问决策
 */
export enum AccessDecision {
  /**
   * 没有资源
   */
  notResource = 'notResource',

  /**
   * 没有认证
   */
  notAuthentication = 'notAuthentication',

  /**
   * 无效认证
   */
  invalidAuthentication = 'invalidAuthentication',

  /**
   * 没有授权
   */
  notAuthorization = 'notAuthorization',

  /**
   * 没有签名
   */
  notSignature = 'notSignature',

  /**
   * 访问拒绝
   */
  accessDenied = 'accessDenied',

  /**
   * 允许访问
   */
  allowAccess = 'allowAccess',
}

/**
 * 访问行为
 */
export enum AccessBehave {
  /**
   * 什么都不做
   */
  doNothing = 'doNothing',

  /**
   * 跳转导航
   */
  goNavigate = 'goNavigate',

  /**
   * 重新决策
   */
  reDecision = 'reDecision',
}
