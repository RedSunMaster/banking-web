import React from 'react';
import { Link } from 'react-router-dom';

export const NavBar = () => (
    <div className="topnav on-background">
        <a href="balances" className='background-text'>Balances</a>
        <a href="transactions" className='background-text'>Transactions</a>
        <a href="money-owed" className='background-text'>Money Owed</a>
        <a href="login" className="split background-text">Login / Register</a>
    </div>
);
