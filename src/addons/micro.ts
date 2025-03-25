import { AbstractAddon, type AccessContext, type AccessManager, type AccessPath, type AccessResource, HierarchyVoter } from '../access';

/**
 * MicroApp 插件实现
 */
export class MicroAppAddon extends AbstractAddon {
  /**
   * 层级连接忽略
   */
  public static readonly HIERARCHY_JOIN_IGNORE: string = 'ignore';

  /**
   * 层级连接合并
   */
  public static readonly HIERARCHY_JOIN_MERGE: string = 'merge';

  /**
   * 层级连接父级
   */
  public static readonly HIERARCHY_JOIN_PARENT: string = 'parent';

  /**
   * 微连接
   */
  private microJoin: boolean;

  /**
   * 基础路径连接
   * @private
   */
  private readonly basenameJoin: boolean;

  /**
   * 层级连接
   * @private
   */
  private readonly hierarchyJoin: string;

  /**
   * 构造函数
   * @param basenameJoin 基础路径连接
   * @param hierarchyJoin 层级连接
   */
  public constructor(basenameJoin: boolean, hierarchyJoin: string) {
    super();
    this.microJoin = false;
    this.basenameJoin = basenameJoin;
    this.hierarchyJoin = hierarchyJoin;
  }

  /**
   * 守护之前
   * @param context 上下文
   * @param manager 管理器
   * @param currentPath 当前路径
   * @param currentResource 当前资源
   * @override
   */
  public guardBefore(context: AccessContext, manager: AccessManager, currentPath: AccessPath, currentResource: AccessResource | null): void {
    if (this.microJoin) {
      return;
    }
    if (window.__MICRO_APP_BASE_APPLICATION__) {
      window.__RSR_MICRO_APP_PARENT_CONTEXT__ = context;
      window.__RSR_MICRO_APP_PARENT_MANAGER__ = manager;
    }
    if (window.__MICRO_APP_ENVIRONMENT__) {
      // 设置基础路径
      if (this.basenameJoin) {
        const baseRoute = window.__MICRO_APP_BASE_ROUTE__;
        if (baseRoute && baseRoute.trim().length > 0) {
          const matcher = context.getMatcher();
          matcher.setBasename(baseRoute);
        }
      }
      const c_parent = window.rawWindow?.__RSR_MICRO_APP_PARENT_CONTEXT__ as AccessContext | undefined;
      if (c_parent) {
        // 设置父级
        if (!context.getParent()) {
          context.setParent(c_parent);
        }
        // 重置层级关系
        if (this.hierarchyJoin !== MicroAppAddon.HIERARCHY_JOIN_IGNORE) {
          const p_voter = c_parent.getVoter();
          const c_voter = context.getVoter();
          if (p_voter instanceof HierarchyVoter && c_voter instanceof HierarchyVoter) {
            const p_relation = p_voter.getRelation();
            if (this.hierarchyJoin === MicroAppAddon.HIERARCHY_JOIN_MERGE) {
              c_voter.resetResolver((relation: string) => {
                return `${p_relation};${relation}`;
              });
            } else if (this.hierarchyJoin === MicroAppAddon.HIERARCHY_JOIN_PARENT) {
              c_voter.resetResolver((relation: string) => {
                return p_relation;
              });
            }
          }
        }
      }
      const m_parent = window.rawWindow?.__RSR_MICRO_APP_PARENT_MANAGER__ as AccessManager | undefined;
      if (m_parent) {
        // 设置父级
        if (!manager.getParent()) {
          manager.setParent(m_parent);
        }
      }
      this.microJoin = true;
    }
  }
}

/**
 * MicroApp 插件函数
 * @param basenameJoin 基础路径连接
 * @param hierarchyJoin 层级连接
 */
export const microAppAddon = (basenameJoin = true, hierarchyJoin = MicroAppAddon.HIERARCHY_JOIN_IGNORE) => {
  return new MicroAppAddon(basenameJoin, hierarchyJoin);
};
