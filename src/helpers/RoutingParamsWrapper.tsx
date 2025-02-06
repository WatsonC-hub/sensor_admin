import React from 'react';
import {useParams} from 'react-router-dom';

interface Props<T extends string> {
  children: (params: Record<T, string>) => React.ReactNode;
}

const RoutingParamsWrapper = <T extends string>({children}: Props<T>) => {
  const params = useParams<T>() as Record<T, string>; // ✅ Ensure type safety
  console.log(params);
  return children(params);
};

export default RoutingParamsWrapper;
