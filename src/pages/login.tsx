import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      Cookies.set('authToken', response.data);
    } catch (error) {
      console.error(error);
    }
  };

    return (
        <form onSubmit={handleSubmit}>
            <label className="on-background-text">
            Email:
            <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
            />
        </label>
        <br />
        <label className="on-background-text">
            Password:
                <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                />
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
  );
};
