import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/theme.css';

import { NavBar } from './components/navbar';
import { Login } from './pages/login';
import { Transactions } from './pages/transactions';
import { Balances } from './pages/balances'
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles";


const theme = createTheme({
  palette: {
    mode: 'dark'
  },
  typography: {
    fontSize: 14
  },
});


async function checkIsLoggedIn(): Promise<boolean> {
  try {
    const authToken = Cookies.get('authToken');
    const response = await axios.get('/api/login', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error);
    return false
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkIsLoggedIn().then(setIsLoggedIn);
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <div>
        <Router>
          <NavBar isLoggedIn={isLoggedIn} />
          <div className='content'>
          <Routes>
          
            <Route path="/login" element={<Login />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/money-owed" element={<></>} />
          
          </Routes>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
