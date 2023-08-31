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
import TransactionItem from './types/Transaction';
import CategoryItem from './types/CategoryItem';
import BalanceItem from './types/BalanceItem';
import UserItem from './types/UserItem';
import { Navigate } from "react-router-dom";

import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles";
import { Dashboard } from './pages/dashboard';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    checkIsLoggedIn().then((result) => {
      setIsLoggedIn(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Router>
        <ThemeProvider theme={themeOptions}>
          <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <div className='content'>
            <Routes>
            <Route path="/" element={isLoggedIn ? (<Home />) : (<Navigate to="/login" />)}/>
            <Route path="/dashboard" element={isLoggedIn ? (<Dashboard />) : (<Navigate to="/login" />)}  />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/money-owed" element={<></>} />
            </Routes>
            </div>
          </ThemeProvider>
        </Router>
      </div>
    
  );
}

export default App;
