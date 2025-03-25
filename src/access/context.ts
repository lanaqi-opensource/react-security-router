import type { AccessMatcher } from './matcher';
import type { AccessNavigator } from './navigator';
import type { AccessRecorder } from './recorder';
import type { AccessStorer } from './storer';
import type { AccessVoter } from './voter';

/**
 * 访问上下文
 */
export interface AccessContext {
  /**
   * 获取记录器
   */
  getRecorder(): AccessRecorder;

  /**
   * 设置记录器
   * @param recorder 记录器
   */
  setRecorder(recorder: AccessRecorder): void;

  /**
   * 获取投票器
   */
  getVoter(): AccessVoter;

  /**
   * 设置投票器
   * @param voter 投票器
   */
  setVoter(voter: AccessVoter): void;

  /**
   * 获取存储器
   */
  getStorer(): AccessStorer;

  /**
   * 设置存储器
   * @param storer 存储器
   */
  setStorer(storer: AccessStorer): void;

  /**
   * 获取匹配器
   */
  getMatcher(): AccessMatcher;

  /**
   * 设置匹配器
   * @param matcher 匹配器
   */
  setMatcher(matcher: AccessMatcher): void;

  /**
   * 获取导航器
   */
  getNavigator(): AccessNavigator;

  /**
   * 设置导航器
   * @param navigator 导航器
   */
  setNavigator(navigator: AccessNavigator): void;

  /**
   * 获取父级
   */
  getParent(): AccessContext | undefined;

  /**
   * 设置父级
   * @param parent 父级
   */
  setParent(parent: AccessContext): void;
}

/**
 * 简单上下文
 */
export class SimpleContext implements AccessContext {
  /**
   * 记录器
   * @private
   */
  private recorder: AccessRecorder;

  /**
   * 投票器
   * @private
   */
  private voter: AccessVoter;

  /**
   * 存储器
   * @private
   */
  private storer: AccessStorer;

  /**
   * 匹配器
   * @private
   */
  private matcher: AccessMatcher;

  /**
   * 导航器
   * @private
   */
  private navigator: AccessNavigator;

  /**
   * 父级
   * @private
   */
  private parent?: AccessContext;

  /**
   * 构造函数
   * @param recorder 记录器
   * @param voter 投票器
   * @param storer 存储器
   * @param matcher 匹配器
   * @param navigator 导航器
   */
  public constructor(recorder: AccessRecorder, voter: AccessVoter, storer: AccessStorer, matcher: AccessMatcher, navigator: AccessNavigator) {
    this.recorder = recorder;
    this.voter = voter;
    this.storer = storer;
    this.matcher = matcher;
    this.navigator = navigator;
  }

  /**
   * 获取记录器
   */
  public getRecorder(): AccessRecorder {
    return this.recorder;
  }

  /**
   * 设置记录器
   * @param recorder 记录器
   */
  public setRecorder(recorder: AccessRecorder): void {
    this.recorder = recorder;
  }

  /**
   * 获取投票器
   */
  public getVoter(): AccessVoter {
    return this.voter;
  }

  /**
   * 设置投票器
   * @param voter 投票器
   */
  public setVoter(voter: AccessVoter): void {
    this.voter = voter;
  }

  /**
   * 获取存储器
   */
  public getStorer(): AccessStorer {
    return this.storer;
  }

  /**
   * 设置存储器
   * @param storer 存储器
   */
  public setStorer(storer: AccessStorer): void {
    this.storer = storer;
  }

  /**
   * 获取匹配器
   */
  public getMatcher(): AccessMatcher {
    return this.matcher;
  }

  /**
   * 设置匹配器
   * @param matcher 匹配器
   */
  public setMatcher(matcher: AccessMatcher): void {
    this.matcher = matcher;
  }

  /**
   * 获取导航器
   */
  public getNavigator(): AccessNavigator {
    return this.navigator;
  }

  /**
   * 设置导航器
   * @param navigator 导航器
   */
  public setNavigator(navigator: AccessNavigator): void {
    this.navigator = navigator;
  }

  /**
   * 获取父级
   */
  public getParent(): AccessContext | undefined {
    return this.parent;
  }

  /**
   * 设置父级
   * @param parent 父级
   */
  public setParent(parent?: AccessContext): void {
    this.parent = parent;
  }
}
