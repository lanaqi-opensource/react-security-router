import type { NavigateFunction, NavigateOptions, To } from '../bridge';

/**
 * 访问导航器
 */
export interface AccessNavigator {
  /**
   * 进行导航
   * @param to 路径
   * @param options 可选配置
   */
  navigate(to: To, options?: NavigateOptions): void;
}

/**
 * 简单导航器
 */
export class SimpleNavigator implements AccessNavigator {
  /**
   * 导航函数
   * @private
   */
  private readonly _navigate: NavigateFunction;

  /**
   * 构造函数
   * @param navigate 导航函数
   */
  public constructor(navigate: NavigateFunction) {
    this._navigate = navigate;
  }

  /**
   * 进行导航
   * @param to 路径
   * @param options 可选配置
   */
  public navigate(to: To, options?: NavigateOptions): void {
    this._navigate(to, options);
  }
}
