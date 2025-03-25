// 该文件主要用于兼容或扩展其它实现

/**
 * 桥接引用的函数和钩子
 */
export { matchPath, useBlocker, useLocation, useNavigate } from 'react-router-dom';

/**
 * 桥接引用的类型
 */
export type { PathPattern, NavigateFunction, NavigateOptions, To, Path } from 'react-router-dom';
