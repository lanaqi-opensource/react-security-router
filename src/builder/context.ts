import {
  type AccessContext,
  type AccessMatcher,
  type AccessNavigator,
  type AccessRecorder,
  type AccessResource,
  type AccessResources,
  type AccessStorer,
  type AccessValidator,
  type AccessVoter,
  SimpleContext,
} from '../access';
import type { NavigateFunction } from '../bridge';
import type { AccessBuilder } from './builder';
import { AccessMatcherBuilder } from './matcher';
import { AccessNavigatorBuilder } from './navigator';
import { AccessRecorderBuilder } from './recorder';
import { AccessResourceBuilder } from './resource';
import { AccessStorerBuilder } from './storer';
import { AccessVoterBuilder } from './voter';

/**
 * 访问上下文构建器
 */
export class AccessContextBuilder implements AccessBuilder<AccessContext> {
  /**
   * 记录器
   * @private
   */
  private _recorder?: AccessRecorder;

  /**
   * 投票器
   * @private
   */
  private _voter?: AccessVoter;

  /**
   * 存储器
   * @private
   */
  private _storer?: AccessStorer;

  /**
   * 匹配器
   * @private
   */
  private _matcher?: AccessMatcher;

  /**
   * 导航器
   * @private
   */
  private _navigator?: AccessNavigator;

  /**
   * 层级
   * @private
   */
  private _hierarchy?: string;

  /**
   * 认证验证器
   * @private
   */
  private _validator?: AccessValidator;

  /**
   * 资源集合
   * @private
   */
  private readonly _resources: AccessResources = [];

  /**
   * 导航函数
   * @private
   */
  private _navigate?: NavigateFunction;

  /**
   * 设置记录器
   * @param recorder 记录器
   */
  public recorder(recorder: AccessRecorder | ((builder: AccessRecorderBuilder) => AccessRecorder)): AccessContextBuilder {
    if (typeof recorder === 'function') {
      this._recorder = recorder(new AccessRecorderBuilder());
    } else {
      this._recorder = recorder;
    }
    return this;
  }

  /**
   * 设置投票器
   * @param voter 投票器或投票构建器
   */
  public voter(voter: AccessVoter | ((builder: AccessVoterBuilder) => AccessVoter)): AccessContextBuilder {
    if (typeof voter === 'function') {
      this._voter = voter(new AccessVoterBuilder());
    } else {
      this._voter = voter;
    }
    return this;
  }

  /**
   * 设置存储器
   * @param storer 存储器或存储构建器
   */
  public storer(storer: AccessStorer | ((builder: AccessStorerBuilder) => AccessStorer)): AccessContextBuilder {
    if (typeof storer === 'function') {
      this._storer = storer(new AccessStorerBuilder());
    } else {
      this._storer = storer;
    }
    return this;
  }

  /**
   * 设置匹配器
   * @param matcher 匹配器或匹配构建器
   */
  public matcher(matcher: AccessMatcher | ((builder: AccessMatcherBuilder) => AccessMatcher)): AccessContextBuilder {
    if (typeof matcher === 'function') {
      this._matcher = matcher(new AccessMatcherBuilder());
    } else {
      this._matcher = matcher;
    }
    return this;
  }

  /**
   * 设置导航器
   * @param navigator 导航器或导航构建器
   */
  public navigator(navigator: AccessNavigator | ((builder: AccessNavigatorBuilder) => AccessNavigator)): AccessContextBuilder {
    if (typeof navigator === 'function') {
      this._navigator = navigator(new AccessNavigatorBuilder());
    } else {
      this._navigator = navigator;
    }
    return this;
  }

  /**
   * 设置层级
   * @param hierarchy 层级：a>b;b>c;c>d;e>f;f>g
   */
  public hierarchy(hierarchy: string): AccessContextBuilder {
    this._hierarchy = hierarchy;
    return this;
  }

  /**
   * 设置认证验证器
   * @param validator 认证验证器
   */
  public validator(validator: AccessValidator): AccessContextBuilder {
    this._validator = validator;
    return this;
  }

  /**
   * 添加资源
   * @param builder 资源构建器
   */
  public resource(builder: (builder: AccessResourceBuilder) => AccessResource): AccessContextBuilder {
    const resource = builder(new AccessResourceBuilder());
    this._resources.push(resource);
    return this;
  }

  /**
   * 设置导航函数
   * @param navigate 导航函数
   */
  public navigate(navigate: NavigateFunction): AccessContextBuilder {
    this._navigate = navigate;
    return this;
  }

  /**
   * 默认资源集合
   */
  public drs(): AccessContextBuilder {
    this.resource(rb => rb.patterns('/login', '/logout', '/denied', '/signature').anonymous().build());
    this.resource(rb => rb.patterns('/*').authenticated().build());
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessContext {
    if (!this._recorder) {
      this.recorder(builder => {
        return builder.build();
      });
    }
    if (!this._voter) {
      this.voter(builder => {
        if (this._hierarchy) {
          builder.hierarchy(this._hierarchy);
        }
        return builder.build();
      });
    }
    if (!this._storer) {
      this.storer(builder => {
        if (this._validator) {
          builder.authenticationValidator(this._validator);
        }
        return builder.build();
      });
    }
    if (!this._matcher) {
      if (this._resources.length === 0) {
        this.drs();
      }
      this.matcher(builder => builder.resources(this._resources).build());
    }
    if (!this._navigator) {
      this.navigator(builder => {
        if (this._navigate) {
          builder.navigate(this._navigate);
        }
        return builder.build();
      });
    }
    return new SimpleContext(
      this._recorder as AccessRecorder,
      this._voter as AccessVoter,
      this._storer as AccessStorer,
      this._matcher as AccessMatcher,
      this._navigator as AccessNavigator,
    );
  }
}
