import React from 'react';
import {UserAccessControl, Features, useUser} from '~/features/auth/useUser';
import Login from '~/pages/login/Login';

export function withComponentPermission<P>(
  WrappedComponent: React.ComponentType<P>,
  value: keyof UserAccessControl,
  requiredPermission?: Array<keyof Features>
): React.ComponentType<React.PropsWithChildren<P>> {
  const WithPermissionWrapper = (props: React.PropsWithChildren<P>) => {
    const user = useUser();

    if (requiredPermission === undefined && user[value] !== true) return <Login />;

    if (
      requiredPermission !== undefined &&
      requiredPermission.every((feature) => user.features[feature] !== true)
    ) {
      return <Login />;
    }

    return <WrappedComponent {...props} />;
  };
  return WithPermissionWrapper;
}
