import { matchPath } from '../bridge';
import type { AccessPath } from './common';
import type { AccessResource, AccessResources, ResourcePattern } from './resource';

/**
 * 访问匹配器
 */
export interface AccessMatcher {
  /**
   * 进行匹配
   * @param resource 资源
   * @param path 路径
   */
  match(resource: AccessResource, path: AccessPath): boolean;

  /**
   * 取得资源
   * @param path 路径
   */
  obtain(path: AccessPath): AccessResource | null;

  /**
   * 获取基础路径
   */
  getBasename(): string | undefined;

  /**
   * 设置基础路径
   */
  setBasename(basename: string | undefined): void;
}

/**
 * 简单匹配器
 */
export class SimpleMatcher implements AccessMatcher {
  /**
   * 缓存资源
   * @private
   */
  private readonly cache: Map<string, AccessResource>;

  /**
   * 资源集合
   * @private
   */
  private readonly resources: AccessResources;

  /**
   * 基础路径
   * @private
   */
  private basename?: string;

  /**
   * 构造函数
   * @param resources 资源集合
   */
  public constructor(resources: AccessResources) {
    this.cache = new Map<string, AccessResource>();
    this.resources = resources;
  }

  /**
   * 进行匹配
   * @param resource 资源
   * @param path 路径
   */
  public match(resource: AccessResource, path: AccessPath): boolean {
    let basename = resource.getBasename();
    if (!basename) {
      basename = this.getBasename();
    }
    const patterns = resource.getPatterns();
    if (basename && basename.trim().length > 0) {
      for (const pattern of patterns) {
        let matchPattern: ResourcePattern;
        if (typeof pattern === 'string') {
          matchPattern = basename + pattern;
        } else {
          matchPattern = { ...pattern, path: basename + pattern.path };
        }
        const pm = matchPath(matchPattern, path.pathname);
        if (pm) {
          return true;
        }
      }
    } else {
      for (const pattern of patterns) {
        const pm = matchPath(pattern, path.pathname);
        if (pm) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 取得资源
   * @param path 路径
   */
  public obtain(path: AccessPath): AccessResource | null {
    const pathname = path.pathname;
    if (this.cache.has(pathname)) {
      return this.cache.get(pathname) as AccessResource;
    }
    for (const resource of this.resources) {
      const mp = this.match(resource, path);
      if (mp) {
        this.cache.set(pathname, resource);
        return resource;
      }
    }
    return null;
  }

  /**
   * 获取基础路径
   */
  public getBasename(): string | undefined {
    return this.basename;
  }

  /**
   * 设置基础路径
   */
  public setBasename(basename: string | undefined): void {
    this.basename = basename;
  }
}
