import { Component, createEffect, onError, useContext } from 'solid-js';

import { AuthContext } from './providers/AuthProvider';
import { Dashboard } from './views/Dashboard';
import { Login } from './views/Login';

const App: Component = () => {
  const [auth] = useContext(AuthContext);

  createEffect(() => {
    console.log("Authentication status:", auth.authenticated)
  })

  return (
    <>
      {auth.authenticated ? <Dashboard /> : <Login />}
    </>
  );
};

export default App;
