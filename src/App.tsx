import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './utils/theme.css';

import { NavBar } from './components/navbar';
import { Login } from './pages/login';
import { Balances } from './pages/balances'

function App() {
  return (
    <div>
      <NavBar />
      <div className='content'>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/transactions" element={<></>} />
            <Route path="/money-owed" element={<></>} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
