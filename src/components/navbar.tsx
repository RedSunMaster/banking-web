import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

interface NavBarProps {
  isLoggedIn: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ isLoggedIn }) => {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log(Cookies.get('authToken'))
      await axios.post('/api/logout', {}, {
        headers: { Authorization: `Bearer ${Cookies.get('authToken')}` }
      });
      Cookies.set('authToken', "");
      navigate('/login');
      window.location.reload()
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="topnav on-background">
        <a className="burger-menu" onClick={() => setShowMenu(!showMenu)}>☰</a>
        <div className={`menu ${showMenu ? 'show' : ''}`}>
          <a href="balances" className='background-text'>Balances</a>
          <a href="transactions" className='background-text'>Transactions</a>
          <a href="money-owed" className='background-text'>Money Owed</a>
          {isLoggedIn ? (
            <>
              <a className='split' onClick={() => setShowModal(true)}>Logout</a>
              {showModal && (
                <div className="modal">
                  <div className="modal-content">
                    <h2>Are you sure you want to log out?</h2>
                    <a onClick={handleLogout}>Logout</a>
                    <a onClick={() => setShowModal(false)}>Cancel</a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <a href="login" className="split background-text">Login / Register</a>
          )}
        </div>
      </div>

      {/* Add this style tag to your code */}
      <style>{`

      `}</style>
    </>
  );
};
