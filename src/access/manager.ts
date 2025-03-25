import type { AccessBlocker } from './blocker';
import type { AccessHandler } from './handler';

/**
 * 访问管理器
 */
export interface AccessManager {
  /**
   * 是否已禁用
   */
  isDisabled(): boolean;

  /**
   * 设置已禁用
   */
  setDisabled(disabled: boolean): void;

  /**
   * 获取处理器
   */
  getHandler(): AccessHandler;

  /**
   * 设置处理器
   * @param handler 处理器
   */
  setHandler(handler: AccessHandler): void;

  /**
   * 获取阻断器
   */
  getBlocker(): AccessBlocker;

  /**
   * 设置阻断器
   * @param blocker 阻断器
   */
  setBlocker(blocker: AccessBlocker): void;

  /**
   * 获取父级
   */
  getParent(): AccessManager | undefined;

  /**
   * 设置父级
   * @param parent 父级
   */
  setParent(parent: AccessManager): void;
}

/**
 * 简单管理器
 */
export class SimpleManager implements AccessManager {
  /**
   * 已禁用
   * @private
   */
  private disabled: boolean;

  /**
   * 处理器
   * @private
   */
  private handler: AccessHandler;

  /**
   * 阻断器
   * @private
   */
  private blocker: AccessBlocker;

  /**
   * 父级
   * @private
   */
  private parent?: AccessManager;

  /**
   * 构造函数
   * @param disabled 已禁用
   * @param handler 处理器
   * @param blocker 阻断器
   */
  public constructor(disabled: boolean, handler: AccessHandler, blocker: AccessBlocker) {
    this.disabled = disabled;
    this.handler = handler;
    this.blocker = blocker;
  }

  /**
   * 获取是否已禁用
   */
  public isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * 设置是否已禁用
   */
  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * 获取处理器
   */
  public getHandler(): AccessHandler {
    return this.handler;
  }

  /**
   * 设置处理器
   * @param handler 处理器
   */
  public setHandler(handler: AccessHandler): void {
    this.handler = handler;
  }

  /**
   * 获取阻断器
   */
  public getBlocker(): AccessBlocker {
    return this.blocker;
  }

  /**
   * 设置阻断器
   * @param blocker 阻断器
   */
  public setBlocker(blocker: AccessBlocker): void {
    this.blocker = blocker;
  }

  /**
   * 获取父级
   */
  public getParent(): AccessManager | undefined {
    return this.parent;
  }

  /**
   * 设置父级
   * @param parent 父级
   */
  public setParent(parent?: AccessManager): void {
    this.parent = parent;
  }
}
