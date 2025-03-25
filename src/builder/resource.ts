import {
  type AccessPermission,
  type AccessPermissions,
  type AccessResource,
  type ResourceLabel,
  type ResourceLabels,
  type ResourcePattern,
  type ResourcePatterns,
  SimpleResource,
} from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问资源配置
 */
export type AccessResourceConfig = {
  /**
   * 模式集合
   */
  readonly patterns: ResourcePatterns;

  /**
   * 权限集合
   */
  readonly permissions: AccessPermissions;

  /**
   * 标签集合
   */
  readonly labels?: ResourceLabels;

  /**
   * 基础路径
   */
  readonly basename?: string;
};

/**
 * 访问资源配置集合
 */
export type AccessResourceConfigs = AccessResourceConfig[];

/**
 * 访问资源构建器
 */
export class AccessResourceBuilder implements AccessBuilder<AccessResource> {
  /**
   * 模式集合
   * @private
   */
  private readonly _patterns: Set<ResourcePattern> = new Set<ResourcePattern>();

  /**
   * 权限集合
   * @private
   */
  private readonly _permissions: Set<AccessPermission> = new Set<AccessPermission>();

  /**
   * 标签集合
   * @private
   */
  private readonly _labels: Set<ResourceLabel> = new Set<ResourceLabel>();

  /**
   * 基础路径
   * @private
   */
  private _basename?: string;

  /**
   * 添加模式集合
   * @param patterns 模式集合
   */
  public patterns(...patterns: ResourcePatterns): AccessResourceBuilder {
    for (const pattern of patterns) {
      this._patterns.add(pattern);
    }
    return this;
  }

  /**
   * 添加权限集合
   * @param permissions 权限集合
   */
  public permissions(...permissions: AccessPermissions): AccessResourceBuilder {
    for (const permission of permissions) {
      this._permissions.add(permission);
    }
    return this;
  }

  /**
   * 添加标签集合
   * @param labels 标签集合
   */
  public labels(...labels: ResourceLabels): AccessResourceBuilder {
    for (const label of labels) {
      this._labels.add(label);
    }
    return this;
  }

  /**
   * 标记匿名的权限
   */
  public anonymous(): AccessResourceBuilder {
    this._permissions.add(SimpleResource.PERMISSION_ANONYMOUS);
    return this;
  }

  /**
   * 标记已认证权限
   */
  public authenticated(): AccessResourceBuilder {
    this._permissions.add(SimpleResource.PERMISSION_AUTHENTICATED);
    return this;
  }

  /**
   * 标记已授权权限
   */
  public authorized(): AccessResourceBuilder {
    this._permissions.add(SimpleResource.PERMISSION_AUTHORIZED);
    return this;
  }

  /**
   * 标记已签名标签
   */
  public signatured(): AccessResourceBuilder {
    this._labels.add(SimpleResource.LABEL_SIGNATURED);
    return this;
  }

  /**
   * 标记始终签名标签
   */
  public alwaysSignature(): AccessResourceBuilder {
    this.signatured();
    this._labels.add(SimpleResource.LABEL_ALWAYS_SIGNATURE);
    return this;
  }

  /**
   * 设置基础路径
   * @param basename 基础路径
   */
  public basename(basename: string): AccessResourceBuilder {
    this._basename = basename;
    return this;
  }

  /**
   * 通过配置添加相关
   * @param config 资源配置
   */
  public config(config: AccessResourceConfig): AccessResourceBuilder {
    this.patterns(...config.patterns).permissions(...config.permissions);
    if (config.labels) {
      this.labels(...config.labels);
    }
    if (config.basename) {
      this.basename(config.basename);
    }
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessResource {
    return new SimpleResource(this._patterns, this._permissions, this._labels, this._basename);
  }
}
