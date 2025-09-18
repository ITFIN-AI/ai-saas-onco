import React from 'react';
import { Redirect, Route, RouteProps, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppStore, RequestStatus, UserStatus } from '@akademiasaas/shared';
import { Spin } from 'antd';

const ProtectedRoute = ({ component: Component, ...rest }: RouteProps) => {
  const {
    data: user,
    status,
    detailsStatus,
    details,
  } = useSelector((store: AppStore) => store.user);
  const history = useHistory();
  const continuePath = history.location.pathname + history.location.search;

  if (!Component) {
    throw new Error('Component is missing');
  }
  const authPath = `/auth/login?continue=${encodeURIComponent(continuePath)}`;

  const isLoggingIn =
    status === UserStatus.LOGGING_IN ||
    (detailsStatus === null && status === UserStatus.IS_LOGGED) ||
    (detailsStatus === RequestStatus.SUCCESS &&
      status === UserStatus.IS_LOGGED &&
      details === null) ||
    detailsStatus === RequestStatus.FETCHING;

  if (isLoggingIn) {
    return (
      <div
        style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        return user && details ? <Component {...props} /> : <Redirect to={authPath} />;
      }}
    />
  );
};
export default ProtectedRoute;
