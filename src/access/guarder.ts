import type { AccessAuthentication, AccessAuthorization } from './aaa';
import type { AccessAddon, AccessAddons } from './addon';
import { AccessBehave, AccessDecision, type AccessPath } from './common';
import type { AccessContext } from './context';
import type { AccessManager } from './manager';
import type { AccessResource } from './resource';

/**
 * 访问守护器
 */
export interface AccessGuarder {
  /**
   * 守护决策
   * @param blockPath 阻断路径
   */
  guardDecision(blockPath: AccessPath): AccessDecision;

  /**
   * 守护处理
   * @param currentDecision 当前决策
   * @param beforeDecision 之前决策
   */
  guardHandle(currentDecision: AccessDecision, beforeDecision?: AccessDecision): AccessBehave;

  /**
   * 守护阻断
   * @param currentPath 当前路径
   * @return 是否阻断
   */
  guardBlock(currentPath: AccessPath): boolean;

  /**
   * 守护之前
   * @param currentPath 当前路径
   */
  guardBefore(currentPath: AccessPath): void;

  /**
   * 守护之后
   * @param currentPath 当前路径
   * @param currentDecision 当前决策
   */
  guardAfter(currentPath: AccessPath, currentDecision: AccessDecision): void;

  /**
   * 许可之前
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   */
  permitBefore(stayPath: AccessPath, blockPath: AccessPath): void;

  /**
   * 许可之前
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   */
  permitAfter(stayPath: AccessPath, blockPath: AccessPath): void;
}

/**
 * 简单守护器
 */
export class SimpleGuarder implements AccessGuarder {
  /**
   * 上下文
   * @private
   */
  private readonly context: AccessContext;

  /**
   * 管理器
   * @private
   */
  private readonly manager: AccessManager;

  /**
   * 插件集合
   * @private
   */
  private readonly addons: AccessAddons;

  /**
   * 构造函数
   * @param context 上下文
   * @param manager 管理器
   */
  public constructor(context: AccessContext, manager: AccessManager, addons: AccessAddons) {
    this.context = context;
    this.manager = manager;
    this.addons = addons;
  }

  /**
   * 守护决策
   * @param blockPath 阻断路径
   */
  public guardDecision(blockPath: AccessPath): AccessDecision {
    const recorder = this.context.getRecorder();
    // 设置记录器当前路径
    recorder.setCurrentPath(blockPath);
    // 取得资源
    const resource = this.obtainResource(blockPath);
    // 取得认证，如果记录器中存在认证则从记录器中获取
    let authentication: AccessAuthentication | undefined;
    if (recorder.existAccessAuthentication()) {
      authentication = recorder.getAccessAuthentication() as AccessAuthentication;
    } else {
      authentication = this.obtainAuthentication();
      if (authentication) {
        // 设置记录器认证
        recorder.setAccessAuthentication(authentication);
      }
    }
    // 取得授权，如果记录器中存在授权则从记录器中获取
    let authorization: AccessAuthorization | undefined;
    if (recorder.existAccessAuthorization()) {
      authorization = recorder.getAccessAuthorization() as AccessAuthorization;
    } else {
      authorization = this.obtainAuthorization(authentication);
      if (authorization) {
        // 设置记录器授权
        recorder.setAccessAuthorization(authorization);
      }
    }
    // 如果不存在资源则返回
    if (!resource) {
      // 清理记录器资源
      recorder.clearAccessResource();
      // 返回没有资源
      return AccessDecision.notResource;
    } else {
      // 设置记录器资源
      recorder.setAccessResource(resource);
    }
    // 如果资源是标记匿名的则返回
    if (resource.isAnonymous()) {
      // 设置记录器允许路径
      recorder.setAllowPath(blockPath);
      // 返回允许访问
      return AccessDecision.allowAccess;
    }
    // 如果不存在认证或认证未标记已认证则返回
    if (!authentication || !authentication.isAuthenticated()) {
      // 设置记录器原始路径
      recorder.setOriginPath(blockPath);
      // 返回没有认证
      return AccessDecision.notAuthentication;
    } else {
      // 清理记录器原始路径
      recorder.clearOriginPath();
    }
    // 检查认证
    const valid = this.checkAuthentication(authentication);
    // 如果无效的则返回
    if (!valid) {
      // 设置记录器原始路径
      recorder.setOriginPath(blockPath);
      // 返回无效认证
      return AccessDecision.invalidAuthentication;
    } else {
      // 清理记录器原始路径
      recorder.clearOriginPath();
    }
    // 如果资源是标记已认证返回，则会优先加载授权，但不会校验授权（用于已认证的可以取得对应的授权）
    if (resource.isAuthenticated()) {
      // 设置记录器允许路径
      recorder.setAllowPath(blockPath);
      // 返回允许访问
      return AccessDecision.allowAccess;
    }
    if (!authorization) {
      // 设置记录器原始路径
      recorder.setOriginPath(blockPath);
      // 返回没有授权
      return AccessDecision.notAuthorization;
    } else {
      // 清理记录器原始路径
      recorder.clearOriginPath();
    }
    // 如果资源是标记已授权返回
    if (resource.isAuthorized()) {
      // 设置记录器允许路径
      recorder.setAllowPath(blockPath);
      // 返回允许访问
      return AccessDecision.allowAccess;
    }
    // 检查权限
    const authorized = this.checkPermission(resource, authorization);
    // 如果未授权则返回
    if (!authorized) {
      // 设置记录器原始路径
      recorder.setOriginPath(blockPath);
      // 返回拒绝访问
      return AccessDecision.accessDenied;
    } else {
      // 清理记录器原始路径
      recorder.clearOriginPath();
    }
    // 如果资源是标记已签名并检查签名（需要签名）则返回
    if (resource.isSignatured() && !this.checkSignature(blockPath, authentication, authorization)) {
      // 设置记录器原始路径
      recorder.setOriginPath(blockPath);
      // 返回没有签名
      return AccessDecision.notSignature;
    } else {
      // 清理记录器原始路径
      recorder.clearOriginPath();
    }
    // 设置记录器允许路径
    recorder.setAllowPath(blockPath);
    // 返回允许访问
    return AccessDecision.allowAccess;
  }

  /**
   * 守护处理
   * @param currentDecision 当前决策
   * @param beforeDecision 之前决策
   */
  public guardHandle(currentDecision: AccessDecision, beforeDecision?: AccessDecision): AccessBehave {
    const recorder = this.context.getRecorder();
    const storer = this.context.getStorer();
    const handler = this.manager.getHandler();
    // 如果存在之前决策同时又是当前决策以及不是允许访问决策，那么就执行错误决策处理
    if (beforeDecision && beforeDecision !== AccessDecision.allowAccess && beforeDecision === currentDecision) {
      // 特殊要求：如果是无效认证，那么则需要清理认证授权以及签名
      if (beforeDecision === AccessDecision.invalidAuthentication) {
        // 清理相关
        recorder.clearAccessAuthentication();
        recorder.clearAccessAuthorization();
        storer.deleteAuthentication(recorder);
        storer.deleteAuthorization(recorder);
        storer.deleteSignature(recorder);
      }
      // 执行错误决策
      handler.errorDecision(this.context, currentDecision);
      return AccessBehave.doNothing;
    }
    let behave: AccessBehave;
    switch (currentDecision) {
      // 没有资源
      case AccessDecision.notResource: {
        behave = handler.notResource(this.context);
        break;
      }
      // 没有认证
      case AccessDecision.notAuthentication: {
        // 清理相关
        recorder.clearAccessAuthentication();
        recorder.clearAccessAuthorization();
        storer.deleteAuthentication(recorder);
        storer.deleteAuthorization(recorder);
        storer.deleteSignature(recorder);
        behave = handler.notAuthentication(this.context);
        break;
      }
      // 无效认证
      case AccessDecision.invalidAuthentication: {
        behave = handler.invalidAuthentication(this.context);
        break;
      }
      // 没有授权
      case AccessDecision.notAuthorization: {
        // 清理相关
        recorder.clearAccessAuthorization();
        storer.deleteAuthorization(recorder);
        storer.deleteSignature(recorder);
        behave = handler.notAuthorization(this.context);
        break;
      }
      // 没有签名
      case AccessDecision.notSignature: {
        behave = handler.notSignature(this.context);
        break;
      }
      // 允许访问
      case AccessDecision.allowAccess: {
        behave = handler.allowAccess(this.context);
        break;
      }
      // 拒绝访问
      case AccessDecision.accessDenied:
      default: {
        behave = handler.accessDenied(this.context);
        break;
      }
    }
    return behave;
  }

  /**
   * 守护阻断
   * @param currentPath 当前路径
   * @return 是否阻断
   */
  public guardBlock(currentPath: AccessPath): boolean {
    const currentResource = this.obtainResource(currentPath);
    const blocker = this.manager.getBlocker();
    return blocker.block(this.context, currentPath, currentResource);
  }

  /**
   * 守护之前
   * @param currentPath 当前路径
   */
  public guardBefore(currentPath: AccessPath): void {
    const currentResource = this.obtainResource(currentPath);
    this.forAddons(addon => {
      addon.guardBefore(this.context, this.manager, currentPath, currentResource);
    });
  }

  /**
   * 守护之后
   * @param currentPath 当前路径
   * @param currentDecision 当前决策
   */
  public guardAfter(currentPath: AccessPath, currentDecision: AccessDecision): void {
    const currentResource = this.obtainResource(currentPath);
    this.forAddons(addon => {
      addon.guardAfter(this.context, this.manager, currentPath, currentResource, currentDecision);
    });
  }

  /**
   * 许可之前
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   */
  public permitBefore(stayPath: AccessPath, blockPath: AccessPath): void {
    const stayResource = this.obtainResource(stayPath);
    const blockResource = this.obtainResource(blockPath);
    this.clearSignature(stayPath, stayResource); // 清理签名
    this.forAddons(addon => {
      addon.permitBefore(this.context, this.manager, stayPath, blockPath, stayResource, blockResource);
    });
  }

  /**
   * 许可之后
   * @param stayPath 停留路径
   * @param blockPath 阻断路径
   */
  public permitAfter(stayPath: AccessPath, blockPath: AccessPath): void {
    const stayResource = this.obtainResource(stayPath);
    const blockResource = this.obtainResource(blockPath);
    this.forAddons(addon => {
      addon.permitAfter(this.context, this.manager, stayPath, blockPath, stayResource, blockResource);
    });
  }

  /**
   * 遍历插件集合
   * @param fn 执行插件函数
   */
  private forAddons(fn: (addon: AccessAddon) => void): void {
    if (Array.isArray(this.addons) && this.addons.length > 0) {
      for (const addon of this.addons) {
        fn(addon);
      }
    }
  }

  /**
   * 取得资源
   * @param path 路径
   * @private
   */
  private obtainResource(path: AccessPath): AccessResource | null {
    const matcher = this.context.getMatcher();
    return matcher.obtain(path);
  }

  /**
   * 取得认证
   * @private
   */
  private obtainAuthentication(): AccessAuthentication | undefined {
    const storer = this.context.getStorer();
    const recorder = this.context.getRecorder();
    return storer.loadAuthentication(recorder);
  }

  /**
   * 检查认证
   * @param authentication 认证
   * @private
   */
  private checkAuthentication(authentication: AccessAuthentication): boolean {
    const storer = this.context.getStorer();
    const recorder = this.context.getRecorder();
    return storer.verifyAuthentication(recorder, authentication);
  }

  /**
   * 取得授权
   * @param authentication 认证 | undefined
   * @private
   */
  private obtainAuthorization(authentication: AccessAuthentication | undefined): AccessAuthorization | undefined {
    const storer = this.context.getStorer();
    const recorder = this.context.getRecorder();
    return storer.loadAuthorization(recorder, authentication);
  }

  /**
   * 检查授权
   * @param resource 资源
   * @param authorization 授权
   * @private
   */
  private checkPermission(resource: AccessResource, authorization: AccessAuthorization): boolean {
    const voter = this.context.getVoter();
    return voter.vote(resource.getPermissions(), authorization.getPermissions());
  }

  /**
   * 检查签名
   * @param path 路径
   * @param authentication 认证
   * @param authorization 授权
   * @private
   */
  private checkSignature(path: AccessPath, authentication: AccessAuthentication, authorization: AccessAuthorization): boolean {
    const storer = this.context.getStorer();
    const recorder = this.context.getRecorder();
    return storer.loadSignature(recorder, path, authentication, authorization);
  }

  /**
   * 清理签名
   * @param stayPath 停留路径
   * @param stayResource 停留资源
   * @private
   */
  private clearSignature(stayPath: AccessPath, stayResource: AccessResource | null): void {
    if (stayResource?.isSignatured() && stayResource.isAlwaysSignature()) {
      const storer = this.context.getStorer();
      const recorder = this.context.getRecorder();
      storer.removeSignature(recorder, stayPath);
    }
  }
}

/**
 * 访问提供者
 */
export type AccessProvider = {
  context: AccessContext;
  manager: AccessManager;
  guarder: AccessGuarder;
};
