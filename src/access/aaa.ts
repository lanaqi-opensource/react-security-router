import type { AccessPermission, AccessPermissions } from './common';

/**
 * 访问认证
 */
export interface AccessAuthentication {
  /**
   * 是否已认证
   */
  isAuthenticated(): boolean;

  /**
   * 设置已认证
   * @param authenticated 已认证
   */
  setAuthenticated(authenticated: boolean): void;
}

/**
 * 访问授权
 */
export interface AccessAuthorization {
  /**
   * 获取权限集合
   */
  getPermissions(): Set<AccessPermission>;
}

/**
 * 访问数据表
 */
export interface AccessDatasheet<Datasheet> {
  /**
   * 获取数据表
   */
  getDatasheet(): Datasheet;
}

/**
 * 认证数据表
 */
export type AuthenticationDatasheet<P = unknown> = P & {
  /**
   * 已认证
   */
  readonly authenticated: boolean;
};

/**
 * 授权数据表
 */
export type AuthorizationDatasheet<P = unknown> = P & {
  /**
   * 权限集合
   */
  readonly permissions: AccessPermissions | Set<AccessPermission>;
};

/**
 * 用户数据表
 */
export type UserDatasheet<P = unknown> = P &
  AuthenticationDatasheet<P> &
  AuthorizationDatasheet<P> & {
    /**
     * 无效的
     */
    readonly invalid?: boolean;
  };

/**
 * 简单认证
 */
export class SimpleAuthentication<Datasheet> implements AccessAuthentication, AccessDatasheet<AuthenticationDatasheet<Datasheet>> {
  /**
   * 数据表
   * @private
   */
  private readonly datasheet: AuthenticationDatasheet<Datasheet>;

  /**
   * 已认证
   * @private
   */
  private authenticated: boolean;

  /**
   * 构造函数
   * @param datasheet 数据表
   */
  public constructor(datasheet: AuthenticationDatasheet<Datasheet>) {
    this.datasheet = datasheet;
    this.authenticated = this.datasheet.authenticated ?? false;
  }

  /**
   * 是否已认证
   */
  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * 设置已认证
   * @param authenticated 已认证
   */
  public setAuthenticated(authenticated: boolean): void {
    this.authenticated = authenticated;
  }

  /**
   * 获取数据表
   */
  public getDatasheet(): AuthenticationDatasheet<Datasheet> {
    return this.datasheet;
  }
}

/**
 * 简单授权
 */
export class SimpleAuthorization<Datasheet> implements AccessAuthorization, AccessDatasheet<AuthorizationDatasheet<Datasheet>> {
  /**
   * 数据表
   * @private
   */
  private readonly datasheet: AuthorizationDatasheet<Datasheet>;

  /**
   * 权限集合
   * @private
   */
  private readonly permissions: Set<AccessPermission>;

  /**
   * 构造函数
   * @param datasheet 数据表
   */
  public constructor(datasheet: AuthorizationDatasheet<Datasheet>) {
    this.datasheet = datasheet;
    this.permissions = new Set<AccessPermission>(this.datasheet.permissions);
  }

  /**
   * 获取权限集合
   */
  public getPermissions(): Set<AccessPermission> {
    return this.permissions;
  }

  /**
   * 获取数据表
   */
  public getDatasheet(): AuthorizationDatasheet<Datasheet> {
    return this.datasheet;
  }
}

/**
 * 简单用户
 */
export class SimpleUser<Datasheet> implements AccessAuthentication, AccessAuthorization, AccessDatasheet<UserDatasheet<Datasheet>> {
  /**
   * 数据表
   * @private
   */
  private readonly datasheet: UserDatasheet<Datasheet>;

  /**
   * 权限集合
   * @private
   */
  private readonly permissions: Set<AccessPermission>;

  /**
   * 已认证
   * @private
   */
  private authenticated: boolean;

  /**
   * 无效的
   * @private
   */
  private invalid: boolean;

  /**
   * 构造函数
   * @param datasheet 数据表
   */
  public constructor(datasheet: UserDatasheet<Datasheet>) {
    this.datasheet = datasheet;
    this.permissions = new Set<AccessPermission>(this.datasheet.permissions);
    this.authenticated = this.datasheet.authenticated ?? false;
    this.invalid = this.datasheet.invalid ?? false;
  }

  /**
   * 是否已认证
   */
  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * 设置已认证
   * @param authenticated 已认证
   */
  public setAuthenticated(authenticated: boolean): void {
    this.authenticated = authenticated;
  }

  /**
   * 获取权限集合
   */
  public getPermissions(): Set<AccessPermission> {
    return this.permissions;
  }

  /**
   * 获取数据表
   */
  public getDatasheet(): UserDatasheet<Datasheet> {
    return this.datasheet;
  }

  /**
   * 是否无效的
   */
  public isInvalid(): boolean {
    return this.invalid;
  }

  /**
   * 设置无效的
   * @param invalid 无效的
   */
  public setInvalid(invalid: boolean): void {
    this.invalid = invalid;
  }
}
