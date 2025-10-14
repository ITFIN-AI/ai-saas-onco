import React, { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { store } from '~/initializeStore';
import AuthChecker from './components/AuthChecker/AuthChecker';
import Auth from './pages/Auth/Auth';
import Welcome from './pages/Welcome';
import ProtectedRoute from '~/components/ProtectedRoute/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import FullPageLoader from '~/components/FullPageLoader/FullPageLoader';
const Dashboard = lazy(() => import('~/pages/Dashboard/Dashboard'));

const AppRoutes = () => (
  <AuthChecker>
    <Switch>
      <Route path="/auth" component={Auth} />
      <ProtectedRoute path="/" component={Dashboard} />
    </Switch>
  </AuthChecker>
);

const Routes = () => {
  return (
    <>
      <Suspense fallback={<FullPageLoader />}>
        <Switch>
          <Route path="/" exact component={Welcome} />
          <Route path="/auth" component={Auth} />
          <Route path="/dashboard" component={AppRoutes} />
        </Switch>
      </Suspense>
    </>
  );
};

function App() {
  const { i18n } = useTranslation('common');

  useEffect(() => {
    if (['pl', 'en'].includes(i18n.language) || !i18n.language) {
      return;
    }
    const [lang] = i18n.language.split('-');
    i18n.changeLanguage(lang || 'en');
  }, [i18n]);

  return (
    <Provider store={store}>
      <Router basename="/">
        <Routes />
      </Router>
    </Provider>
  );
}

export default App;
