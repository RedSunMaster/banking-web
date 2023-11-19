import React, { lazy, Suspense } from 'react';
import Cookies from 'js-cookie';
import { DatabaseInformationProvider } from './utils/DatabaseInformation';
import checkIsLoggedIn from './auth/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {createTheme,ThemeProvider} from "@mui/material/styles";
import {Login} from './pages/login';
import NavBar from './components/navbar';
import CssBaseline from "@mui/material/CssBaseline";
import { CircularProgress } from '@mui/material';



const MoneyOwed = lazy(() => import('./pages/money-owed') as unknown as Promise<{ default: React.ComponentType }>);
const Goals = lazy(() => import('./pages/goals') as unknown as Promise<{ default: React.ComponentType }>);
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
      main: '#aeb2af',
    },
    secondary: {
      main: '#ebeaeb',
    },
    background: {
      default: '#fdfcfd',
    },
    text: {
      primary: '#100f10',
    },
    info: {
      main: '#e0dee0',
    }

  },
});
const darkThemeOptions = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#4d514e',
    },
    secondary: {
      main: '#151415',
    },
    background: {
      default: '#030203',
    },
    text: {
      primary: '#f0eff0',
    },
    info: {
      main: '#141314',
    }

  },
});

function McNutBanking() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

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
    return <CircularProgress />
  }

  return (
    <div>
      <Router>
      <ThemeProvider theme={isDarkMode ? darkThemeOptions : themeOptions}>
        <CssBaseline enableColorScheme/>
          <DatabaseInformationProvider>
            <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </DatabaseInformationProvider>
          <div className="content">
            <Routes>
            <Route path="/reset-password" element={
              <Suspense fallback={<CircularProgress />}>
                <PasswordReset />
              </Suspense>
            } />
              <Route
                path="/"
                element={isLoggedIn ? 
                (
                <DatabaseInformationProvider>
                  <Suspense fallback={<CircularProgress />}>
                    <Dashboard />
                    </Suspense>
                </DatabaseInformationProvider>
                 ): (<Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>)}
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<CircularProgress />}>
                        <Dashboard />
                      </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>

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
                      <Suspense fallback={<CircularProgress />}>
                      <Transactions />
                      </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/owed"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<CircularProgress />}>
                      <MoneyOwed />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/goals"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<CircularProgress />}>
                      <Goals />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/account"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<CircularProgress />}>
                    <Account />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>
                  )
                }
              />
              <Route
                path="/budget"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Suspense fallback={<CircularProgress />}>
                    <Budget />
                    </Suspense>
                    </DatabaseInformationProvider>
                  ) : (
                    <Suspense fallback={<CircularProgress />}><Navigate to="/login" /></Suspense>
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
