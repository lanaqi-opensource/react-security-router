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
  const { context, manager, guarder } = useSecurityContext(); // 获取安全上下文
  if (manager.isDisabled()) { // 如果管理器设置了禁用
    return <>{children}</>;
  }
  const blocker = useBlocker(({ currentLocation, nextLocation }) => { // 获取阻断器
    return currentLocation.pathname !== nextLocation.pathname; // 当前位置的路径值不等于下个位置的路径值
  });
  const [guarded, setGuarded] = useState<boolean>(false); // 被守护的
  const [nextPath, setNextPath] = useState<AccessPath>(useLocation()); // 下个路径
  const [firstAccess, setFirstAccess] = useState<boolean>(true); // 首次访问
  const [firstHandle, setFirstHandle] = useState<boolean>(true); // 首次处理
  const [countSignature, setCountSignature] = useState<number>(1); // 首次签名计数
  const [handledDecision, setHandledDecision] = useState<boolean>(false); // 是否需要处理决策
  const [beforeDecision, setBeforeDecision] = useState<AccessDecision | undefined>(undefined); // 之前决策
  const [currentDecision, setCurrentDecision] = useState<AccessDecision | undefined>(undefined); // 当前决策
  const [securityBlock, setSecurityBlock] = useState<boolean>(false); // 执行安全阻断
  const [executableBlocked, setExecutableBlocked] = useState<boolean>(true); // 可执行已阻断
  useEffect(() => {
    if (blocker.state === 'blocked' && executableBlocked) {
      let isProceed: boolean; // 是否执行处理
      const recorder = context.getRecorder(); // 获取记录器
      const stayPath = recorder.getAllowPath(); // 停留路径
      const blockPath: AccessPath = blocker.location; // 阻断路径
      let guardBlocked = false;
      if (securityBlock) {
        guardBlocked = guarder.guardBlock(blockPath); // 守护阻断
      }
      if (guardBlocked) {
        setHandledDecision(false); // 设置无需处理决策
        setCurrentDecision(undefined); // 设置当前决策
        isProceed = false; // 拒绝访问
      } else {
        if (!beforeDecision) {
          guarder.guardBefore(blockPath); // 守护之前
        }
        const blockedDecision = guarder.guardDecision(blockPath); // 守护决策
        setHandledDecision(true); // 设置需要处理决策
        setCurrentDecision(blockedDecision); // 设置当前决策
        isProceed = blockedDecision === AccessDecision.allowAccess;
      }
      setNextPath(blockPath); // 设置下个路径
      setExecutableBlocked(false); // 标记不可执行已阻断
      if (isProceed) {
        const isDiff = !!stayPath && stayPath.pathname !== blockPath.pathname; // 该逻辑始终为：true，以防其它覆盖则需要多一次判断
        if (isDiff) {
          guarder.permitBefore(stayPath, blockPath);
        }
        blocker.proceed(); // 在 v7 版本该逻辑是异步的
        if (isDiff) {
          guarder.permitAfter(stayPath, blockPath);
        }
      } else {
        blocker.reset();
      }
    } else if (blocker.state === 'unblocked') {
      // 如果需要处理决策同时设置了当前决策
      if (handledDecision && currentDecision) {
        let navNext: boolean; // 是否导航下个
        const behave = guarder.guardHandle(currentDecision, beforeDecision); // 守护处理
        switch (behave) {
          // 重新决策
          case AccessBehave.reDecision: {
            setBeforeDecision(currentDecision); // 设置之前决策
            setSecurityBlock(false);
            navNext = true;
            break;
          }
          // 跳转导航
          case AccessBehave.goNavigate: {
            setBeforeDecision(undefined); // 设置之前决策
            navNext = false;
            setSecurityBlock(false);
            break;
          }
          // 忽略操作
          case AccessBehave.doNothing:
          default: {
            setBeforeDecision(undefined); // 清理之前决策
            navNext = false;
            setSecurityBlock(true);
            break;
          }
        }
        // 如果是首次处理同时是没有签名的以及需要重新决策的
        if (firstHandle && currentDecision === AccessDecision.notSignature && behave === AccessBehave.reDecision) {
          // 如果多次重新决策签名依旧再次需要签名的则拒绝访问
          if (countSignature >= 3) {
            setFirstHandle(false); // 标记不再是首次处理
            setBeforeDecision(AccessDecision.notSignature); // 设置之前决策为没有签名
            setHandledDecision(true); // 设置需要处理决策
            setCurrentDecision(AccessDecision.accessDenied); // 设置当前决策为拒绝访问
          } else {
            // 基于当前路径再执行一次
            const signDecision = guarder.guardDecision(nextPath); // 再一次决策
            setHandledDecision(true); // 设置需要处理决策
            setBeforeDecision(undefined); // 设置之前决策为空
            setCurrentDecision(signDecision); // 设置当前决策
            setCountSignature(countSignature + 1); // 签名计数
          }
        } else {
          setFirstHandle(false); // 标记不再是首次处理
          setHandledDecision(false); // 设置无需处理决策
          setCurrentDecision(undefined); // 清理当前决策
          // 如果导航下个
          if (navNext) {
            context.getNavigator().navigate(nextPath); // 导航路径
          } else {
            guarder.guardAfter(nextPath, currentDecision); // 守护之后
            setGuarded(true);
          }
        }
      } else if (firstAccess) { // 如果是首次访问
        // 基于当前路径执行一次
        guarder.guardBefore(nextPath); // 守护之前
        const firstDecision = guarder.guardDecision(nextPath); // 守护决策
        setFirstAccess(false); // 标记非首次访问
        setHandledDecision(true); // 设置需要处理决策
        setCurrentDecision(firstDecision); // 设置当前决策
      }
      if (!executableBlocked) {
        setExecutableBlocked(true); // 标记已可执行已阻断
      }
    }
  }, [
    blocker, context, guarder,
    nextPath, firstAccess, firstHandle, countSignature,
    handledDecision, beforeDecision, currentDecision, securityBlock, executableBlocked
  ]);
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
