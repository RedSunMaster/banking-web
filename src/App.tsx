import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/theme.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import NavBar from './components/navbar';
import Home from './components/home';
import { Login } from './pages/login';
import { Transactions } from './pages/transactions';
import { Balances } from './pages/balances'
import checkIsLoggedIn from './auth/auth';
import TransactionItem from './types/Transaction';
import CategoryItem from './types/CategoryItem';
import BalanceItem from './types/BalanceItem';
import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles";

const themeOptions = createTheme({
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


function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [DatabaseInformation, setDatabaseInformation] = React.useState<{
    transactions: TransactionItem[];
    balances: BalanceItem[];
    categories: CategoryItem[];
  }>({
    transactions: [],
    balances: [],
    categories: [],
  });
    React.useEffect(() => {
  checkIsLoggedIn().then(setIsLoggedIn);
  }, []);
  
  useEffect(() => {
    if (isLoggedIn) {
      const fetchTransactions = async () => {
        const authToken = Cookies.get('authToken');
        const response = await axios.get('/api/transactions', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const formattedData = response.data.map((transaction: TransactionItem) => ({
          ...transaction,
          Date: new Date(transaction.Date),
        }));
        setDatabaseInformation((prevState) => ({
          ...prevState,
          transactions: formattedData,
        }));
      };
      fetchTransactions();
      
      
      const fetchBalances = async () => {
        try {
          const authToken = Cookies.get('authToken');
          console.log(authToken);
          const response = await axios.get<BalanceItem[]>('/api/balances', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          setDatabaseInformation((prevState) => ({
            ...prevState,
            balances: response.data,
          }));
        } catch (error) {
          console.error(error);
        }
      };
      fetchBalances();

      const fetchCategories = async () => {
        try {
          const authToken = Cookies.get('authToken');
          console.log(authToken);
          const response = await axios.get<CategoryItem[]>('/api/categories', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          setDatabaseInformation((prevState) => ({
            ...prevState,
            categories: response.data,
          }));
        } catch (error) {
          console.error(error);
        }
      };
      fetchCategories();

    }
    
  }, [isLoggedIn]);
  
  return (
    <div>
        <Router>

          <ThemeProvider theme={themeOptions}>
          <NavBar isLoggedIn={isLoggedIn} />
          </ThemeProvider>
          <div className='content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/balances" element={<Balances DatabaseInformation={DatabaseInformation} />} />
            <Route path="/transactions" element={<Transactions DatabaseInformation={DatabaseInformation} />} />
            <Route path="/money-owed" element={<></>} />
          </Routes>
          </div>
        </Router>
      </div>
    
  );
}

export default App;
