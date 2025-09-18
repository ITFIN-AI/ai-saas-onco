import React, { FunctionComponent } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Login from './components/Login/Login';
import { Select } from 'antd';
import { Register } from '~/pages/Auth/components/Register/Register';
import { ForgotPassword } from '~/pages/Auth/components/ForgotPassword/ForgotPassword';
import { ResetPassword } from '~/pages/Auth/components/ResetPassword/ResetPassword';
import { SignWithLink } from '~/pages/Auth/components/SignWithLink/SignWithLink';
import LoginByEmail from '~/pages/Auth/components/LoginByEmail/LoginByEmail';
import logoBlack from '../../assets/icons/logo-black.png';
import bg from '../../assets/images/auth-bg.jpg';
import i18n from 'i18next';
import ImpersonationModal from '~/components/ImpersonationModal/ImpersonationModal';
import { APP_URL, APP_NAME } from '@akademiasaas/shared';

interface OwnProps {}

type Props = OwnProps;

const Auth: FunctionComponent<Props> = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showImpersonateModal = searchParams.get('impersonate') === 'true';
  const [isOpen, setIsOpen] = React.useState(showImpersonateModal);

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <div className="hidden lg:block relative w-0 flex-1">
          <img className="absolute inset-0 h-full w-full object-cover" src={bg} alt="" />
        </div>
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="absolute right-4 top-4 lg:right-8 lg:top-8">
              <Select
                value={i18n.language}
                size="large"
                onChange={(lang) => i18n.changeLanguage(lang)}
                popupMatchSelectWidth={false}
              >
                <Select.Option value="en" key="en">
                  <span className="flag-icon flag-icon-gb" />
                  🇺🇸 EN
                </Select.Option>
                <Select.Option value="pl" key="pl">
                  <span className="flag-icon flag-icon-pl" />
                  🇵🇱 PL
                </Select.Option>
              </Select>
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="flex justify-center px-2 items-center mb-8">
                <a href={APP_URL} target="_blank" rel="nofollow noreferrer">
                  <img src={logoBlack} alt={APP_NAME} className="h-12 w-auto mx-auto block" />
                </a>
              </div>
            </div>
            <div>
              <Switch>
                <Route exact path="/auth/forgot-password/:email?" component={ForgotPassword} />
                <Route exact path="/auth/login" component={Login} />
                <Route exact path="/auth/register" component={Register} />
                <Route exact path="/auth/reset-password" component={ResetPassword} />
                <Route exact path="/auth/sign-with-link" component={SignWithLink} />
                <Route exact path="/auth/login-by-link" component={LoginByEmail} />
                <Redirect from="/" exact to="/auth/login" />
                <Redirect from="/auth" exact to="/auth/login" />
              </Switch>
            </div>
          </div>
        </div>
      </div>
      <ImpersonationModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Auth;
