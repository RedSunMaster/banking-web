import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './utils/theme.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import NavBar from './components/navbar';
import { Login } from './pages/login';
import { Transactions } from './pages/transactions';
import { Home } from './pages/home'
import checkIsLoggedIn from './auth/auth';
import UserItem from './types/UserItem';
import { Navigate } from "react-router-dom";
import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles";
import { Dashboard } from './pages/dashboard';
import { fetchTransactions, fetchBalances, fetchCategories, fetchUser } from './utils/DatabaseInformation';
import BalanceItem from './types/BalanceItem';
import CategoryItem from './types/CategoryItem';
import TransactionItem from './types/Transaction';
import { DatabaseInformationProvider } from './utils/DatabaseInformation';
import MoneyOwed from './pages/money-owed';
import { Account } from './pages/account';


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

  React.useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        const transactions = await fetchTransactions();
        const balances = await fetchBalances();
        const categories = await fetchCategories();
        const user = await fetchUser();

        if (balances && transactions && categories && user) {
          setDatabaseInformation({
            transactions,
            balances,
            categories,
            user,
          });
        }
      };
      fetchData();
    }
  }, [isLoggedIn]);

  // Check if the databaseInformation state is undefined

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Router>
        <ThemeProvider theme={themeOptions}>
          <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <div className="content">
            <Routes>
              <Route
                path="/"
                element={isLoggedIn ? 
                (
                <DatabaseInformationProvider>
                  <Dashboard />
                </DatabaseInformationProvider>
                 ): (<Navigate to="/login" />)}
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <DatabaseInformationProvider>
                      <Dashboard />
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
                    <Transactions />
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
                    <MoneyOwed />
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
                    <Account />
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
