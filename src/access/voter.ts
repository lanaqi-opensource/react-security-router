import type { AccessPermission } from './common';

/**
 * 访问投票器
 */
export interface AccessVoter {
  /**
   * 进行投票
   * @param term 条件
   * @param have 拥有
   */
  vote(term: Set<AccessPermission>, have: Set<AccessPermission>): boolean;
}

/**
 * 缓存投票器（抽象类）
 */
export abstract class CacheVoter implements AccessVoter {
  /**
   * 缓存映射
   * @private
   */
  private readonly cache: Map<string, boolean>;

  /**
   * 构造函数
   */
  protected constructor() {
    this.cache = new Map<string, boolean>();
  }

  /**
   * 缓存键
   * @param term 条件
   * @param have 拥有
   * @private
   */
  private cacheKey(term: Set<AccessPermission>, have: Set<AccessPermission>): string {
    return `${[...have].join('.')}_${[...term].join('.')}`;
  }

  /**
   * 执行投票
   * @param term 条件
   * @param have 拥有
   * @protected
   */
  protected abstract execVote(term: Set<AccessPermission>, have: Set<AccessPermission>): boolean;

  /**
   * 清理缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 进行投票
   * @param term 条件
   * @param have 拥有
   */
  public vote(term: Set<AccessPermission>, have: Set<AccessPermission>): boolean {
    if (term.size === 0 || have.size === 0) {
      return false;
    }
    const key = this.cacheKey(term, have);
    if (this.cache.has(key)) {
      return this.cache.get(key) as boolean;
    }
    const result = this.execVote(term, have);
    this.cache.set(key, result);
    return result;
  }
}

/**
 * 简单投票器
 */
export class SimpleVoter extends CacheVoter {
  /**
   * 包含全部
   * @private
   */
  private all: boolean;

  /**
   * 构造函数
   * @param all 包含全部
   */
  public constructor(all = false) {
    super();
    this.all = all;
  }

  /**
   * 设置包含全部
   * @param all 包含全部
   */
  public setAll(all: boolean): void {
    this.all = all;
  }

  /**
   * 执行投票
   * @param term 条件
   * @param have 拥有
   * @protected
   */
  protected execVote(term: Set<AccessPermission>, have: Set<AccessPermission>): boolean {
    for (const item of term) {
      if (this.all) {
        if (!have.has(item)) {
          return false;
        }
      } else {
        if (have.has(item)) {
          return true;
        }
      }
    }
    return this.all;
  }
}

/**
 * 层级权限
 */
class HierarchyPermission {
  /**
   * 权限
   * @private
   */
  private readonly permission: AccessPermission;

  /**
   * 父级
   * @private
   */
  private parent?: HierarchyPermission;

  /**
   * 构造函数
   * @param permission 权限
   */
  public constructor(permission: AccessPermission) {
    this.permission = permission;
  }

  /**
   * 获取权限
   */
  public getPermission(): AccessPermission {
    return this.permission;
  }

  /**
   * 设置父级
   * @param parent 父级
   */
  public setParent(parent: HierarchyPermission): void {
    this.parent = parent;
  }

  /**
   * 获取父级
   */
  public getParent(): HierarchyPermission | undefined {
    return this.parent;
  }

  /**
   * 是否包含我的权限
   * @param permission 权限
   */
  public includeMy(permission: AccessPermission): boolean {
    if (this.permission === permission) {
      return true;
    }
    if (this.parent) {
      return this.parent.includeMy(permission);
    }
    return false;
  }
}

/**
 * 关系解析器
 */
export type RelationResolver = (relation: string) => string;

/**
 * 原始关系解析器
 * @param relation 层级关系
 */
export const OriginRelationResolver = (relation: string) => {
  return relation;
};

/**
 * 层级投票器
 */
export class HierarchyVoter extends CacheVoter {
  /**
   * 层级映射
   * @private
   */
  private readonly mapping: Map<AccessPermission, HierarchyPermission>;

  /**
   * 层级关系：a>b;b>c;c>d;e>f;f>g
   * @private
   */
  private relation: string;

  /**
   * 包含全部
   * @private
   */
  private all: boolean;

  /**
   * 关系解析器
   * @private
   */
  private resolver!: RelationResolver;

  /**
   * 构造函数
   * @param resolver 关系解析器
   * @param relation 层级关系：a>b;b>c;c>d;e>f;f>g
   * @param all 包含全部
   */
  public constructor(resolver: RelationResolver, relation: string, all = false) {
    super();
    this.mapping = new Map<AccessPermission, HierarchyPermission>();
    this.relation = relation;
    this.all = all;
    this.resetResolver(resolver);
  }

  /**
   * 设置包含全部
   * @param all 包含全部
   */
  public setAll(all: boolean): void {
    this.all = all;
  }

  /**
   * 重置层级关系
   * @param relation 层级关系
   */
  public resetRelation(relation: string): void {
    this.relation = relation;
    this.initHierarchy();
  }

  /**
   * 重置关系解析器
   * @param resolver 关系解析器
   */
  public resetResolver(resolver: RelationResolver): void {
    this.resolver = resolver;
    this.initHierarchy();
  }

  /**
   * 初始化层级
   * @private
   */
  private initHierarchy(): void {
    const hierarchy = this.resolver(this.relation);
    const group = hierarchy.split(';'); // a>b; e>f; ...
    if (group.length > 0) {
      this.clearCache();
      this.mapping.clear();
      for (const item of group) {
        const ps = item.split('>'); // a>b , e>f , ...
        if (ps.length === 2) {
          const p1 = ps[0]; // a
          const p2 = ps[1]; // b
          let h1: HierarchyPermission;
          if (this.mapping.has(p1)) {
            h1 = this.mapping.get(p1) as HierarchyPermission;
          } else {
            h1 = new HierarchyPermission(p1);
            this.mapping.set(p1, h1);
          }
          let h2: HierarchyPermission;
          if (this.mapping.has(p2)) {
            h2 = this.mapping.get(p2) as HierarchyPermission;
          } else {
            h2 = new HierarchyPermission(p2);
            this.mapping.set(p2, h2);
          }
          h2.setParent(h1);
        }
      }
    }
  }

  /**
   * p1 包含 p2
   * @param p1 权限1
   * @param p2 权限2
   * @private
   */
  private includePermission(p1: AccessPermission, p2: AccessPermission): boolean {
    if (this.mapping.has(p2)) {
      return (this.mapping.get(p2) as HierarchyPermission).includeMy(p1);
    } else {
      return p1 === p2;
    }
  }

  /**
   * 执行投票
   * @param term 条件
   * @param have 拥有
   * @protected
   */
  protected execVote(term: Set<AccessPermission>, have: Set<AccessPermission>): boolean {
    for (const tp of term) {
      for (const hp of have) {
        const hi = this.includePermission(hp, tp);
        if (hi) {
          if (!this.all) {
            return true;
          }
        } else {
          if (this.all) {
            return false;
          }
        }
      }
    }
    return this.all;
  }

  /**
   * 获取层级关系
   */
  public getRelation(): string {
    return this.relation;
  }
}
