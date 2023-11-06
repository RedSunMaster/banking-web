import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Alert, Button, Grid, Snackbar, ThemeProvider, createTheme } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}


export const Login = ({setIsLoggedIn}: LoginProps) => {
  const [email, setEmail] = useState('');
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [postMsg, setPostMsg] = React.useState('')
  const [openAlert, setOpenAlert] = React.useState(false);
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

      


  const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const navigate = useNavigate();

  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${rootUrl}/api/login`, { email, password });
      Cookies.set('authToken', response.data, {expires: 7});
      setIsLoggedIn(true)
      setPostMsg("Logged In")
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle Axios error
        const responseData = error.response?.data;
        setPostMsg("Error: " + responseData)
      } else {
      }

    }
    setOpenAlert(true);
  };

  const forgotPassword = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${rootUrl}/api/reset-password`, { email });
      if (response.status === 200) {  
        setPostMsg("Password Reset Email Sent")
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        setPostMsg("Error: " + responseData)
      } else {
      }

    }
    setOpenAlert(true);
  };



  const handleRegister = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${rootUrl}/api/register`, { fName, lName, email, phone, password });
      Cookies.set('authToken', response.data);
      setIsLoggedIn(true)
      navigate('/dashboard')
      setPostMsg("Successfully Registered")

    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle Axios error
        const responseData = error.response?.data;
        setPostMsg("Error: " + responseData)
      } else {
      }
    }
    setOpenAlert(true);
  };
  

  return (
    <Grid container justifyContent="center" alignItems="top" style={{ minHeight: '100vh' }}>
    <Grid item xs={12} sm={8} md={6} lg={5} xl={4}>
    <Box justifyContent="center" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
        {postMsg}
      </Alert>
    </Snackbar>
      <TabContext value={value} >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <TabList onChange={handleChange}>
          <Tab label="Login" value="1" />
          <Tab label="Register" value="2" />
        </TabList>
        </Box>
          <TabPanel value="1" >
            <Box sx={{ flexGrow: 1 }}>
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
              <Box display={'flex'} flexDirection={'row'}>  
                <Button variant="outlined" fullWidth sx={{ marginTop: 1, marginRight: 2}} onClick={forgotPassword}>Forgot Password</Button>      
                <Button variant="contained" fullWidth sx={{ marginTop: 1}} onClick={handleSubmit}>Login</Button>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value="2">
            <Box sx={{ flexGrow: 1 }}>
              <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
                  {postMsg}
                </Alert>
              </Snackbar>
              <h2 className='pageTitle'>Register</h2>
              <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
                <InputLabel htmlFor="outlined-adornment-fName">First Name</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-fName"
                  label="First Name"
                  type="text"
                  inputProps={{
                    autoComplete: 'name given-name',
                  }}
                  onChange={(event) => setfName(event.target.value)}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-lName">Last Name</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-lNmae"
                  label="Last Name"
                  type="text"
                  inputProps={{
                    autoComplete: 'name family-name',
                  }}
                  onChange={(event) => setlName(event.target.value)}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-email"
                  label="Email"
                  type="email"
                  inputProps={{
                    autoComplete: 'username',
                  }}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-phone">Phone</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-phone"
                  label="Phone"
                  type="number"
                  inputProps={{
                    autoComplete: 'phone',
                  }}
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
              <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleRegister}>Register</Button>
            </Box>
          </TabPanel>
      </TabContext>
    </Box>
    </Grid>
    </Grid>
  );
};
