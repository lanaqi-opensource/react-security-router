import {
  type AccessAuthentication,
  type AccessAuthorization,
  type AccessDatasheet,
  type AuthenticationDatasheet,
  type AuthorizationDatasheet,
  SimpleAuthentication,
  SimpleAuthorization,
  SimpleUser,
  type UserDatasheet,
} from './aaa';
import type { AccessPath } from './common';
import type { AccessRecorder } from './recorder';

/**
 * 访问存储器
 */
export interface AccessStorer {
  /**
   * 加载认证
   * @param recorder 记录器
   */
  loadAuthentication(recorder: AccessRecorder): AccessAuthentication | undefined;

  /**
   * 校验认证
   * @param recorder 记录器
   * @param authentication 认证
   */
  verifyAuthentication(recorder: AccessRecorder, authentication: AccessAuthentication): boolean;

  /**
   * 删除认证
   * @param recorder 记录器
   */
  deleteAuthentication(recorder: AccessRecorder): void;

  /**
   * 保存认证
   * @param recorder 记录器
   * @param datasheet 数据表
   */
  saveAuthentication<Datasheet>(recorder: AccessRecorder, datasheet: AccessDatasheet<AuthenticationDatasheet<Datasheet>>): void;

  /**
   * 加载授权
   * @param recorder 记录器
   * @param authentication 认证 | undefined
   */
  loadAuthorization(recorder: AccessRecorder, authentication: AccessAuthentication | undefined): AccessAuthorization | undefined;

  /**
   * 删除授权
   * @param recorder 记录器
   */
  deleteAuthorization(recorder: AccessRecorder): void;

  /**
   * 保存授权
   * @param recorder 记录器
   * @param datasheet 数据表
   */
  saveAuthorization<Datasheet>(recorder: AccessRecorder, datasheet: AccessDatasheet<AuthorizationDatasheet<Datasheet>>): void;

  /**
   * 加载签名
   * @param recorder 记录器
   * @param path 路径
   * @param authentication 认证
   * @param authorization 授权
   */
  loadSignature(recorder: AccessRecorder, path: AccessPath, authentication: AccessAuthentication, authorization: AccessAuthorization): boolean;

  /**
   * 移除签名
   * @param recorder 记录器
   * @param path 路径
   */
  removeSignature(recorder: AccessRecorder, path: AccessPath): void;

  /**
   * 删除签名
   * @param recorder 记录器
   */
  deleteSignature(recorder: AccessRecorder): void;

  /**
   * 保存签名
   * @param recorder 记录器
   * @param path 路径
   */
  saveSignature(recorder: AccessRecorder, path: AccessPath): void;
}

/**
 * 访问验证器
 */
export type AccessValidator = (recorder: AccessRecorder, authentication: AccessAuthentication) => boolean;

/**
 * 简单存储器
 */
export class SimpleStorer implements AccessStorer {
  /**
   * 存储健：认证
   */
  public static readonly KEY_AUTHENTICATION = '__authentication__';

  /**
   * 存储健：授权
   */
  public static readonly KEY_AUTHORIZATION = '__authorization__';

  /**
   * 存储健：签名
   */
  public static readonly KEY_SIGNATURE = '__signature__';

  /**
   * 认证与授权存储
   * @private
   */
  private readonly aaaStorage: Storage;

  /**
   * 签名存储
   * @private
   */
  private readonly signStorage: Storage;

  /**
   * 认证健
   * @private
   */
  private readonly authenticationKey: string;

  /**
   * 授权健
   * @private
   */
  private readonly authorizationKey: string;

  /**
   * 签名健
   * @private
   */
  private readonly signatureKey: string;

  /**
   * 认证验证器
   * @private
   */
  private readonly authenticationValidator?: AccessValidator;

  /**
   * 构造函数
   * @param aaaStorage 认证与授权存储
   * @param signStorage 签名存储
   * @param authenticationKey 认证健
   * @param authorizationKey 授权健
   * @param signatureKey 签名健
   * @param authenticationValidator 认证验证器
   */
  public constructor(
    aaaStorage: Storage,
    signStorage: Storage,
    authenticationKey = SimpleStorer.KEY_AUTHENTICATION,
    authorizationKey = SimpleStorer.KEY_AUTHORIZATION,
    signatureKey = SimpleStorer.KEY_SIGNATURE,
    authenticationValidator?: AccessValidator,
  ) {
    this.aaaStorage = aaaStorage;
    this.signStorage = signStorage;
    this.authenticationKey = authenticationKey;
    this.authorizationKey = authorizationKey;
    this.signatureKey = signatureKey;
    this.authenticationValidator = authenticationValidator;
  }

  /**
   * 加载认证
   * @param recorder 记录器
   */
  public loadAuthentication(recorder: AccessRecorder): AccessAuthentication | undefined {
    const authenticationStr = this.aaaStorage.getItem(this.authenticationKey);
    if (authenticationStr) {
      const authenticationObj = JSON.parse(authenticationStr);
      if (typeof authenticationObj.authenticated === 'boolean') {
        if (typeof authenticationObj.permissions !== 'undefined' && Array.isArray(authenticationObj.permissions)) {
          return new SimpleUser(authenticationObj as UserDatasheet);
        } else {
          return new SimpleAuthentication(authenticationObj);
        }
      }
    }
    return undefined;
  }

  /**
   * 校验认证
   * @param recorder 记录器
   * @param authentication 认证
   */
  public verifyAuthentication(recorder: AccessRecorder, authentication: AccessAuthentication): boolean {
    if (this.authenticationValidator) {
      return this.authenticationValidator(recorder, authentication);
    }
    return true;
  }

  /**
   * 删除认证
   * @param recorder 记录器
   */
  public deleteAuthentication(recorder: AccessRecorder): void {
    this.aaaStorage.removeItem(this.authenticationKey);
  }

  /**
   * 保存认证
   * @param recorder 记录器
   * @param datasheet 数据表
   */
  public saveAuthentication<Datasheet>(recorder: AccessRecorder, datasheet: AccessDatasheet<AuthenticationDatasheet<Datasheet>>): void {
    const ds = datasheet.getDatasheet();
    const authenticationStr = JSON.stringify(ds);
    this.aaaStorage.setItem(this.authenticationKey, authenticationStr);
  }

  /**
   * 加载授权
   * @param recorder 记录器
   * @param authentication 认证 | undefined
   */
  public loadAuthorization(recorder: AccessRecorder, authentication: AccessAuthentication | undefined): AccessAuthorization | undefined {
    if (authentication && authentication instanceof SimpleUser) {
      return authentication;
    }
    const authorizationStr = this.aaaStorage.getItem(this.authorizationKey);
    if (authorizationStr) {
      const authorizationObj = JSON.parse(authorizationStr);
      if (typeof authorizationObj.permissions !== 'undefined' && Array.isArray(authorizationObj.permissions)) {
        return new SimpleAuthorization(authorizationObj);
      }
    }
    return undefined;
  }

  /**
   * 删除授权
   * @param recorder 记录器
   */
  public deleteAuthorization(recorder: AccessRecorder): void {
    const authentication = recorder.getAccessAuthentication();
    if (authentication && authentication instanceof SimpleUser) {
      return;
    }
    this.aaaStorage.removeItem(this.authorizationKey);
  }

  /**
   * 保存授权
   * @param recorder 记录器
   * @param datasheet 数据表
   */
  public saveAuthorization<Datasheet>(recorder: AccessRecorder, datasheet: AccessDatasheet<AuthorizationDatasheet<Datasheet>>): void {
    const authentication = recorder.getAccessAuthentication();
    if (authentication && authentication instanceof SimpleUser) {
      return;
    }
    const ds = datasheet.getDatasheet();
    const authorizationStr = JSON.stringify(ds);
    this.aaaStorage.setItem(this.authorizationKey, authorizationStr);
  }

  /**
   * 加载签名
   * @param recorder 记录器
   * @param path 路径
   * @param authentication 认证
   * @param authorization 授权
   */
  public loadSignature(recorder: AccessRecorder, path: AccessPath, authentication: AccessAuthentication, authorization: AccessAuthorization): boolean {
    const signatureStr = this.signStorage.getItem(this.signatureKey);
    if (signatureStr) {
      const signatureList = JSON.parse(signatureStr) as Array<string>;
      if (Array.isArray(signatureList) && signatureList.includes(path.pathname)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 移除签名
   * @param recorder 记录器
   * @param path 路径
   */
  public removeSignature(recorder: AccessRecorder, path: AccessPath): void {
    const signatureStr = this.signStorage.getItem(this.signatureKey);
    if (signatureStr) {
      const signatureList = JSON.parse(signatureStr) as Array<string>;
      if (Array.isArray(signatureList)) {
        const newSignatureList = signatureList.filter(signature => signature !== path.pathname);
        const newSignatureStr = JSON.stringify(newSignatureList);
        this.signStorage.setItem(this.signatureKey, newSignatureStr);
      }
    }
  }

  /**
   * 删除签名
   * @param recorder 记录器
   */
  public deleteSignature(recorder: AccessRecorder): void {
    this.signStorage.removeItem(this.signatureKey);
  }

  /**
   * 保存签名
   * @param recorder 记录器
   * @param path 路径
   */
  public saveSignature(recorder: AccessRecorder, path: AccessPath): void {
    let signatureList: string[];
    const signatureStr = this.signStorage.getItem(this.signatureKey);
    if (signatureStr) {
      signatureList = JSON.parse(signatureStr) as Array<string>;
      if (!Array.isArray(signatureList)) {
        signatureList = [];
      }
    } else {
      signatureList = [];
    }
    const signatureSet = new Set<string>(signatureList);
    signatureSet.add(path.pathname);
    const signatures: string[] = Array.from(signatureSet);
    const newSignatureStr = JSON.stringify(signatures);
    this.signStorage.setItem(this.signatureKey, newSignatureStr);
  }
}
