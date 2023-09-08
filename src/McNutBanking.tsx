import React, { lazy, Suspense } from 'react';
import Cookies from 'js-cookie';
import { DatabaseInformationProvider } from './utils/DatabaseInformation';
import checkIsLoggedIn from './auth/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {createTheme,ThemeProvider} from "@mui/material/styles";
import {Login} from './pages/login';
import NavBar from './components/navbar';

const MoneyOwed = lazy(() => import('./pages/money-owed') as unknown as Promise<{ default: React.ComponentType }>);
const Dashboard = lazy(() => import('./pages/dashboard') as unknown as Promise<{ default: React.ComponentType }>);
const Account = lazy(() => import('./pages/account') as unknown as Promise<{ default: React.ComponentType }>);
const Budget = lazy(() => import('./pages/budget') as unknown as Promise<{ default: React.ComponentType }>);
const Transactions = lazy(() => import('./pages/transactions') as unknown as Promise<{ default: React.ComponentType }>);
const PasswordReset = lazy(() => import('./pages/passwordReset') as unknown as Promise<{ default: React.ComponentType }>);
const Navigate = lazy(() =>
  import('react-router-dom').then(({ Navigate }) => ({ default: Navigate }))
);




const themeOptions = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#284B63',
    },
    secondary: {
      main: '#102633',
    },
    background: {
      default: '#EEF0EB',
    },
  },
});

function McNutBanking() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    if (Cookies.get('authToken')) {
      checkIsLoggedIn().then((result) => {
        setIsLoggedIn(result);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setIsLoggedIn(false);
    }    
  }, []);

  // Check if the databaseInformation state is undefined

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Router>
        <ThemeProvider theme={themeOptions}>
          <DatabaseInformationProvider>
            <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </DatabaseInformationProvider>
          <div className="content">
            <Routes>
            <Route path="/reset-password" element={
              <Suspense fallback={<div>Loading...</div>}>
                <PasswordReset />
              </Suspense>
            } />
              <Route
                path="/"
                element={isLoggedIn ? 
                (
                <DatabaseInformationProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                    </Suspense>
                </DatabaseInformationProvider>
                 ): (<Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>)}
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Dashboard />
                      </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>

                  )
                }
              />
              <Route
                path="/login"
                element={<Login setIsLoggedIn={setIsLoggedIn} />}
              />
              <Route
                path="/transactions"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                      <Transactions />
                      </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/owed"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                      <MoneyOwed />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/account"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                    <Account />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/budget"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                    <Budget />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<div>Loading...</div>}><Navigate to="/login" /></Suspense>
                  )
                }
              />
            </Routes>
          </div>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default McNutBanking;
