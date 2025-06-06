import {AccessControlReturnType, Features, useAccessControl} from '~/features/auth/useUser';

export function withPermissionGuard<Args extends any[], Result extends object>(
  hook: (...args: Args) => Result,
  value: keyof AccessControlReturnType,
  requiredPermission?: Array<keyof Features>
): (...args: Args) => Result {
  return function useGuardedHook(...args: Args) {
    const accessControl = useAccessControl();
    let result = {} as Result;

    if (requiredPermission === undefined && accessControl[value] === true) result = hook(...args);

    if (
      requiredPermission !== undefined &&
      requiredPermission.every((feature) => accessControl.features[feature] === true)
    )
      result = hook(...args);

    return new Proxy(result, {
      get(target, prop: string | symbol, receiver: any) {
        if (!(prop in target)) {
          return {};
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  };
}
