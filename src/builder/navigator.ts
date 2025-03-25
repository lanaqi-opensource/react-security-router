import { type AccessNavigator, SimpleNavigator } from '../access';
import type { NavigateFunction } from '../bridge';
import type { AccessBuilder } from './builder';

/**
 * 访问导航器构建器
 */
export class AccessNavigatorBuilder implements AccessBuilder<AccessNavigator> {
  /**
   * 导航函数
   * @private
   */
  private _navigate?: NavigateFunction;

  /**
   * 设置导航函数
   * @param navigate 导航函数
   */
  public navigate(navigate: NavigateFunction): AccessNavigatorBuilder {
    this._navigate = navigate;
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessNavigator {
    if (!this._navigate) {
      throw new Error('导航函数是必须设置的，请检查！');
    }
    return new SimpleNavigator(this._navigate);
  }
}
