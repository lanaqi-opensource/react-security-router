import type { AccessAuthentication, AccessAuthorization } from './aaa';
import type { AccessPath } from './common';
import type { AccessResource } from './resource';

/**
 * 访问记录器
 */
export interface AccessRecorder {
  /**
   * 获取当前路径
   */
  getCurrentPath(): AccessPath | undefined;

  /**
   * 设置当前路径
   * @param currentPath 当前路径
   */
  setCurrentPath(currentPath: AccessPath): void;

  /**
   * 存在当前路径
   */
  existCurrentPath(): boolean;

  /**
   * 是否当前路径名
   * @param pathname 路径名
   */
  isCurrentPath(pathname: string): boolean;

  /**
   * 是否当前路径名集合
   * @param pathnames 路径名集合
   */
  isCurrentPaths(...pathnames: string[]): boolean;

  /**
   * 获取允许路径
   */
  getAllowPath(): AccessPath | undefined;

  /**
   * 设置允许路径
   * @param allowPath 允许路径
   */
  setAllowPath(allowPath: AccessPath): void;

  /**
   * 存在允许路径
   */
  existAllowPath(): boolean;

  /**
   * 是否允许路径名
   * @param pathname 路径名
   */
  isAllowPath(pathname: string): boolean;

  /**
   * 是否允许路径名集合
   * @param pathnames 路径名集合
   */
  isAllowPaths(...pathnames: string[]): boolean;

  /**
   * 获取原始路径
   */
  getOriginPath(): AccessPath | undefined;

  /**
   * 设置原始路径
   * @param originPath 原始路径
   */
  setOriginPath(originPath: AccessPath): void;

  /**
   * 存在原始路径
   */
  existOriginPath(): boolean;

  /**
   * 是否原始路径名
   * @param pathname 路径名
   */
  isOriginPath(pathname: string): boolean;

  /**
   * 是否原始路径名集合
   * @param pathnames 路径名集合
   */
  isOriginPaths(...pathnames: string[]): boolean;

  /**
   * 获取访问资源
   */
  getAccessResource(): AccessResource | undefined;

  /**
   * 设置访问资源
   * @param accessResource 访问资源
   */
  setAccessResource(accessResource: AccessResource): void;

  /**
   * 存在访问资源
   */
  existAccessResource(): boolean;

  /**
   * 获取访问认证
   */
  getAccessAuthentication(): AccessAuthentication | undefined;

  /**
   * 设置访问认证
   * @param accessAuthentication 访问认证
   */
  setAccessAuthentication(accessAuthentication: AccessAuthentication): void;

  /**
   * 存在访问认证
   */
  existAccessAuthentication(): boolean;

  /**
   * 获取访问授权
   */
  getAccessAuthorization(): AccessAuthorization | undefined;

  /**
   * 设置访问授权
   * @param accessAuthorization 访问授权
   */
  setAccessAuthorization(accessAuthorization: AccessAuthorization): void;

  /**
   * 存在访问授权
   */
  existAccessAuthorization(): boolean;

  /**
   * 清理原始路径
   */
  clearOriginPath(): void;

  /**
   * 清理访问资源
   */
  clearAccessResource(): void;

  /**
   * 清理访问认证
   */
  clearAccessAuthentication(): void;

  /**
   * 清理访问授权
   */
  clearAccessAuthorization(): void;
}

/**
 * 简单记录器
 */
export class SimpleRecorder implements AccessRecorder {
  /**
   * 当前路径
   * @private
   */
  private currentPath?: AccessPath;

  /**
   * 允许路径
   * @private
   */
  private allowPath?: AccessPath;

  /**
   * 原始路径
   * @private
   */
  private originPath?: AccessPath;

  /**
   * 访问资源
   * @private
   */
  private accessResource?: AccessResource;

  /**
   * 访问认证
   * @private
   */
  private accessAuthentication?: AccessAuthentication;

  /**
   * 访问授权
   * @private
   */
  private accessAuthorization?: AccessAuthorization;

  /**
   * 获取当前路径
   */
  public getCurrentPath(): AccessPath | undefined {
    return this.currentPath;
  }

  /**
   * 设置当前路径
   * @param currentPath 当前路径
   */
  public setCurrentPath(currentPath: AccessPath): void {
    this.currentPath = currentPath;
  }

  /**
   * 存在当前路径
   */
  public existCurrentPath(): boolean {
    return !!this.currentPath;
  }

  /**
   * 是否当前路径名
   * @param pathname 当前路径名
   */
  public isCurrentPath(pathname: string): boolean {
    if (this.currentPath) {
      return this.currentPath.pathname === pathname;
    }
    return false;
  }

  /**
   * 是否当前路径名集合
   * @param pathnames 路径名集合
   */
  public isCurrentPaths(...pathnames: string[]): boolean {
    for (const pathname of pathnames) {
      const yes = this.isCurrentPath(pathname);
      if (yes) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取允许路径
   */
  public getAllowPath(): AccessPath | undefined {
    return this.allowPath;
  }

  /**
   * 设置允许路径
   * @param allowPath 允许路径
   */
  public setAllowPath(allowPath: AccessPath): void {
    this.allowPath = allowPath;
  }

  /**
   * 存在允许路径
   */
  public existAllowPath(): boolean {
    return !!this.allowPath;
  }

  /**
   * 是否允许路径名
   * @param pathname 允许路径名
   */
  public isAllowPath(pathname: string): boolean {
    if (this.allowPath) {
      return this.allowPath.pathname === pathname;
    }
    return false;
  }

  /**
   * 是否允许路径名集合
   * @param pathnames 路径名集合
   */
  public isAllowPaths(...pathnames: string[]): boolean {
    for (const pathname of pathnames) {
      const yes = this.isAllowPath(pathname);
      if (yes) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取原始路径
   */
  public getOriginPath(): AccessPath | undefined {
    return this.originPath;
  }

  /**
   * 设置原始路径
   * @param originPath 原始路径
   */
  public setOriginPath(originPath: AccessPath): void {
    this.originPath = originPath;
  }

  /**
   * 存在原始路径
   */
  public existOriginPath(): boolean {
    return !!this.originPath;
  }

  /**
   * 是否原始路径名
   * @param pathname 路径名
   */
  public isOriginPath(pathname: string): boolean {
    if (this.originPath) {
      return this.originPath.pathname === pathname;
    }
    return false;
  }

  /**
   * 是否原始路径名集合
   * @param pathnames 路径名集合
   */
  public isOriginPaths(...pathnames: string[]): boolean {
    for (const pathname of pathnames) {
      const yes = this.isOriginPath(pathname);
      if (yes) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取访问资源
   */
  public getAccessResource(): AccessResource | undefined {
    return this.accessResource;
  }

  /**
   * 设置访问资源
   * @param accessResource 访问资源
   */
  public setAccessResource(accessResource: AccessResource): void {
    this.accessResource = accessResource;
  }

  /**
   * 存在访问资源
   */
  public existAccessResource(): boolean {
    return !!this.accessResource;
  }

  /**
   * 获取访问认证
   */
  public getAccessAuthentication(): AccessAuthentication | undefined {
    return this.accessAuthentication;
  }

  /**
   * 设置访问认证
   * @param accessAuthentication 访问认证
   */
  public setAccessAuthentication(accessAuthentication: AccessAuthentication): void {
    this.accessAuthentication = accessAuthentication;
  }

  /**
   * 存在访问认证
   */
  public existAccessAuthentication(): boolean {
    return !!this.accessAuthentication;
  }

  /**
   * 获取访问授权
   */
  public getAccessAuthorization(): AccessAuthorization | undefined {
    return this.accessAuthorization;
  }

  /**
   * 设置访问授权
   * @param accessAuthorization 访问授权
   */
  public setAccessAuthorization(accessAuthorization: AccessAuthorization): void {
    this.accessAuthorization = accessAuthorization;
  }

  /**
   * 存在访问授权
   */
  public existAccessAuthorization(): boolean {
    return !!this.accessAuthorization;
  }

  /**
   * 清理原始路径
   */
  public clearOriginPath(): void {
    this.originPath = undefined;
  }

  /**
   * 清理访问资源
   */
  public clearAccessResource(): void {
    this.accessResource = undefined;
  }

  /**
   * 清理访问认证
   */
  public clearAccessAuthentication(): void {
    this.accessAuthentication = undefined;
  }

  /**
   * 清理访问授权
   */
  public clearAccessAuthorization(): void {
    this.accessAuthorization = undefined;
  }
}
