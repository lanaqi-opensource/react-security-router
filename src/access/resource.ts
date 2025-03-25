import type { PathPattern } from '../bridge';
import type { AccessPermission, AccessPermissions } from './common';

/**
 * 资源模式
 */
export type ResourcePattern = PathPattern<string> | string;

/**
 * 资源模式集合
 */
export type ResourcePatterns = ResourcePattern[];

/**
 * 资源标签
 */
export type ResourceLabel = string;

/**
 * 资源标签集合
 */
export type ResourceLabels = ResourceLabel[];

/**
 * 访问资源
 */
export interface AccessResource {
  /**
   * 获取模式集合
   */
  getPatterns(): Set<ResourcePattern>;

  /**
   * 获取权限集合
   */
  getPermissions(): Set<AccessPermission>;

  /**
   * 获取标签集合
   */
  getLabels(): Set<ResourceLabel>;

  /**
   * 是否包含模式
   * @param pattern 模式
   */
  hasPattern(pattern: ResourcePattern): boolean;

  /**
   * 是否包含权限
   * @param permission 权限
   */
  hasPermission(permission: AccessPermission): boolean;

  /**
   * 是否包含标签
   * @param label 标签
   */
  hasLabel(label: ResourceLabel): boolean;

  /**
   * 是否匿名的
   */
  isAnonymous(): boolean;

  /**
   * 是否已认证
   */
  isAuthenticated(): boolean;

  /**
   * 是否已授权
   */
  isAuthorized(): boolean;

  /**
   * 是否已签名
   */
  isSignatured(): boolean;

  /**
   * 是否始终签名
   */
  isAlwaysSignature(): boolean;

  /**
   * 获取基础路径
   */
  getBasename(): string | undefined;

  /**
   * 设置基础路径
   */
  setBasename(basename: string | undefined): void;
}

/**
 * 访问资源集合
 */
export type AccessResources = AccessResource[];

/**
 * 简单资源
 */
export class SimpleResource implements AccessResource {
  /**
   * 权限：匿名的
   */
  public static readonly PERMISSION_ANONYMOUS = '__anonymous__';

  /**
   * 权限：已认证
   */
  public static readonly PERMISSION_AUTHENTICATED = '__authenticated__';

  /**
   * 权限：已授权
   */
  public static readonly PERMISSION_AUTHORIZED = '__authorized__';

  /**
   * 标签：已签名
   */
  public static readonly LABEL_SIGNATURED = '__signatured__';

  /**
   * 标签：始终签名
   */
  public static readonly LABEL_ALWAYS_SIGNATURE = '__always_signature__';

  /**
   * 模式集合
   * @private
   */
  private readonly patterns: Set<ResourcePattern>;

  /**
   * 权限集合
   * @private
   */
  private readonly permissions: Set<AccessPermission>;

  /**
   * 标签集合
   * @private
   */
  private readonly labels: Set<ResourceLabel>;

  /**
   * 匿名的
   * @private
   */
  private readonly anonymous: boolean;

  /**
   * 已认证
   * @private
   */
  private readonly authenticated: boolean;

  /**
   * 已授权
   * @private
   */
  private readonly authorized: boolean;

  /**
   * 已签名
   * @private
   */
  private readonly signatured: boolean;

  /**
   * 始终签名
   * @private
   */
  private readonly alwaysSignature: boolean;

  /**
   * 基础路径
   * @private
   */
  private basename?: string;

  /**
   * 构造函数
   * @param patterns 模式集合
   * @param permissions 权限集合
   * @param labels 标签集合
   * @param basename 基础路径
   */
  public constructor(
    patterns: ResourcePatterns | Set<ResourcePattern>,
    permissions: AccessPermissions | Set<AccessPermission>,
    labels: ResourceLabels | Set<ResourceLabel>,
    basename?: string,
  ) {
    this.patterns = new Set<ResourcePattern>(patterns);
    this.permissions = new Set<AccessPermission>(permissions);
    this.labels = new Set<ResourceLabel>(labels);
    // 如果模式集合为空则抛出错误
    if (this.patterns.size === 0) {
      throw new Error('访问资源模式集合不能为空，请检查！');
    }
    if (this.permissions.size === 0) {
      this.anonymous = true;
      this.authenticated = false;
      this.authorized = false;
    } else {
      if (this.permissions.has(SimpleResource.PERMISSION_ANONYMOUS)) {
        // 删除全部权限（包含其它则无意义）
        this.permissions.clear();
        this.anonymous = true;
      } else {
        this.anonymous = false;
      }
      if (this.permissions.has(SimpleResource.PERMISSION_AUTHENTICATED)) {
        // 删除全部权限（包含其它则无意义）
        this.permissions.clear();
        this.authenticated = true;
      } else {
        this.authenticated = false;
      }
      if (this.permissions.has(SimpleResource.PERMISSION_AUTHORIZED)) {
        // 删除全部权限（包含其它则无意义）
        this.permissions.clear();
        this.authorized = true;
      } else {
        this.authorized = false;
      }
    }
    if (this.labels.size === 0) {
      this.signatured = false;
      this.alwaysSignature = false;
    } else {
      if (this.labels.has(SimpleResource.LABEL_SIGNATURED)) {
        this.labels.delete(SimpleResource.LABEL_SIGNATURED);
        this.signatured = true;
      } else {
        this.signatured = false;
      }
      if (this.labels.has(SimpleResource.LABEL_ALWAYS_SIGNATURE)) {
        this.labels.delete(SimpleResource.LABEL_ALWAYS_SIGNATURE);
        this.signatured = true; // 始终签名
        this.alwaysSignature = true;
      } else {
        this.alwaysSignature = false;
      }
    }
    this.basename = basename;
  }

  /**
   * 获取模式集合
   */
  public getPatterns(): Set<ResourcePattern> {
    return this.patterns;
  }

  /**
   * 获取权限集合
   */
  public getPermissions(): Set<AccessPermission> {
    return this.permissions;
  }

  /**
   * 获取标签集合
   */
  public getLabels(): Set<ResourceLabel> {
    return this.labels;
  }

  /**
   * 是否包含模式
   * @param pattern 模式
   */
  public hasPattern(pattern: ResourcePattern): boolean {
    return this.patterns.has(pattern);
  }

  /**
   * 是否包含权限
   * @param permission 权限
   */
  public hasPermission(permission: AccessPermission): boolean {
    return this.permissions.has(permission);
  }

  /**
   * 是否包含标签
   * @param label 标签
   */
  public hasLabel(label: ResourceLabel): boolean {
    return this.labels.has(label);
  }

  /**
   * 是否匿名的
   */
  public isAnonymous(): boolean {
    return this.anonymous;
  }

  /**
   * 是否已认证
   */
  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * 是否已授权
   */
  public isAuthorized(): boolean {
    return this.authorized;
  }

  /**
   * 是否已签名
   */
  public isSignatured(): boolean {
    return this.signatured;
  }

  /**
   * 是否始终签名
   */
  public isAlwaysSignature(): boolean {
    return this.alwaysSignature;
  }

  /**
   * 获取基础路径
   */
  public getBasename(): string | undefined {
    return this.basename;
  }

  /**
   * 设置基础路径
   */
  public setBasename(basename: string | undefined): void {
    this.basename = basename;
  }
}
