import { type AccessStorer, type AccessValidator, SimpleStorer } from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问存储器构建器
 */
export class AccessStorerBuilder implements AccessBuilder<AccessStorer> {
  /**
   * 认证与授权存储
   * @private
   */
  private _aaaStorage?: Storage;

  /**
   * 签名存储
   * @private
   */
  private _signStorage?: Storage;

  /**
   * 认证健
   * @private
   */
  private _authenticationKey?: string;

  /**
   * 授权健
   * @private
   */
  private _authorizationKey?: string;

  /**
   * 签名健
   * @private
   */
  private _signatureKey?: string;

  /**
   * 认证验证器
   * @private
   */
  private _authenticationValidator?: AccessValidator;

  /**
   * 设置认证与授权存储
   * @param aaaStorage 认证与授权存储
   */
  public aaaStorage(aaaStorage: Storage): AccessStorerBuilder {
    this._aaaStorage = aaaStorage;
    return this;
  }

  /**
   * 设置签名存储
   * @param signStorage 签名存储
   */
  public signStorage(signStorage: Storage): AccessStorerBuilder {
    this._signStorage = signStorage;
    return this;
  }

  /**
   * 设置认证健
   * @param authenticationKey 认证健
   */
  public authenticationKey(authenticationKey: string): AccessStorerBuilder {
    this._authenticationKey = authenticationKey;
    return this;
  }

  /**
   * 设置授权健
   * @param authorizationKey 授权健
   */
  public authorizationKey(authorizationKey: string): AccessStorerBuilder {
    this._authorizationKey = authorizationKey;
    return this;
  }

  /**
   * 设置签名健
   * @param signatureKey 签名健
   */
  public signatureKey(signatureKey: string): AccessStorerBuilder {
    this._signatureKey = signatureKey;
    return this;
  }

  /**
   * 设置认证验证器
   * @param authenticationValidator 认证验证器
   */
  public authenticationValidator(authenticationValidator: AccessValidator): AccessStorerBuilder {
    this._authenticationValidator = authenticationValidator;
    return this;
  }

  /**
   * 设置本地存储
   */
  public local(): AccessStorerBuilder {
    return this.aaaStorage(window.localStorage).signStorage(window.localStorage);
  }

  /**
   * 设置会话存储
   */
  public session(): AccessStorerBuilder {
    return this.aaaStorage(window.sessionStorage).signStorage(window.sessionStorage);
  }

  /**
   * 设置混合存储（认证与授权存储为本地存储，签名存储为会话存储）
   */
  public blend(): AccessStorerBuilder {
    return this.aaaStorage(window.localStorage).signStorage(window.sessionStorage);
  }

  /**
   * 构建
   */
  public build(): AccessStorer {
    if (!this._aaaStorage && !this._signStorage) {
      this.session();
    }
    if (!this._aaaStorage) {
      this.aaaStorage(window.localStorage);
    }
    if (!this._signStorage) {
      this.signStorage(window.sessionStorage);
    }
    return new SimpleStorer(
      this._aaaStorage as Storage,
      this._signStorage as Storage,
      this._authenticationKey,
      this._authorizationKey,
      this._signatureKey,
      this._authenticationValidator,
    );
  }
}
