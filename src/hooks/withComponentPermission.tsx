import React from 'react';
import {AccessControlReturnType, Features, useAccessControl} from '~/features/auth/useUser';
import Login from '~/pages/login/Login';

export function withComponentPermission<P>(
  WrappedComponent: React.ComponentType<P>,
  value: keyof AccessControlReturnType,
  requiredPermission?: Array<keyof Features>
): React.ComponentType<React.PropsWithChildren<P>> {
  const WithPermissionWrapper = (props: React.PropsWithChildren<P>) => {
    const accessControl = useAccessControl();

    if (requiredPermission === undefined && accessControl[value] !== true) return <Login />;

    if (
      requiredPermission !== undefined &&
      requiredPermission.every((feature) => accessControl.features[feature] !== true)
    ) {
      return <Login />;
    }

    return <WrappedComponent {...props} />;
  };
  return WithPermissionWrapper;
}
