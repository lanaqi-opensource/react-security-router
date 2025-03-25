import { type AccessBlocker, type AccessHandler, type AccessManager, type BehaveConfig, SimpleManager } from '../access';
import { AccessBlockerBuilder } from './blocker';
import type { AccessBuilder } from './builder';
import { AccessHandlerBuilder } from './handler';

/**
 * 访问管理器构建器
 */
export class AccessManagerBuilder implements AccessBuilder<AccessManager> {
  /**
   * 是否禁用
   */
  private _disabled = false;

  /**
   * 处理器
   * @private
   */
  private _handler?: AccessHandler;

  /**
   * 阻断器
   * @private
   */
  private _blocker?: AccessBlocker;

  /**
   * 行为配置
   * @private
   */
  private _behave?: BehaveConfig;

  /**
   * 设置已禁用
   */
  public disabled(): AccessManagerBuilder {
    this._disabled = true;
    return this;
  }

  /**
   * 设置处理器
   * @param handler 处理器或处理构建器
   */
  public handler(handler: AccessHandler | ((builder: AccessHandlerBuilder) => AccessHandler)): AccessManagerBuilder {
    if (typeof handler === 'function') {
      this._handler = handler(new AccessHandlerBuilder());
    } else {
      this._handler = handler;
    }
    return this;
  }

  /**
   * 设置阻断器
   * @param blocker 阻断器或阻断构建器
   */
  public blocker(blocker: AccessBlocker | ((builder: AccessBlockerBuilder) => AccessBlocker)): AccessManagerBuilder {
    if (typeof blocker === 'function') {
      this._blocker = blocker(new AccessBlockerBuilder());
    } else {
      this._blocker = blocker;
    }
    return this;
  }

  /**
   * 设置行为配置
   * @param behave 行为配置
   */
  public behave(behave: BehaveConfig): AccessManagerBuilder {
    this._behave = behave;
    return this;
  }

  /**
   * 默认行为配置
   */
  public dbc(): AccessManagerBuilder {
    return this.behave({
      notAuthenticationPath: '/login',
      accessDeniedPath: '/denied',
      notSignaturePath: '/signature',
    });
  }

  /**
   * 构建
   */
  public build(): AccessManager {
    if (!this._handler) {
      this.handler(builder => {
        if (!this._behave) {
          this.dbc();
        }
        return builder.config(this._behave as BehaveConfig).build();
      });
    }
    if (!this._blocker) {
      this.blocker(builder => builder.single().build());
    }
    return new SimpleManager(this._disabled ?? false, this._handler as AccessHandler, this._blocker as AccessBlocker);
  }
}
