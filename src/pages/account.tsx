import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Button, Grid, Snackbar } from '@mui/material';
import { DatabaseInformationContext } from '../utils/DatabaseInformation';
import Alert from '@mui/lab/Alert';
import checkIsLoggedIn from '../auth/auth';
import { useNavigate } from 'react-router-dom';



export const Account = () => {
    const { user, setUpdateUser } = React.useContext(DatabaseInformationContext);
  const [email, setEmail] = useState('');
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [phone, setPhone] = useState('');
  const [postMsg, setPostMsg] = React.useState('')
  const [openAlert, setOpenAlert] = React.useState(false);


    const navigate = useNavigate()
    
    const onVisibilityChange = React.useCallback(() => {
      if (document.visibilityState === "visible") {
        checkIsLoggedIn().then((result) => {
          if (!result) {
            navigate('/login');
          }
        });
      }
    }, [navigate]); // Include all dependencies that the function relies on
    
  
    React.useLayoutEffect(() => {
      document.addEventListener("visibilitychange", onVisibilityChange);
  
      return () =>
        document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [onVisibilityChange]);


    React.useEffect(() => {
        checkIsLoggedIn().then((result) => {
            if (!result) {
                navigate('/login')
            }
          })
    if (user.fName === "") {
        setUpdateUser(true);
    }
    }, [navigate, setUpdateUser, user.fName]);

  React.useEffect(() => {

    if (user) {
        setfName(user.fName)
        setlName(user.lName)
        setEmail(user.email)
        setPhone(user.phone)
    }
  }, [user]);

  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleUpdateUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
        const authToken = Cookies.get('authToken')
        const rootUrl = process.env.NODE_ENV === "production" ? "https://banking.mcnut.net:8080" : ""
        const response = await axios.patch(`${rootUrl}/api/user`, { fName, lName, email, phone },{
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
            setPostMsg("Successfully Updated User");
            setUpdateUser(true);
          } else {
            setPostMsg("Error" + response.statusText);
          }
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
    <Box sx={{ flexGrow: 1 }}>
        <Snackbar open={openAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} sx={{ width: '100%' }}>
          {postMsg}
        </Alert>
        </Snackbar>
    <Box justifyContent="center" sx={{ display: 'flex', flexDirection: 'column'}}>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', width: '100%' }}>
        </Box>
          <div>
            <h2 className='pageTitle'>Account Settings</h2>
            <FormControl fullWidth sx={{ marginTop: 1 }}  variant="outlined">
              <InputLabel htmlFor="outlined-adornment-fName">First Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-fName"
                label="First Name"
                type="text"
                value={fName}
                onChange={(event) => setfName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-lName">Last Name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-lNmae"
                label="Last Name"
                type="text"
                value={lName}
                onChange={(event) => setlName(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-phone">Phone</InputLabel>
              <OutlinedInput
                id="outlined-adornment-phone"
                label="Phone"
                type="number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormControl>
            <Button variant="outlined" fullWidth sx={{ marginTop: 1}} onClick={handleUpdateUser}>Update Account</Button>
          </div>
    </Box>
    </Box>
    </Grid>
    </Grid>
  );
};



export default Account;