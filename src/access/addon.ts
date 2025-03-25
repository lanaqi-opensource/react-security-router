import type { AccessDecision, AccessPath } from './common';
import type { AccessContext } from './context';
import type { AccessManager } from './manager';
import type { AccessResource } from './resource';

/**
 * 访问插件
 */
export interface AccessAddon {
  /**
   * 守护之前
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   */
  guardBefore(context: AccessContext, manager: AccessManager, currentPath: AccessPath, currentResource: AccessResource | null): void;

  /**
   * 守护之后
   * @param context 上下文
   *  @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   * @param currentDecision 当前决策
   */
  guardAfter(
    context: AccessContext,
    manager: AccessManager,
    currentPath: AccessPath,
    currentResource: AccessResource | null,
    currentDecision: AccessDecision,
  ): void;

  /**
   * 许可之前
   * @param context 上下文
   *  @param manager 管理器
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   * @param stayResource 停留资源
   * @param blockResource 阻断资源
   */
  permitBefore(
    context: AccessContext,
    manager: AccessManager,
    stayPath: AccessPath,
    blockPath: AccessPath,
    stayResource: AccessResource | null,
    blockResource: AccessResource | null,
  ): void;

  /**
   * 许可之后函数
   * @param context 上下文
   *  @param manager 管理器
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   * @param stayResource 停留资源
   * @param blockResource 阻断资源
   */
  permitAfter(
    context: AccessContext,
    manager: AccessManager,
    stayPath: AccessPath,
    blockPath: AccessPath,
    stayResource: AccessResource | null,
    blockResource: AccessResource | null,
  ): void;
}

/**
 * 访问插件集合
 */
export type AccessAddons = AccessAddon[];

/**
 * 抽象的访问插件
 */
export abstract class AbstractAddon implements AccessAddon {
  /**
   * 守护之前
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   */
  public guardBefore(context: AccessContext, manager: AccessManager, currentPath: AccessPath, currentResource: AccessResource | null): void {}

  /**
   * 守护之后
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   * @param currentDecision 当前决策
   */
  public guardAfter(
    context: AccessContext,
    manager: AccessManager,
    currentPath: AccessPath,
    currentResource: AccessResource | null,
    currentDecision: AccessDecision,
  ): void {}

  /**
   * 许可之前
   * @param context 上下文
   * @param manager 管理器
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   * @param stayResource 停留资源
   * @param blockResource 阻断资源
   */
  public permitBefore(
    context: AccessContext,
    manager: AccessManager,
    stayPath: AccessPath,
    blockPath: AccessPath,
    stayResource: AccessResource | null,
    blockResource: AccessResource | null,
  ): void {}

  /**
   * 许可之后函数
   * @param context 上下文
   * @param manager 管理器
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   * @param stayResource 停留资源
   * @param blockResource 阻断资源
   */
  public permitAfter(
    context: AccessContext,
    manager: AccessManager,
    stayPath: AccessPath,
    blockPath: AccessPath,
    stayResource: AccessResource | null,
    blockResource: AccessResource | null,
  ): void {}
}
