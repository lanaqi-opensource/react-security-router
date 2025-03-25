import { type AccessMatcher, type AccessResource, type AccessResources, SimpleMatcher } from '../access';
import type { AccessBuilder } from './builder';
import { AccessResourceBuilder, type AccessResourceConfig, type AccessResourceConfigs } from './resource';

/**
 * 访问匹配器构建器
 */
export class AccessMatcherBuilder implements AccessBuilder<AccessMatcher> {
  /**
   * 资源集合
   * @private
   */
  private readonly _resources: AccessResources = [];

  /**
   * 添加资源配置
   * @param config 资源配置
   */
  public config(config: AccessResourceConfig): AccessMatcherBuilder {
    this._resources.push(new AccessResourceBuilder().config(config).build());
    return this;
  }

  /**
   * 添加资源配置集合
   * @param configs 资源配置集合
   */
  public configs(...configs: AccessResourceConfigs): AccessMatcherBuilder {
    for (const config of configs) {
      this.config(config);
    }
    return this;
  }

  /**
   * 添加资源
   * @param builder 资源构建器
   */
  public resource(builder: (builder: AccessResourceBuilder) => AccessResource): AccessMatcherBuilder {
    this._resources.push(builder(new AccessResourceBuilder()));
    return this;
  }

  /**
   * 添加资源集合
   * @param resources 资源集合
   */
  public resources(resources: AccessResources): AccessMatcherBuilder {
    this._resources.push(...resources);
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessMatcher {
    return new SimpleMatcher(this._resources);
  }
}
