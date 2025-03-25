import { type AccessBlocker, MultiBlocker, SingleBlocker } from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问阻断器构建器
 */
export class AccessBlockerBuilder implements AccessBuilder<AccessBlocker> {
  /**
   * 是否多阻断器
   * @private
   */
  private _multi?: boolean;

  /**
   * 标记多阻断器
   */
  public multi(): AccessBlockerBuilder {
    this._multi = true;
    return this;
  }

  /**
   * 标记单阻断器
   */
  public single(): AccessBlockerBuilder {
    this._multi = false;
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessBlocker {
    if (this._multi) {
      return new MultiBlocker();
    } else {
      return new SingleBlocker();
    }
  }
}
