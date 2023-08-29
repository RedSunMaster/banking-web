import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/theme.css';

import NavBar from './components/navbar';
import Home from './components/home';
import { Login } from './pages/login';
import { Transactions } from './pages/transactions';
import { Balances } from './pages/balances'
import checkIsLoggedIn from './auth/auth';
import { useNavigate } from 'react-router-dom';

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
  return (
    <div>
        <Router>

          <ThemeProvider theme={themeOptions}>
          <NavBar />
          </ThemeProvider>
          <div className='content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/money-owed" element={<></>} />
          </Routes>
          </div>
        </Router>
      </div>
    
  );
}

export default App;
