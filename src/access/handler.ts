import { AccessBehave, AccessDecision, type AccessPath } from './common';
import type { AccessContext } from './context';

/**
 * 访问处理器
 */
export interface AccessHandler {
  /**
   * 没有资源
   * @param context 上下文
   */
  notResource(context: AccessContext): AccessBehave;

  /**
   * 没有认证
   * @param context 上下文
   */
  notAuthentication(context: AccessContext): AccessBehave;

  /**
   * 无效认证
   * @param context 上下文
   */
  invalidAuthentication(context: AccessContext): AccessBehave;

  /**
   * 没有授权
   * @param context 上下文
   */
  notAuthorization(context: AccessContext): AccessBehave;

  /**
   * 没有签名
   * @param context 上下文
   */
  notSignature(context: AccessContext): AccessBehave;

  /**
   * 访问拒绝
   * @param context 上下文
   */
  accessDenied(context: AccessContext): AccessBehave;

  /**
   * 允许访问
   * @param context 上下文
   */
  allowAccess(context: AccessContext): AccessBehave;

  /**
   * 错误决策
   * @param context 上下文
   * @param decision 决策
   */
  errorDecision(context: AccessContext, decision: AccessDecision): void;
}

/**
 * 行为路径
 */
export type BehavePath = string | Partial<AccessPath>;

/**
 * 行为配置
 */
export type BehaveConfig = {
  /**
   * 没有资源路径值
   */
  readonly notResourcePath?: BehavePath;

  /**
   * 没有资源函数
   * @param context 上下文
   */
  readonly notResourceFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 没有认证路径值
   */
  readonly notAuthenticationPath?: BehavePath;

  /**
   * 没有认证函数
   * @param context 上下文
   */
  readonly notAuthenticationFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 无效认证路径值
   */
  readonly invalidAuthenticationPath?: BehavePath;

  /**
   * 无效认证函数
   * @param context 上下文
   */
  readonly invalidAuthenticationFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 没有授权路径值
   */
  readonly notAuthorizationPath?: BehavePath;

  /**
   * 没有授权函数
   * @param context 上下文
   */
  readonly notAuthorizationFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 没有签名路径值
   */
  readonly notSignaturePath?: BehavePath;

  /**
   * 没有签名函数
   * @param context 上下文
   */
  readonly notSignatureFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 拒绝访问路径值
   */
  readonly accessDeniedPath?: BehavePath;

  /**
   * 拒绝访问函数
   * @param context 上下文
   */
  readonly accessDeniedFunc?: (context: AccessContext) => AccessBehave;

  /**
   * 允许访问函数
   * @param context 上下文
   */
  readonly allowAccessFunc?: (context: AccessContext) => void;

  /**
   * 错误决策函数
   * @param context 上下文
   * @param decision 决策
   */
  readonly errorDecisionFunc?: (context: AccessContext, decision: AccessDecision) => void;
};

/**
 * 行为处理器
 */
export class BehaveHandler implements AccessHandler {
  /**
   * 行为配置
   * @private
   */
  private _config: BehaveConfig;

  /**
   * 构造函数
   * @param config 行为配置
   */
  public constructor(config: BehaveConfig) {
    this._config = config;
  }

  /**
   * 覆盖配置
   * @param config 行为配置
   */
  public config(config: BehaveConfig): void {
    this._config = config;
  }

  /**
   * 没有资源
   * @param context 上下文
   */
  public notResource(context: AccessContext): AccessBehave {
    if (this._config.notResourcePath) {
      context.getNavigator().navigate(this._config.notResourcePath);
      return AccessBehave.goNavigate;
    } else if (this._config.notResourceFunc) {
      return this._config.notResourceFunc(context);
    } else {
      return this.accessDenied(context);
    }
  }

  /**
   * 没有认证
   * @param context 上下文
   */
  public notAuthentication(context: AccessContext): AccessBehave {
    if (this._config.notAuthenticationPath) {
      context.getNavigator().navigate(this._config.notAuthenticationPath);
      return AccessBehave.goNavigate;
    } else if (this._config.notAuthenticationFunc) {
      return this._config.notAuthenticationFunc(context);
    } else {
      throw new Error('没有认证的行为是必须配置的，请检查！');
    }
  }

  /**
   * 无效认证
   * @param context 上下文
   */
  public invalidAuthentication(context: AccessContext): AccessBehave {
    if (this._config.invalidAuthenticationPath) {
      context.getNavigator().navigate(this._config.invalidAuthenticationPath);
      return AccessBehave.goNavigate;
    } else if (this._config.invalidAuthenticationFunc) {
      return this._config.invalidAuthenticationFunc(context);
    } else {
      return this.notAuthentication(context);
    }
  }

  /**
   * 没有授权
   * @param context 上下文
   */
  public notAuthorization(context: AccessContext): AccessBehave {
    if (this._config.notAuthorizationPath) {
      context.getNavigator().navigate(this._config.notAuthorizationPath);
      return AccessBehave.goNavigate;
    } else if (this._config.notAuthorizationFunc) {
      return this._config.notAuthorizationFunc(context);
    } else {
      return this.accessDenied(context);
    }
  }

  /**
   * 没有签名
   * @param context 上下文
   */
  public notSignature(context: AccessContext): AccessBehave {
    if (this._config.notSignaturePath) {
      context.getNavigator().navigate(this._config.notSignaturePath);
      return AccessBehave.goNavigate;
    } else if (this._config.notSignatureFunc) {
      return this._config.notSignatureFunc(context);
    } else {
      return this.accessDenied(context);
    }
  }

  /**
   * 拒绝访问
   * @param context 上下文
   */
  public accessDenied(context: AccessContext): AccessBehave {
    if (this._config.accessDeniedPath) {
      context.getNavigator().navigate(this._config.accessDeniedPath);
      return AccessBehave.goNavigate;
    } else if (this._config.accessDeniedFunc) {
      return this._config.accessDeniedFunc(context);
    } else {
      throw new Error('拒绝访问的行为是必须配置的，请检查！');
    }
  }

  /**
   * 允许访问
   * @param context 上下文
   */
  public allowAccess(context: AccessContext): AccessBehave {
    if (this._config.allowAccessFunc) {
      this._config.allowAccessFunc(context);
    }
    return AccessBehave.doNothing;
  }

  /**
   * 错误决策
   * @param context 上下文
   * @param decision 决策
   */
  public errorDecision(context: AccessContext, decision: AccessDecision): void {
    if (this._config.errorDecisionFunc) {
      this._config.errorDecisionFunc(context, decision);
      return;
    }
    // 没有签名默认情况下忽略，即不再路由
    if (decision === AccessDecision.notSignature) {
      return;
    }
    switch (decision) {
      // 没有资源
      case AccessDecision.notResource: {
        this.accessDenied(context);
        break;
      }
      // 没有认证
      case AccessDecision.notAuthentication: {
        throw new Error('没有认证的错误决策，请检查！');
      }
      // 无效认证
      case AccessDecision.invalidAuthentication: {
        this.notAuthentication(context);
        break;
      }
      // 没有授权
      case AccessDecision.notAuthorization: {
        this.accessDenied(context);
        break;
      }
      // 拒绝访问
      case AccessDecision.accessDenied:
      default: {
        throw new Error('拒绝访问的错误决策，请检查！');
      }
    }
  }
}
