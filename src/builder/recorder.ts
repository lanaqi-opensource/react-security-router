import { type AccessRecorder, SimpleRecorder } from '../access';
import type { AccessBuilder } from './builder';

/**
 * 访问记录器构建器
 */
export class AccessRecorderBuilder implements AccessBuilder<AccessRecorder> {
  /**
   * 构建
   */
  public build(): AccessRecorder {
    return new SimpleRecorder();
  }
}
