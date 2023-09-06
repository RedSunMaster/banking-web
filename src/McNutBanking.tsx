import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './utils/theme.css';
import NavBar from './components/navbar';
import checkIsLoggedIn from './auth/auth';
import { Navigate } from "react-router-dom";
import {createTheme,ThemeProvider} from "@mui/material/styles";
import BalanceItem from './types/BalanceItem';
import CategoryItem from './types/CategoryItem';
import TransactionItem from './types/Transaction';
import UserItem from './types/UserItem';
import { DatabaseInformationProvider } from './utils/DatabaseInformation';
import {Login} from './pages/login'
const MoneyOwed = lazy(() => import('./pages/money-owed') as unknown as Promise<{ default: React.ComponentType }>);
const Dashboard = lazy(() => import('./pages/dashboard') as unknown as Promise<{ default: React.ComponentType }>);
const Account = lazy(() => import('./pages/account') as unknown as Promise<{ default: React.ComponentType }>);
const Budget = lazy(() => import('./pages/budget') as unknown as Promise<{ default: React.ComponentType }>);
const Transactions = lazy(() => import('./pages/transactions') as unknown as Promise<{ default: React.ComponentType }>);


const emptyUserItem: UserItem = {
  fName: "",
  lName: "",
  authToken: "",
  userId: 0,
  email: "",
  phone: "",
};




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
  const [databaseInformation, setDatabaseInformation] = React.useState<{
    transactions: TransactionItem[];
    balances: BalanceItem[];
    categories: CategoryItem[];
    user: UserItem;
  }>({
    transactions: [],
    balances: [],
    categories: [],
    user: emptyUserItem,
  });

  React.useEffect(() => {
    checkIsLoggedIn().then((result) => {
      setIsLoggedIn(result);
      setIsLoading(false);
    });
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
              <Route
                path="/"
                element={isLoggedIn ? 
                (
                <DatabaseInformationProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                  </Suspense>
                </DatabaseInformationProvider>
                 ): (<Navigate to="/login" />)}
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
                    <Navigate to="/login" />
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
                    <Navigate to="/login" />
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
                    <Navigate to="/login" />
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
                    <Navigate to="/login" />
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
                    <Navigate to="/login" />
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
