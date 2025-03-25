/**
 * 访问构建器
 */
export interface AccessBuilder<Type> {
  /**
   * 构建
   */
  build(): Type;
}
