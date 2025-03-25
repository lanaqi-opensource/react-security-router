import type { AccessPath } from './common';
import type { AccessContext } from './context';
import type { AccessResource } from './resource';

/**
 * 阻断处理器
 * @param context 上下文
 * @param currentPath 当前路径
 * @param currentResource 当前资源
 */
export type BlockHandler = (context: AccessContext, currentPath: AccessPath, currentResource: AccessResource | null) => boolean;

/**
 * 访问阻断器
 */
export interface AccessBlocker {
  /**
   * 进行阻断
   * @param context 上下文
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   */
  block(context: AccessContext, currentPath: AccessPath, currentResource: AccessResource | null): boolean;

  /**
   * 注册处理器
   * @param handler 处理器
   */
  register(handler: BlockHandler): void;

  /**
   * 注销处理器
   * @param handler 处理器
   */
  unregister(handler: BlockHandler): void;
}

/**
 * 单一阻断器
 */
export class SingleBlocker implements AccessBlocker {
  /**
   * 处理器
   * @private
   */
  private handler?: BlockHandler;

  /**
   * 进行阻断
   * @param context 上下文
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   */
  public block(context: AccessContext, currentPath: AccessPath, currentResource: AccessResource): boolean {
    if (this.handler) {
      return this.handler(context, currentPath, currentResource);
    }
    return false;
  }

  /**
   * 注册处理器
   * @param handler 处理器
   */
  public register(handler: BlockHandler): void {
    this.handler = handler;
  }

  /**
   * 注销处理器
   * @param handler 处理器
   */
  public unregister(handler: BlockHandler): void {
    this.handler = undefined;
  }
}

/**
 * 多个阻断器
 */
export class MultiBlocker implements AccessBlocker {
  /**
   * 处理器集合
   * @private
   */
  private readonly handlers: Set<BlockHandler>;

  /**
   * 构造函数
   */
  public constructor() {
    this.handlers = new Set<BlockHandler>();
  }

  /**
   * 进行阻断
   * @param context 上下文
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   */
  public block(context: AccessContext, currentPath: AccessPath, currentResource: AccessResource): boolean {
    for (const handler of this.handlers) {
      const blocked = handler(context, currentPath, currentResource);
      if (blocked) {
        return true;
      }
    }
    return false;
  }

  /**
   * 注册处理器
   * @param handler 处理器
   */
  public register(handler: BlockHandler): void {
    this.handlers.add(handler);
  }

  /**
   * 注销处理器
   * @param handler 处理器
   */
  public unregister(handler: BlockHandler): void {
    this.handlers.delete(handler);
  }

  /**
   * 清理处理器集合
   */
  public clear(): void {
    this.handlers.clear();
  }
}
