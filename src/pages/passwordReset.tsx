import { VisibilityOff, Visibility } from '@mui/icons-material';
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Button, Alert, Snackbar } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography/Typography';
import axios, { AxiosError } from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-virtualized/styles.css'; // only needs to be imported once

export const PasswordReset = () => {
  const [password, setPassword] = React.useState('');
  const [resetPasswordToken, setResetPasswordToken] = React.useState('');
  const [postMsg, setPostMsg] = React.useState('')
  const [openAlert, setOpenAlert] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    if (token) {
      setResetPasswordToken(token)
    }
  }, [])



  
      


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

  const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""


  const navigate = useNavigate()

  const handlePasswordReset = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${rootUrl}/api/update-password`, { password, resetPasswordToken });
      if (response.status === 200) {
        setPostMsg("Password Reset")
        navigate('/login')
      }
    } catch(err) {
      if (err instanceof AxiosError) {
        // Handle Axios error
        const responseData = err.response?.data;
        setPostMsg("Error: " + responseData)
      } else {
        console.error(err)
      }
    }
    setOpenAlert(true);
  };

    return (
      <Box sx={{ flexGrow: 1, flexDirection:'column'}}>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
            {postMsg}
          </Alert>
        </Snackbar>
        <Typography variant='h4' sx={{textAlign: 'center'}}>
          Password Reset
        </Typography>
        <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
          <InputLabel>New Password</InputLabel>
          <OutlinedInput
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
            label="New Password"
          />
        </FormControl>
        <Button variant="contained" fullWidth sx={{ marginTop: 1}} onClick={handlePasswordReset}>Reset Password</Button>

      </Box>
    );    
};


export default PasswordReset