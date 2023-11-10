import { Navigate } from 'react-router-dom';

import { WebPage } from '../../../consts';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { selectIsUserLoggedIn } from '../../../store/slices/session';

type RedirectedRouteProps = {
  redirectionPath: string;
};

export function Redirection({ redirectionPath }: RedirectedRouteProps) {
  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);

  if (isUserLoggedIn) {
    return <Navigate to={{ pathname: redirectionPath }} replace />;
  }

  return <Navigate to={{ pathname: WebPage.PUBLIC }} replace />;
}
