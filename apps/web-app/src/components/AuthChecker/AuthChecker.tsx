import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { Spin } from 'antd';
import { AppStore, userActions } from '@akademiasaas/shared';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps {}

type Props = PropsWithChildren<OwnProps>;

const AuthChecker: FunctionComponent<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [isUserResolved, setIsUserResolved] = useState(false);
  const user = useSelector((store: AppStore) => store.user);
  const userUid = user.data?.uid;
  const query = useQuery();

  const handleUserData = async (newUser: firebase.User | null) => {
    if (newUser && newUser.uid !== userUid) {
      dispatch(userActions.setLoggedUserData(newUser));
    }
    if (history.location.pathname.startsWith('/auth') && newUser) {
      const continuePath = query.get('continue');
      history.push(continuePath || '/');
    }
    if (!isUserResolved) {
      setTimeout(() => {
        setIsUserResolved(true);
      }, 0);
    }
  };

  const debouncedCallback = useDebouncedCallback(handleUserData, 400);

  useEffect(() => {
    (async () => {
      const unsubscribe = firebase.auth().onAuthStateChanged(debouncedCallback);

      return () => unsubscribe();
    })();
  }, [debouncedCallback, isUserResolved, userUid]);

  if (!isUserResolved) {
    return (
      <div
        style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthChecker;
