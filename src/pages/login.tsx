import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

export function Login({setIsLoggedIn}: LoginProps) {
  const [email, setEmail] = useState('');
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };


  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const navigate = useNavigate();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      Cookies.set('authToken', response.data);
      setIsLoggedIn(true)
      navigate('/dashboard')
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      if (password == confirmPassword) {
        const response = await axios.post('/api/register', { fName, lName, email, phone, password });
        Cookies.set('authToken', response.data);
        setIsLoggedIn(true)
        navigate('/dashboard')
      }

    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <Box justifyContent="center" sx={{ display: 'flex', flexDirection: 'column'}}>
      <TabContext value={value} >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', alignContent:'center', display:'flex', width:'100%' }}>
            <TabList onChange={handleChange} >
              <Tab label="Login" value="1" />
              <Tab label="Register" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
          <div>
            <h2 className='pageTitle'>Login</h2>
            <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
              <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                label="Email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                onChange={(event) => setPassword(event.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleSubmit}>Login</Button>
          </div>
          </TabPanel>
          <TabPanel value="2">
          <div>
            <h2 className='pageTitle'>Register</h2>
            <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
              <InputLabel htmlFor="outlined-adornment-fName">First Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-fName"
                label="First Name"
                type="text"
                onChange={(event) => setfName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-lName">Last Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-lNmae"
                label="Last Name"
                type="text"
                onChange={(event) => setlName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                label="Email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-phone">Phone</InputLabel>
              <OutlinedInput
                id="outlined-adornment-phone"
                label="Phone"
                type="number"
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                onChange={(event) => setPassword(event.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{
                  autoComplete: 'new-password',
                }}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password"
              type={showPassword ? 'text' : 'password'}
              onChange={(event) => setConfirmPassword(event.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
              inputProps={{
                autoComplete: '',
              }}
            />
          </FormControl>
            <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleRegister}>Register</Button>
          </div>
          </TabPanel>
      </TabContext>
    </Box>
  );
};
