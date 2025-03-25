import { type AccessHandler, type BehaveConfig, BehaveHandler } from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问处理器构建器
 */
export class AccessHandlerBuilder implements AccessBuilder<AccessHandler> {
  /**
   * 行为配置
   * @private
   */
  private _config?: BehaveConfig;

  /**
   * 设置行为配置
   * @param config 行为配置
   */
  public config(config: BehaveConfig): AccessHandlerBuilder {
    this._config = config;
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessHandler {
    if (!this._config) {
      throw new Error('行为配置是必须设置，请检查！');
    }
    return new BehaveHandler(this._config);
  }
}
