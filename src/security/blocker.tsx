import { type ComponentType, type PropsWithChildren, useEffect, useState } from 'react';
import { AccessBehave, AccessDecision, type AccessPath } from '../access';
import { useBlocker, useLocation } from '../bridge';
import { type SecurityBundler, SecurityProvider, useSecurityContext } from './provider';

/**
 * 安全阻断器组件
 * @param children 子组件
 * @constructor
 */
export function SecurityBlocker({ children }: PropsWithChildren) {
  const { context, manager, guarder } = useSecurityContext();
  if (manager.isDisabled()) {
    return <>{children}</>;
  }
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return currentLocation.pathname !== nextLocation.pathname; // 当前位置的路径值不等于下个位置的路径值
  });
  const [guarded, setGuarded] = useState<boolean>(false); // 被守护的
  const [nextPath, setNextPath] = useState<AccessPath>(useLocation()); // 下个路径
  const [firstAccess, setFirstAccess] = useState<boolean>(true); // 首次访问
  const [firstHandle, setFirstHandle] = useState<boolean>(true); // 首次处理
  const [firstSignature, setFirstSignature] = useState<number>(1); // 首次签名计数
  const [handleDecision, setHandleDecision] = useState<boolean>(false); // 处理决策
  const [beforeDecision, setBeforeDecision] = useState<AccessDecision | undefined>(undefined); // 之前决策
  const [currentDecision, setCurrentDecision] = useState<AccessDecision | undefined>(undefined); // 当前决策
  const [executeBlock, setExecuteBlock] = useState<boolean>(false); // 执行阻断
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const recorder = context.getRecorder();
      const stayPath = recorder.getAllowPath(); // 停留路径
      const blockPath: AccessPath = blocker.location; // 阻断路径
      let guardBlocked = false;
      if (executeBlock) {
        guardBlocked = guarder.guardBlock(blockPath); // 守护阻断
      }
      if (guardBlocked) {
        blocker.reset();
        setNextPath(blockPath); // 设置下个路径（当前是没有使用到的，也许后续扩展有可能会使用到）
        setHandleDecision(false); // 设置需要处理决策
        setCurrentDecision(undefined); // 设置当前决策
      } else {
        if (!beforeDecision) {
          guarder.guardBefore(blockPath); // 守护之前
        }
        const blockedDecision = guarder.guardDecision(blockPath); // 守护决策
        if (blockedDecision === AccessDecision.allowAccess) {
          const isDiff = !!stayPath && stayPath.pathname !== blockPath.pathname; // 该逻辑始终为：true，以防其它覆盖则需要多一次判断
          if (isDiff) {
            guarder.permitBefore(stayPath, blockPath);
          }
          blocker.proceed();
          if (isDiff) {
            guarder.permitAfter(stayPath, blockPath);
          }
        } else {
          blocker.reset();
        }
        setNextPath(blockPath); // 设置下个路径
        setHandleDecision(true); // 设置需要处理决策
        setCurrentDecision(blockedDecision); // 设置当前决策
      }
    } else if (blocker.state === 'unblocked') {
      // 如果需要处理决策同时设置了当前决策
      if (handleDecision && currentDecision) {
        let navNext: boolean; // 是否导航下个
        const behave = guarder.guardHandle(currentDecision, beforeDecision); // 守护处理
        switch (behave) {
          // 重新决策
          case AccessBehave.reDecision: {
            setBeforeDecision(currentDecision); // 设置之前决策
            setExecuteBlock(false);
            navNext = true;
            break;
          }
          // 跳转导航
          case AccessBehave.goNavigate: {
            setBeforeDecision(undefined); // 设置之前决策
            navNext = false;
            setExecuteBlock(false);
            break;
          }
          // 忽略操作
          case AccessBehave.doNothing:
          default: {
            setBeforeDecision(undefined); // 清理之前决策
            navNext = false;
            setExecuteBlock(true);
            break;
          }
        }
        // 如果是首次处理同时是没有签名的以及需要重新决策的
        if (firstHandle && currentDecision === AccessDecision.notSignature && behave === AccessBehave.reDecision) {
          // 如果多次重新决策签名依旧再次需要签名的则拒绝访问
          if (firstSignature >= 3) {
            setFirstHandle(false); // 标记不再是首次处理
            setBeforeDecision(AccessDecision.notSignature); // 设置之前决策为没有签名
            setHandleDecision(true); // 设置需要处理决策
            setCurrentDecision(AccessDecision.accessDenied); // 设置当前决策为拒绝访问
          } else {
            // 基于当前路径再执行一次
            const signDecision = guarder.guardDecision(nextPath); // 再一次决策
            setHandleDecision(true); // 设置需要处理决策
            setBeforeDecision(undefined); // 设置之前决策为空
            setCurrentDecision(signDecision); // 设置当前决策
            setFirstSignature(firstSignature + 1); // 签名计数
          }
        } else {
          setFirstHandle(false); // 标记不再是首次处理
          setHandleDecision(false); // 清理处理决策
          setCurrentDecision(undefined); // 清理当前决策
          // 如果导航下个
          if (navNext) {
            context.getNavigator().navigate(nextPath); // 导航路径
          } else {
            guarder.guardAfter(nextPath, currentDecision); // 守护之后
            setGuarded(true);
          }
        }
      }
      // 如果是首次访问
      else if (firstAccess) {
        // 基于当前路径执行一次
        guarder.guardBefore(nextPath); // 守护之前
        const firstDecision = guarder.guardDecision(nextPath); // 守护决策
        setFirstAccess(false); // 标记非首次访问
        setHandleDecision(true); // 设置需要处理决策
        setCurrentDecision(firstDecision); // 设置当前决策
      }
    }
  }, [blocker, context, guarder, nextPath, firstAccess, firstHandle, firstSignature, handleDecision, beforeDecision, currentDecision, executeBlock]);
  if (!guarded) {
    return <></>;
  }
  return <>{children}</>;
}

/**
 * 安全阻断器包装
 * @param Component 组件
 * @param bundler 打包器
 */
export const withSecurityBlocker = (Component: ComponentType, bundler: SecurityBundler) => {
  return () => (
    <SecurityProvider bundler={bundler}>
      <SecurityBlocker>
        <Component />
      </SecurityBlocker>
    </SecurityProvider>
  );
};
