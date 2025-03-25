import { type AccessAddons, type AccessContext, type AccessManager, type AccessProvider, SimpleGuarder } from '../access';
import type { NavigateFunction } from '../bridge';
import type { AccessBuilder } from './builder';
import { AccessContextBuilder } from './context';
import { AccessManagerBuilder } from './manager';

/**
 * 访问守护器构建器
 */
export class AccessGuarderBuilder implements AccessBuilder<AccessProvider> {
  /**
   * 上下文
   * @private
   */
  private _context?: AccessContext;

  /**
   * 管理器
   * @private
   */
  private _manager?: AccessManager;

  /**
   * 插件集合
   * @private
   */
  private readonly _addons: AccessAddons = [];

  /**
   * 导航函数
   * @private
   */
  private _navigate?: NavigateFunction;

  /**
   * 设置上下文
   * @param context 上下文
   */
  public context(context: AccessContext | ((builder: AccessContextBuilder) => AccessContext)): AccessGuarderBuilder {
    if (typeof context === 'function') {
      const builder = new AccessContextBuilder();
      if (this._navigate) {
        builder.navigate(this._navigate);
      }
      this._context = context(builder);
    } else {
      this._context = context;
    }
    return this;
  }

  /**
   * 设置管理器
   * @param manager 管理器
   */
  public manager(manager: AccessManager | ((builder: AccessManagerBuilder) => AccessManager)): AccessGuarderBuilder {
    if (typeof manager === 'function') {
      this._manager = manager(new AccessManagerBuilder());
    } else {
      this._manager = manager;
    }
    return this;
  }

  /**
   * 设置插件集合
   * @param addons 插件集合
   */
  public addons(...addons: AccessAddons): AccessGuarderBuilder {
    for (const addon of addons) {
      this._addons.push(addon);
    }
    return this;
  }

  /**
   * 设置导航函数
   * @param navigate 导航函数
   */
  public navigate(navigate: NavigateFunction): AccessGuarderBuilder {
    this._navigate = navigate;
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessProvider {
    if (!this._context) {
      this.context(builder => {
        return builder.build();
      });
    }
    if (!this._manager) {
      this.manager(builder => {
        return builder.build();
      });
    }
    return {
      context: this._context as AccessContext,
      manager: this._manager as AccessManager,
      guarder: new SimpleGuarder(this._context as AccessContext, this._manager as AccessManager, this._addons),
    };
  }
}
