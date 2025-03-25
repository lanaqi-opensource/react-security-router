import { type AccessVoter, HierarchyVoter, OriginRelationResolver, type RelationResolver, SimpleVoter } from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问投票器构建器
 */
export class AccessVoterBuilder implements AccessBuilder<AccessVoter> {
  /**
   * 关系解析器
   * @private
   */
  private _resolver?: RelationResolver;

  /**
   * 层级关系：a>b;b>c;c>d;e>f;f>g
   * @private
   */
  private _hierarchy?: string;

  /**
   * 包含全部
   * @private
   */
  private _all = false;

  /**
   * 设置关系解析器
   * @param resolver 关系解析器
   */
  public resolver(resolver: RelationResolver): AccessVoterBuilder {
    this._resolver = resolver;
    return this;
  }

  /**
   * 设置层级关系
   * @param hierarchy 层级关系：a>b;b>c;c>d;e>f;f>g
   */
  public hierarchy(hierarchy: string): AccessVoterBuilder {
    this._hierarchy = hierarchy;
    return this;
  }

  /**
   * 设置包含全部
   * @param all 包含全部
   */
  public all(all: boolean): AccessVoterBuilder {
    this._all = all;
    return this;
  }

  /**
   * 构建
   */
  public build(): AccessVoter {
    if (this._hierarchy && this._hierarchy.trim().length > 0) {
      if (!this._resolver) {
        this._resolver = OriginRelationResolver;
      }
      return new HierarchyVoter(this._resolver, this._hierarchy, this._all);
    }
    return new SimpleVoter(this._all);
  }
}
